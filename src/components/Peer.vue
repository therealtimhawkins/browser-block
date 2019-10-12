<template>
  <section>
    <div class="buttons">
      <button @click="requestConnection" class="button" id="join-network">Join network</button>
      <button @click="sendData" class="button">Send message</button>
      <div v-if="this.pollingQueue" class="button is-success">POLLING</div>
    </div>
  </section>
</template>

<script>
import Peer from "peerjs";
import * as uuidv1 from "uuid/v1";
import * as _ from "lodash";
import { logger } from "../services/logger";
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
    sendData(data, blockedNodeId = "noidgiven") {
      this.$store.getters.pairedNodes.forEach(nodeObject => {
        if (blockedNodeId !== nodeObject.id) {
          nodeObject.node.send(JSON.stringify(data));
        }
      });
    },
    dataRouter(data) {
      logger("Router action", data.action);
      switch (data.action) {
        case "PAIR":
          data.body.pairedNodeIds.forEach(id => {
            this.$store.commit("updateNodeBlackList", {
              id: id,
              parentId: data.id
            });
          });
          data.body.nodeBlackList.forEach(node => {
            this.$store.commit("updateNodeBlackList", {
              id: node.id,
              parentId: node.parentId
            });
          });
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
              data.id
            );
          }
          break;
        case "NETWORK_UPDATE":
          logger("Updating network", data.body);
          data.body.pairedNodeIds.forEach(id => {
            this.$store.commit("updateNodeBlackList", {
              id: id,
              parentId: data.id
            });
          });
          data.body.nodeBlackList.forEach(node => {
            this.$store.commit("updateNodeBlackList", {
              id: node.id,
              parentId: node.parentId
            });
          });
          break;
        default:
          break;
      }
    }
  }
};
</script>
