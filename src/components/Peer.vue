<template>
  <section>
    <div class="buttons">
      <button @click="requestConnection" class="button">Join network</button>
      <button @click="sendData" class="button">Send message</button>
      <div v-if="this.pollingQueue" class="button is-success">POLLING</div>
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
    this.$store.commit("addId", this.id);
    logger("ID", "", this.id);
    this.peer = new Peer(this.id);

    this.peer.on("connection", connection => {
      connection.on("data", data => {
        logger("Data", "recieved", data);
        this.dataRouter(JSON.parse(data));
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
        const connRequest = await Connection.get(this.id);
        if (connRequest.requestId) {
          logger("Connection", "ID", connRequest);
          this.connectToPeer(connRequest.requestId);
        }
      }, 2000);
    },
    async requestConnection() {
      logger("Connection", "request...");
      const success = await Connection.request(this.id);
      logger("Connection", `with ${this.id}`, { status: success });
      if (success) {
        clearInterval(this.pollingQueue);
        this.pollingQueue = false;
      }
    },
    connectToPeer(id, reply = false) {
      const noOfPairedNodes = this.$store.getters.pairedNodes.length;
      if (noOfPairedNodes < 3) {
        const node = this.peer.connect(id);
        this.$store.commit("updatePairedNodes", { id, node });
        logger("Paired Nodes", "", this.$store.getters.pairedNodes.length);
        if (!reply) {
          node.on("open", () => {
            node.send(
              JSON.stringify({
                action: "PAIR",
                id: this.id,
                pairedNodeIds: this.$store.getters.pairedNodeIds
              })
            );
          });
        }
        this.pollQueue();
      }
      if (this.$store.getters.pairedNodes.length === 3) {
        logger("Paired Nodes", "MAX", 3);
        clearInterval(this.pollingQueue);
        this.pollingQueue = false;
      }
    },
    sendData() {
      this.$store.getters.pairedNodes.forEach(nodeObject => {
        nodeObject.node.send("Message from " + this.id);
      });
    },
    dataRouter(data) {
      logger("Data", "router action", data.action);
      switch (data.action) {
        case "PAIR":
          logger("Connection", "pairing", data.pairedNodesIds);
          this.connectToPeer(data.id, true);
          break;
        default:
          break;
      }
    }
  }
};
</script>
