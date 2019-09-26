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
import { find, get } from "lodash";

export default {
  name: "Peer",
  data: function() {
    return {
      id: null,
      peer: null,
      outgoing: null,
      pollingHandshakes: null,
      handshakeRequested: false,
      incomingNode: [],
      outgoingNodes: [],
      message: ""
    };
  },
  created() {
    this.id = uuid();
    this.pollQueuedHandshakes();
    this.initialPeer();
  },
  methods: {
    initialPeer: function() {
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
    handshakeResponse: async function(handshake) {
      handshake.handshakeResponse = this.outgoing;
      handshake.responseId = this.id;
      console.log("handshake: ", handshake);
      await axios.post("http://localhost:1992/handshake/response", handshake);
    },
    requestHandshake: async function() {
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
    pollQueuedHandshakes: function() {
      this.pollingHandshakes = setInterval(async () => {
        const response = await axios.get(
          "http://localhost:1992/handshake/queued"
        );

        const allHandshakes = response.data;

        if (this.handshakeRequested) {
          const myHandshake = find(allHandshakes, ["requestId", this.id]);
          console.log("myhandshake: ", myHandshake);
        } else {
          const handshake = allHandshakes.pop();
          const requestId = get(handshake, "requestId");
          if (requestId && requestId !== this.id) {
            this.peer.signal(JSON.parse(handshake.handshake));
            this.handshakeResponse(handshake);
          }
        }

        // response.data.forEach(response => {
        //   if (response.handshake !== this.outgoing) {
        //   } else {
        //     console.log("handshake: ", response.handshake);
        //     console.log("handshakeResponse: ", response.handshakeResponse);
        //     if (response.handshakeResponse) {
        //       this.handshakeResponse(response.handshakeResponse);
        //     }
        //   }
        //
      }, 5000);
    }
  },
  beforeDestroy() {
    clearInterval(this.pollingHandshakes);
  }
};
</script>
