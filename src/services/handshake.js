const axios = require('axios')
const _ = require('lodash')

const makeResponse = async handshake => {
  await setTimeout(async () => {
    handshake.handshakeResponse = this.outgoing
    handshake.responseId = this.id

    await axios({
      method: 'post',
      url: 'http://localhost:1992/handshake/response',
      data: {
        handshake
      }
    })
  }, 2000)
  clearInterval(this.pollingHandshakes)
}

const handleResponse = myHandshake => {
  this.peer.signal(JSON.parse(myHandshake.handshakeResponse))
  this.pairedNodes.push(myHandshake.responseId)
  clearInterval(this.pollingHandshakes)
}

const request = async () => {
  await axios({
    method: 'post',
    url: 'http://localhost:1992/handshake',
    data: {
      id: this.id,
      handshake: this.outgoing
    }
  })
}

const find = allHandshakes => {
  let myHandshake
  for (let handshake of allHandshakes) {
    const requestId = _.get(handshake, 'handshake.requestId')
    if (requestId && requestId === this.id) {
      myHandshake = handshake
      break
    }
  }
  return myHandshake
}

export default {
  request,
  find,
  makeResponse,
  handleResponse
}
