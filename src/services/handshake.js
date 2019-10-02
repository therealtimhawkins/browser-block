import * as axios from 'axios'
import { logger } from '../services/logger'

export const makeResponse = async (data, handshakeResponse, id) => {
  data.handshakeResponse = handshakeResponse
  data.responseId = id

  const response = await axios({
    method: 'post',
    url: 'http://localhost:1992/handshake/response',
    data
  })

  logger('makeResponse', '', response.data)
  return response
}

export const getResponse = async id => {
  const response = await axios({
    method: 'get',
    url: 'http://localhost:1992/handshake/response/' + id
  })

  logger('getResponse', '', response.data)
  return response
}

export const request = async id => {
  const response = await axios({
    method: 'post',
    url: 'http://localhost:1992/handshake',
    data: {
      requestId: id
    }
  })

  logger('requestHandshake', '', response.data)
  return response.status === 200
}

export const get = async () => {
  const response = await axios.get('http://localhost:1992/handshake/queued')
  const allHandshakes = response.data
  return allHandshakes
}
