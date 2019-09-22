<template>
  <div class="peer">
    <div>Hello Browser Coin</div>
    <input v-model="incoming" />
    <button @click="submit">Submit</button>
    <div>{{outgoing}}</div>
    <div>{{message}}</div>
    <button class="handshake" @click="handshake">Join network...</button>
  </div>
</template>

<script>
import Peer from "simple-peer";
import * as axios from "axios";

export default {
  name: "Peer",
  data: function() {
    return {
      outgoing: "",
      incoming: "",
      peer: null,
      message: "",
      polling: null
    };
  },
  created() {
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

    this.pollNodes();
  },
  methods: {
    submit: function() {
      this.peer.signal(JSON.parse(this.incoming));
    },
    handshake: async function() {
      await axios({
        method: "post",
        url: "http://localhost:1992/handshake",
        data: {
          handshake: this.outgoing
        }
      });
    },
    pollNodes: function() {
      console.log("pollNodes hit");
      this.polling = setInterval(async () => {
        const response = await axios.get(
          "http://localhost:1992/node/requested"
        );
        console.log(response);
      }, 15000);
    }
  },
  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>
