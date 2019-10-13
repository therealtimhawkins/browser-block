import { logger } from './logger'
import { logTransaction } from './transactions'

export const router = (data, Peer) => {
  logger('Router action', data.action)
  switch (data.action) {
    case 'PAIR':
      Peer.updateLists(data)
      Peer.connectToPeer(data.id, true)
      break
    case 'TRANSFER_PAIR':
      logger('Transfer data', data.body)
      if (
        !Peer.$store.getters.isPaired(data.body.request.requestId) &&
        !Peer.$store.getters.isListed(data.body.request.requestId)
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
          [data.id]
        )
      }
      break
    case 'NETWORK_UPDATE':
      logger('Updating network', data.body)
      Peer.updateLists(data)
      break
    case 'TRANSACTION':
      logger('Transaction', data.body.message)
      logTransaction(data)

      Peer.updateLists(data)
      data.history.push(this.id)
      Peer.sendData(data, data.history)
      break
    default:
      break
  }
}
