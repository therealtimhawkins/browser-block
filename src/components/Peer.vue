<template>
  <section>
    <div class="title is-5 has-text-link" id="id-title">{{this.$store.getters.id}}</div>
    <div class="buttons">
      <button @click="requestConnection" class="button" id="join-network">Join network</button>
      <button @click="sendTransaction" class="button" id="send-message">Send message</button>
      <button @click="showNodeList" class="button">Node list</button>
      <div v-if="this.pollingQueue" class="button is-success">POLLING</div>
    </div>
  </section>
</template>

<script>
import Peer from "peerjs";
import * as Network from "../services/network/index";
import { logger } from "../services/logger";
import { router } from "../services/router";
import * as Connection from "../services/handshake";
import * as Actions from "../services/actions";

export default {
  name: "Peer",
  data: () => {
    return {
      peer: null,
      pollingQueue: null,
      pairedNodes: [],
      maxNodes: 3
    };
  },
  created() {
    this.peer = Network.initPeer(this.$store.getters.id);
    this.peer.on("connection", connection => {
      connection.on("data", data => {
        logger("Data recieved", data);
        this.dataRouter(JSON.parse(data));
      });
    });

    this.pollQueue();
  },
  methods: {
    pollQueue() {
      logger("Polling queue...");
      this.pollingQueue = setInterval(async () => {
        const connRequest = await Connection.get(this.$store.getters.id);
        const isLinked = this.$store.getters.isLinked(connRequest.requestId);
        if (
          connRequest.requestId &&
          !isLinked &&
          this.$store.getters.pairedNodes.length < this.maxNodes
        ) {
          logger("Connection ID", connRequest);
          this.connectToPeer(connRequest.requestId);
        } else if (
          connRequest.requestId &&
          this.$store.getters.pairedNodes.length === this.maxNodes
        ) {
          Actions.transferPair(Peer, connRequest);
        }
      }, 2000);
    },
    async requestConnection() {
      const success = await Connection.request(this.$store.getters.id);
      logger(`Connection with ${this.$store.getters.id}`, { status: success });
      if (success) {
        clearInterval(this.pollingQueue);
        this.pollingQueue = false;
      }
    },
    connectToPeer(id, reply = false) {
      const noOfPairedNodes = this.$store.getters.pairedNodes.length;
      if (noOfPairedNodes < this.maxNodes) {
        const node = this.peer.connect(id);
        this.$store.commit("updatePairedNodes", { id, node });
        this.$store.commit("updateLinks", [id, this.$store.getters.id]);

        logger("Paired nodes", this.$store.getters.pairedNodes.length);
        if (!reply) {
          node.on("open", () => {
            Actions.pair(this, node);
          });
        }
      }

      if (this.$store.getters.pairedNodes.length === this.maxNodes) {
        logger("Reached node max", this.maxNodes);
        clearInterval(this.pollingQueue);
        this.pollingQueue = false;
      } else {
        this.pollQueue();
      }

      Actions.networkUpdate(this);
    },
    sendTransaction() {
      Actions.makeTransaction(this);
    },
    showNodeList() {
      logger("Node list", this.$store.getters.linkedNodeIds);
    },
    updateLinks(links) {
      links.forEach(link => {
        this.$store.commit("updateLinks", link);
      });
    },
    dataRouter(data) {
      router(data, this);
    }
  }
};
</script>
