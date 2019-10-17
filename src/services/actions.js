import _ from 'lodash'
import {
  logTransaction
} from './transactions'

export const pair = (Peer, node) => {
  node.send(
    JSON.stringify({
      action: 'PAIR',
      id: Peer.$store.getters.id,
      body: {
        pairedNodeIds: Peer.$store.getters.pairedNodeIds,
        links: Peer.$store.getters.links
      }
    })
  )
}

export const makeTransaction = Peer => {
  const data = {
    action: 'TRANSACTION',
    id: Peer.$store.getters.id,
    body: {
      pairedNodeIds: Peer.$store.getters.pairedNodeIds,
      links: Peer.$store.getters.links,
      message: `Transaction sent from ID=${Peer.$store.getters.id}`
    },
    history: [Peer.$store.getters.id]
  }
  sendData(data, Peer.$store.getters.pairedNodes)
  logTransaction(data)
}

export const networkUpdate = Peer => {
  sendData({
      action: 'NETWORK_UPDATE',
      id: Peer.$store.getters.id,
      body: {
        pairedNodeIds: Peer.$store.getters.pairedNodeIds,
        links: Peer.$store.getters.links
      }
    },
    Peer.$store.getters.pairedNodes
  )
}

export const transferPair = (Peer, connRequest) => {
  sendData({
      action: 'TRANSFER_PAIR',
      id: this.$store.getters.id,
      body: {
        request: connRequest
      }
    },
    Peer.$store.getters.pairedNodes
  )
}

const sendData = (data, nodes, blockedNodeIds = []) => {
  nodes.forEach(nodeObject => {
    if (!_.includes(blockedNodeIds, nodeObject.id)) {
      nodeObject.node.send(JSON.stringify(data));
    }
  });
}
