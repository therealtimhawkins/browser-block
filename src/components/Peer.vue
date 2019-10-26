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
import { logger } from "../services/network/data/logger";
import { router } from "../services/network/router/index";
import * as Actions from "../services/network/actions/index";
import {
  pollConnection,
  requestConnection
} from "../services/network/peer/peer.service";

export default {
  name: "Peer",
  data: () => {
    return {
      id: null,
      pollingQueue: null
    };
  },
  created() {
    Network.initPeer();
    this.id = Network.getId();
    this.pollQueue();
  },
  methods: {
    pollQueue() {
      logger("Polling queue...");
      this.pollingQueue = setInterval(async () => {
        const result = await pollConnection();
        if (result === "Reached node max") {
          console.log("node max");
          clearInterval(this.pollingQueue);
          this.pollingQueue = false;
        }
        if (result === "Pair successful") {
          console.log("pair successful hit");
          this.pollQueue();
        }
      }, 2000);
    },
    async requestConnection() {
      requestConnection();
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
