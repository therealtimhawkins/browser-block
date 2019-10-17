import _ from 'lodash'
import { logTransaction, transactions } from './transactions'
import * as Network from './network/index'

export const pair = (Peer, node) => {
  node.send(
    JSON.stringify({
      action: 'PAIR',
      id: Peer.$store.getters.id,
      body: {
        pairedNodeIds: Network.getPairedNodeIds(),
        links: Peer.$store.getters.links,
        transactions
      }
    })
  )
}

export const makeTransaction = Peer => {
  const data = {
    action: 'TRANSACTION',
    id: Peer.$store.getters.id,
    body: {
      pairedNodeIds: Network.getPairedNodeIds(),
      links: Peer.$store.getters.links,
      message: `Transaction sent from ID=${Peer.$store.getters.id}`
    },
    history: [Peer.$store.getters.id]
  }
  sendData(data, Network.getPairedNodes())
  logTransaction(data)
}

export const networkUpdate = Peer => {
  sendData(
    {
      action: 'NETWORK_UPDATE',
      id: Peer.$store.getters.id,
      body: {
        pairedNodeIds: Network.getPairedNodeIds(),
        links: Peer.$store.getters.links
      }
    },
    Network.getPairedNodes()
  )
}

export const transferPair = (Peer, connRequest) => {
  sendData(
    {
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
      nodeObject.node.send(JSON.stringify(data))
    }
  })
}
