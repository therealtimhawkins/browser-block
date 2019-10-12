import logger from './logger'

export const router = data => {
  logger('Router action', data.action)
  switch (data.action) {
    case 'PAIR':
      // this.$store.commit('updateNodeBlackList', {
      //   ids: data.body.pairedNodeIds,
      //   parentId: data.id
      // })
      // this.connectToPeer(data.id, true)
      break
    case 'TRANSFER_PAIR':
      logger('Transfer data', data.body)
      break
    default:
      break
  }
}
