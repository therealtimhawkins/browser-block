<template>
  <div class="peer">
    <div>Hello Browser Coin</div>
    <div>{{message}}</div>
    <button class="handshake" @click="requestHandshake">Join network...</button>
  </div>
</template>

<script>
import Peer from "simple-peer";
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
    async makeHandshakeResponse(handshake) {
      await setTimeout(async () => {
        handshake.handshakeResponse = this.outgoing;
        handshake.responseId = this.id;
        await axios({
          method: "post",
          url: "http://localhost:1992/handshake/response",
          data: {
            handshake
          }
        });
        console.log("Handshake requested: ", handshake);
      }, 2000);
      clearInterval(this.pollingHandshakes);
    },
    handleHandshakeResponse(myHandshake) {
      console.log("Handling handshake: ", myHandshake);
      this.peer.signal(JSON.parse(myHandshake.handshakeResponse));
      this.pairedNodes.push(myHandshake.responseId);
      clearInterval(this.pollingHandshakes);
    },
    async requestHandshake() {
      await axios({
        method: "post",
        url: "http://localhost:1992/handshake",
        data: {
          id: this.id,
          handshake: this.outgoing
        }
      });
      this.handshakeRequested = true;
    },
    findMyHandshake(allHandshakes) {
      let myHandshake;
      for (let handshake of allHandshakes) {
        const requestId = get(handshake, "handshake.requestId");
        if (requestId && requestId === this.id) {
          myHandshake = handshake;
          break;
        }
      }
      return myHandshake;
    },
    pollQueuedHandshakes() {
      this.pollingHandshakes = setInterval(async () => {
        const response = await axios.get(
          "http://localhost:1992/handshake/queued"
        );

        const allHandshakes = response.data;
        console.log("allHandshakes: ", allHandshakes);

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
            console.log("Recieved handshake: ", handshake);
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
