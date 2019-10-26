import * as Actions from '../actions'
import * as Connection from '../handshake'
import * as Network from '../network/index'
import { logger } from '../logger'

export const connectToPeer = (id, Peer, reply = false) => {
  const noOfPairedNodes = Network.getPairedNodes().length
  if (noOfPairedNodes < Peer.maxNodes) {
    const node = Peer.peer.connect(id)
    Network.updatePairedNodes({ id, node })
    Network.updateLink([id, Network.getId()])

    logger('Paired nodes', Network.getPairedNodes().length)
    if (!reply) {
      node.on('open', () => {
        Actions.pair(Peer, node)
      })
    }
  }

  if (Network.getPairedNodes().length === Peer.maxNodes) {
    logger('Reached node max', Peer.maxNodes)
    clearInterval(Peer.pollingQueue)
    Peer.pollingQueue = false
  } else {
    Peer.pollQueue()
  }

  Actions.networkUpdate(Peer)
}

export const requestConnection = async Peer => {
  const success = await Connection.request(Network.getId())
  logger(`Connection with ${Network.getId()}`, { status: success })
  if (success) {
    clearInterval(Peer.pollingQueue)
    Peer.pollingQueue = false
  }
}
