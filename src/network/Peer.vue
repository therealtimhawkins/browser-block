<template>
  <div class="peer">
    <div>Hello Browser Coin</div>
    <div>{{message}}</div>
    <button class="handshake" @click="requestHandshake">Join network...</button>
  </div>
</template>

<script>
import Peer from "simple-peer";
import * as uuid from "uuid/v1";
import * as handshakeService from "../services/handshake";

export default {
  name: "Peer",
  data: function() {
    return {
      id: null,
      peer: null,
      initiator: location.hash === "#1",
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
    this.pollQueuedHandshakes();
    this.initialPeer();
  },
  methods: {
    initialPeer() {
      this.peer = new Peer({
        initiator: this.initiator,
        trickle: false
      });

      this.peer.on("signal", data => {
        this.outgoing = JSON.stringify(data);
      });

      this.peer.on("connect", () => {
        this.peer.send("Hi, welcome to browser coin.");
      });

      this.peer.on("data", data => {
        this.message = data;
      });
    },
    pollQueuedHandshakes() {
      this.pollingHandshakes = setInterval(async () => {
        const handshake = await handshakeService.get();
        if (!this.handshakeRequested && !this.initiator && handshake.id) {
          this.peer.signal(JSON.parse(handshake.handshake));
          await setTimeout(async () => {
            handshakeService.makeResponse(handshake, this.outgoing, this.id);
          }, 2000);
        }
      }, 5000);
    },
    pollHandshakeResponses() {
      this.pollingResponse = setInterval(async () => {
        const handshake = await handshakeService.getResponse(this.id);
        if (handshake.data.id) {
          this.peer.signal(JSON.parse(handshake.data.handshakeResponse));
          clearInterval(this.pollingResponse);
        }
      }, 5000);
    },
    async requestHandshake() {
      const success = await handshakeService.request(this.id, this.outgoing);
      if (success) {
        this.handshakeRequested = true;
        clearInterval(this.pollingHandshakes);
        this.pollHandshakeResponses();
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.pollingHandshakes);
  }
};
</script>
