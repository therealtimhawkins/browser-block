<template>
  <section>
    <div class="section">
      <div>{{message}}</div>
      <div class="buttons">
        <button @click="requestHandshake" class="button">Join network...</button>
        <button @click="sendData" class="button">Send message...</button>
      </div>
    </div>
  </section>
</template>

<script>
import Peer from "simple-peer";
import * as uuid from "uuid/v1";
import * as _ from "lodash";
import * as handshakeService from "../services/handshake";
import { logger } from "../services/logger";

export default {
  name: "Peer",
  data: function() {
    return {
      id: null,
      peer: null,
      initiator: location.hash !== "#1",
      outgoing: null,
      pollingHandshakes: null,
      pollingResponse: null,
      handshakeRequested: false,
      pairedNodes: [],
      message: ""
    };
  },
  created() {
    this.id = uuid();
    logger("ID", this.id);
    this.pollQueuedHandshakes();
    this.initialPeer();
  },
  methods: {
    initialPeer() {
      this.peer = this.createPeer();
    },
    createPeer() {
      const peer = new Peer({
        initiator: this.initiator,
        trickle: false
      });

      peer.on("signal", data => {
        this.outgoing = JSON.stringify(data);
        logger("Data", "outgoing signal " + data.type.toUpperCase());
      });

      peer.on("connect", () => {
        peer.send(JSON.stringify({ action: "success", id: this.id }));
        logger("Connection", "successful");
      });

      peer.on("data", data => {
        const parsedData = JSON.parse(new TextDecoder("utf-8").decode(data));
        logger("Data", parsedData);
        this.handleData(parsedData);
      });

      return peer;
    },
    pollQueuedHandshakes() {
      logger("Polling", "queued handshakes...");
      this.pollingHandshakes = setInterval(async () => {
        const handshake = await handshakeService.get();
        if (this.pairedNodes.length > 3) {
          this.forwardHandshake(handshake);
        } else {
          if (
            !this.handshakeRequested &&
            !this.initiator &&
            handshake.requestId
          ) {
            this.peer.signal(JSON.parse(handshake.handshake));
            await setTimeout(async () => {
              handshakeService.makeResponse(handshake, this.outgoing, this.id);
            }, 2000);
          }
        }
      }, 2000);
    },
    pollHandshakeResponses() {
      logger("Polling", "handshake responses...");
      this.pollingResponse = setInterval(async () => {
        const handshake = await handshakeService.getResponse(this.id);
        if (handshake.data.requestId) {
          this.peer.signal(JSON.parse(handshake.data.handshakeResponse));
          this.pairedNodes.push({
            peerId: handshake.data.responseId,
            peer: this.peer
          });
          this.initiator = false;
          this.peer = this.createPeer();
          this.pollQueuedHandshakes();
          clearInterval(this.pollingResponse);
        }
      }, 2000);
    },
    async requestHandshake() {
      logger("Request", "handshake...");
      const success = await handshakeService.request(this.id, this.outgoing);
      if (success) {
        this.handshakeRequested = true;
        clearInterval(this.pollingHandshakes);
        this.pollHandshakeResponses();
      }
    },
    handleData(data) {
      logger("Router", "running");
      switch (data.action) {
        case "success":
          if (this.pairedNodes.length < 3) {
            const index = _.findIndex(this.pairedNodes, node => {
              return node.peerId === data.id;
            });

            if (index < 0) {
              this.pairedNodes.push({
                peerId: data.id,
                peer: this.peer
              });
            }
            logger("Nodes", this.pairedNodes);
          }
          break;
        case "message":
          logger("Message", "recieved from " + data.id);
          break;
        default:
      }
    },
    sendData() {
      for (let node of this.pairedNodes) {
        logger("Message", "sending to " + node.peerId);
        node.peer.send(JSON.stringify({ action: "message", id: this.id }));
      }
    },
    forwardHandshake() {}
  },
  beforeDestroy() {
    clearInterval(this.pollingHandshakes);
  }
};
</script>
