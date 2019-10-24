import { logger } from './logger'
import { logTransaction, initTransactions } from './transactions'
import * as Network from './network/index'
import * as Actions from './actions'

export const router = (data, Peer) => {
  logger('Router action', data.action)
  switch (data.action) {
    case 'PAIR':
      initTransactions(data.body.transactions)
      Network.updateLinks(data.body.links)
      Peer.connectToPeer(data.id, true)
      break
    case 'TRANSFER_PAIR':
      logger('Transfer data', data.body)
      if (
        !Network.isPaired(data.body.request.requestId) &&
        !Network.isLinked(data.body.request.requestId)
      ) {
        Peer.connectToPeer(data.body.request.requestId)
      } else {
        Peer.sendData(
          {
            action: 'TRANSFER_PAIR',
            body: {
              request: data.body.request.requestId
            }
          },
          Network.getPairedNodes(),
          [data.id]
        )
      }
      break
    case 'NETWORK_UPDATE':
      logger('Updating network', data.body)
      Network.updateLinks(data.body.links)
      break
    case 'TRANSACTION':
      logger('Transaction', data.body.message)
      logTransaction(data)

      Network.updateLinks(data.body.links)
      data.history.push(Peer.$store.getters.id)
      Actions.sendData(data, Network.getPairedNodes(), data.history)
      break
    default:
      break
  }
}
