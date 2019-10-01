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
    console.log(this.id);
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
      });

      peer.on("connect", () => {
        console.log("Connected.");
        peer.send(JSON.stringify({ action: "success", id: this.id }));
      });

      peer.on("data", data => {
        this.handleData(JSON.parse(new TextDecoder("utf-8").decode(data)));
      });

      return peer;
    },
    pollQueuedHandshakes() {
      console.log("Polling queued handshakes...");
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
            console.log("hit");
            this.peer.signal(JSON.parse(handshake.handshake));
            await setTimeout(async () => {
              handshakeService.makeResponse(handshake, this.outgoing, this.id);
            }, 2000);
          }
        }
      }, 2000);
    },
    pollHandshakeResponses() {
      console.log("Polling handshake responses...");
      this.pollingResponse = setInterval(async () => {
        const handshake = await handshakeService.getResponse(this.id);
        console.log("Handshake response: ", handshake);
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
      console.log("Requesting handshake...");
      const success = await handshakeService.request(this.id, this.outgoing);
      if (success) {
        this.handshakeRequested = true;
        clearInterval(this.pollingHandshakes);
        this.pollHandshakeResponses();
      }
    },
    handleData(data) {
      console.log("Handling data...");
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
            console.log("Paired nodes: ", this.pairedNodes);
          }
          break;
        case "message":
          console.log("Message from ", data.id);
          break;
        default:
      }
    },
    sendData() {
      for (let node of this.pairedNodes) {
        console.log("Messaging node: ", node.peerId);
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
