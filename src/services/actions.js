import _ from 'lodash'
import { logTransaction, transactions } from './transactions'
import * as Network from './network/index'

export const pair = (Peer, node) => {
  node.send(
    JSON.stringify({
      action: 'PAIR',
      id: Network.getId(),
      body: {
        pairedNodeIds: Network.getPairedNodeIds(),
        links: Network.getLinks(),
        transactions
      }
    })
  )
}

export const makeTransaction = () => {
  const data = {
    action: 'TRANSACTION',
    id: Network.getId(),
    body: {
      pairedNodeIds: Network.getPairedNodeIds(),
      links: Network.getLinks(),
      message: `Transaction sent from ID=${Network.getId()}`
    },
    history: [Network.getId()]
  }
  sendData(data, Network.getPairedNodes())
  logTransaction(data)
}

export const networkUpdate = () => {
  sendData(
    {
      action: 'NETWORK_UPDATE',
      id: Network.getId(),
      body: {
        pairedNodeIds: Network.getPairedNodeIds(),
        links: Network.getLinks()
      }
    },
    Network.getPairedNodes()
  )
}

export const transferPair = connRequest => {
  sendData(
    {
      action: 'TRANSFER_PAIR',
      id: Network.getId(),
      body: {
        request: connRequest
      }
    },
    Network.getPairedNodes()
  )
}

export const sendData = (data, nodes, blockedNodeIds = []) => {
  nodes.forEach(nodeObject => {
    if (!_.includes(blockedNodeIds, nodeObject.id)) {
      nodeObject.node.send(JSON.stringify(data))
    }
  })
}
