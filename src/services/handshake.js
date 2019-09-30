const axios = require('axios')

export const makeResponse = async (data, handshakeResponse, id) => {
  data.handshakeResponse = handshakeResponse
  data.responseId = id

  const response = await axios({
    method: 'post',
    url: 'http://localhost:1992/handshake/response',
    data
  })
  return response
}

export const getResponse = async id => {
  const response = await axios({
    method: 'get',
    url: 'http://localhost:1992/handshake/response/' + id
  })
  return response
}

export const request = async (id, handshake) => {
  const response = await axios({
    method: 'post',
    url: 'http://localhost:1992/handshake',
    data: {
      id: id,
      handshake: handshake
    }
  })
  return response.status === 200
}

export const get = async () => {
  const response = await axios.get('http://localhost:1992/handshake/queued')
  const allHandshakes = response.data
  return allHandshakes
}
