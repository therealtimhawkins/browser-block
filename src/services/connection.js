import * as axios from 'axios'
import { logger } from './logger'

export const request = async id => {
  const response = await axios({
    method: 'post',
    url: 'http://localhost:1992' + '/handshake',
    data: {
      requestId: id
    }
  })

  logger('requestHandshake', response.data)
  return response.status === 200
}

export const get = async id => {
  const response = await axios.get(
    'http://localhost:1992' + '/handshake/queued/' + id
  )
  const allHandshakes = response.data
  return allHandshakes
}
