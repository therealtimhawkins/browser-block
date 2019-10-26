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
import Peer from "peerjs";
import * as Network from "../services/network/index";
import { logger } from "../services/logger";
import { router } from "../services/router";
import * as Connection from "../services/handshake";
import * as Actions from "../services/actions";
import { connectToPeer, requestConnection } from "../services/peer/index";
import { request } from "http";

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
    this.peer = Network.initPeer(Network.getId());
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
        const connRequest = await Connection.get(Network.getId());
        const isLinked = Network.isLinked(connRequest.requestId);
        if (
          connRequest.requestId &&
          !isLinked &&
          Network.getPairedNodes().length < this.maxNodes
        ) {
          logger("Connection ID", connRequest);
          connectToPeer(connRequest.requestId, this);
        } else if (
          connRequest.requestId &&
          Network.getPairedNodes().length === this.maxNodes
        ) {
          Actions.transferPair(Peer, connRequest);
        }
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
