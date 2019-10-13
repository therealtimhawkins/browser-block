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
import * as uuidv1 from "uuid/v1";
import * as _ from "lodash";
import { logger } from "../services/logger";
import { logTransaction } from "../services/transactions";
import * as Connection from "../services/handshake";

export default {
  name: "Peer",
  data: () => {
    return {
      id: null,
      peer: null,
      pollingQueue: null,
      pairedNodes: [],
      maxNodes: 2
    };
  },
  created() {
    this.id = uuidv1();
    this.$store.commit("addId", this.id);
    logger("ID", this.id);
    this.peer = new Peer(this.id);

    this.peer.on("connection", connection => {
      connection.on("data", data => {
        logger("Data recieved", data);
        this.dataRouter(JSON.parse(data));
      });
    });

    this.pollQueue();
  },
  methods: {
    nodeBlackListed(id) {
      const blackListed = this.$store.getters.nodeBlackList.indexOf(id) !== -1;
      return blackListed;
    },
    pollQueue() {
      logger("Polling queue...");
      this.pollingQueue = setInterval(async () => {
        const connRequest = await Connection.get(this.id);
        const blackListed = this.nodeBlackListed(connRequest.requestId);
        if (
          connRequest.requestId &&
          !blackListed &&
          this.$store.getters.pairedNodes.length < this.maxNodes
        ) {
          logger("Connection ID", connRequest);
          this.connectToPeer(connRequest.requestId);
        } else if (
          connRequest.requestId &&
          this.$store.getters.pairedNodes.length === this.maxNodes
        ) {
          this.sendData({
            action: "TRANSFER_PAIR",
            id: this.id,
            body: {
              request: connRequest
            }
          });
        }
      }, 2000);
    },
    async requestConnection() {
      const success = await Connection.request(this.id);
      logger(`Connection with ${this.id}`, { status: success });
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
        logger("Paired nodes", this.$store.getters.pairedNodes.length);
        if (!reply) {
          node.on("open", () => {
            node.send(
              JSON.stringify({
                action: "PAIR",
                id: this.id,
                body: {
                  pairedNodeIds: this.$store.getters.pairedNodeIds,
                  nodeBlackList: this.$store.getters.nodeBlackList
                }
              })
            );
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

      this.sendData({
        action: "NETWORK_UPDATE",
        id: this.id,
        body: {
          pairedNodeIds: this.$store.getters.pairedNodeIds,
          nodeBlackList: this.$store.getters.nodeBlackList
        }
      });
    },
    sendData(data, blockedNodeIds = []) {
      this.$store.getters.pairedNodes.forEach(nodeObject => {
        if (!_.includes(blockedNodeIds, nodeObject.id)) {
          nodeObject.node.send(JSON.stringify(data));
        }
      });
    },
    sendTransaction() {
      this.sendData({
        action: "TRANSACTION",
        id: this.id,
        body: {
          pairedNodeIds: this.$store.getters.pairedNodeIds,
          nodeBlackList: this.$store.getters.nodeBlackList,
          message: `Transaction sent from ID=${this.id}`
        },
        history: [this.id]
      });
    },
    showNodeList() {
      logger("Node list", this.$store.getters.nodeBlackList);
    },
    updateLists(data) {
      data.pairedNodeIds.forEach(id => {
        this.$store.commit("updateNodeBlackList", {
          id: id,
          parentId: data.id
        });
      });
      data.nodeBlackList.forEach(node => {
        this.$store.commit("updateNodeBlackList", {
          id: node.id,
          parentId: node.parentId
        });
      });
    },
    dataRouter(data) {
      logger("Router action", data.action);
      switch (data.action) {
        case "PAIR":
          this.updateLists(data.body);
          this.connectToPeer(data.id, true);
          break;
        case "TRANSFER_PAIR":
          logger("Transfer data", data.body);
          if (
            !_.includes(
              this.$store.getters.pairedNodesIds,
              data.body.request.requestId
            ) &&
            !_.includes(
              this.$store.getters.nodeBlackListIds,
              data.body.request.requestId
            )
          ) {
            this.connectToPeer(data.body.request.requestId);
          } else {
            this.sendData(
              {
                action: "TRANSFER_PAIR",
                body: {
                  request: data.body.request.requestId
                }
              },
              [data.id]
            );
          }
          break;
        case "NETWORK_UPDATE":
          logger("Updating network", data.body);
          this.updateLists(data.body);
          break;
        case "TRANSACTION":
          logger("Transaction", data.body.message);
          logTransaction(data);
          this.updateLists(data.body);
          data.history.push(this.id);
          this.sendData(data, data.history);
          break;
        default:
          break;
      }
    }
  }
};
</script>
