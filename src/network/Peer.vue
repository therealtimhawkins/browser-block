<template>
  <section>
    <div class="buttons">
      <button @click="requestConnection" class="button">Join network</button>
      <button @click="sendData" class="button">Send message</button>
    </div>
  </section>
</template>

<script>
import Peer from "peerjs";
import * as uuidv1 from "uuid/v1";
import { logger } from "../services/logger";
import * as Connection from "../services/handshake";

export default {
  name: "Peer",
  created() {
    this.id = uuidv1();
    this.peer = new Peer(this.id);

    this.peer.on("connection", connection => {
      connection.on("data", data => {
        console.log(data);
      });
    });

    this.pollQueue();
  },
  data: function() {
    return {
      id: null,
      peer: null,
      pollingQueue: null,
      pairedNodes: []
    };
  },
  methods: {
    pollQueue() {
      logger("Polling", "queue");
      this.pollingQueue = setInterval(async () => {
        const connRequest = await Connection.get();
        if (connRequest.requestId) {
          logger("Connection", "ID", connRequest);
          this.connectToPeer(connRequest.requestId);
        }
      }, 2000);
    },
    async requestConnection() {
      logger("Connection", "request...");
      const success = await Connection.request(this.id);
      if (success) {
        clearInterval(this.pollingQueue);
      }
    },
    connectToPeer(id) {
      const node = this.peer.connect(id);
      this.pairedNodes.push({ id, node });
      node.on("open", () => {
        node.send("hi!");
      });
    },
    sendData() {
      this.pairedNodes.forEach(nodeObject => {
        nodeObject.node.send("TESTING");
      });
    }
  }
};
</script>
