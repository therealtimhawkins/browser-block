import * as Actions from '../actions/index'
import * as Connection from '../../handshake'
import * as Network from '../controller/index'
import { logger } from '../../logger'

export const connectToPeer = (id, Peer, reply = false) => {
  const noOfPairedNodes = Network.getPairedNodes().length
  if (noOfPairedNodes < Network.maxNodes) {
    const node = Network.peer.connect(id)
    Network.updatePairedNodes({ id, node })
    Network.updateLink([id, Network.getId()])

    logger('Paired nodes', Network.getPairedNodes().length)
    if (!reply) {
      node.on('open', () => {
        Actions.pair(node)
      })
    }
  }
  Actions.networkUpdate()

  if (Network.getPairedNodes().length === Network.maxNodes) {
    logger('Reached node max', Network.maxNodes)
    return 'Reached node max'
  }
  return 'Pair successful'
}

export const requestConnection = async () => {
  const success = await Connection.request(Network.getId())
  logger(`Connection with ${Network.getId()}`, { status: success })
  return success
}

export const pollConnection = async Peer => {
  const connRequest = await Connection.get(Network.getId())
  const isLinked = Network.isLinked(connRequest.requestId)
  if (
    connRequest.requestId &&
    !isLinked &&
    Network.getPairedNodes().length < Network.maxNodes
  ) {
    logger('Connection ID', connRequest)
    connectToPeer(connRequest.requestId, Peer)
  } else if (
    connRequest.requestId &&
    Network.getPairedNodes().length === Network.maxNodes
  ) {
    Actions.transferPair(connRequest)
    return 'Transfer pair'
  }
}
