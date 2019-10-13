import logger from './logger'

export const router = data => {
  logger('Router action', data.action)
  switch (data.action) {
    case 'PAIR':
      break
    case 'TRANSFER_PAIR':
      logger('Transfer data', data.body)
      break
    default:
      break
  }
}
