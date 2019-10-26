<template>
  <section>
    <div class="title is-5 has-text-link" id="id-title">{{this.id}}</div>
    <div class="buttons">
      <button @click="requestConnection" class="button" id="join-network">Join network</button>
      <button @click="sendTransaction" class="button" id="send-message">Send message</button>
      <button @click="showNodeList" class="button">Node list</button>
      <div v-if="this.pollingQueue" class="button is-success">POLLING</div>
    </div>
  </section>
</template>

<script>
import * as Network from "../services/network/controller/index";
import { logger } from "../services/logger";
import { router } from "../services/router";
import * as Actions from "../services/actions";
import { pollConnection, requestConnection } from "../services/peer/index";

export default {
  name: "Peer",
  data: () => {
    return {
      id: null,
      peer: null,
      pollingQueue: null,
      pairedNodes: [],
      maxNodes: 3
    };
  },
  created() {
    this.peer = Network.initPeer();
    this.id = Network.getId();
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
        pollConnection(this);
      }, 2000);
    },
    async requestConnection() {
      requestConnection(this);
    },
    sendTransaction() {
      Actions.makeTransaction(this);
    },
    showNodeList() {
      logger("Paired node list", Network.getPairedNodeIds());
      logger("Links list", Network.getLinks());
    },
    dataRouter(data) {
      router(data, this);
    }
  }
};
</script>
