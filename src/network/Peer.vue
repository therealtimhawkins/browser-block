<template>
  <div class="peer">
    <div>Hello Browser Coin</div>
    <div>{{message}}</div>
    <button class="handshake" @click="requestHandshake">Join network...</button>
  </div>
</template>

<script>
import Peer from "simple-peer";
import logger from "../services/logger";
import * as axios from "axios";
import * as uuid from "uuid/v1";
import { get } from "lodash";

export default {
  name: "Peer",
  data: function() {
    return {
      id: null,
      peer: null,
      outgoing: null,
      pollingHandshakes: null,
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
        initiator: location.hash === "#1",
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
        const response = await axios.get(
          "http://localhost:1992/handshake/queued"
        );

        const allHandshakes = response.data;

        if (this.handshakeRequested) {
          const myHandshake = this.findMyHandshake(allHandshakes);
          const response = get(myHandshake, "handshake.handshakeResponse");
          if (myHandshake && response) {
            this.handleHandshakeResponse(myHandshake.handshake);
          }
        } else {
          const handshake = allHandshakes.pop();
          const requestId = get(handshake, "requestId");
          if (requestId && requestId !== this.id) {
            this.peer.signal(JSON.parse(handshake.handshake));
            this.makeHandshakeResponse(handshake);
          }
        }
      }, 5000);
    }
  },
  beforeDestroy() {
    clearInterval(this.pollingHandshakes);
  }
};
</script>
