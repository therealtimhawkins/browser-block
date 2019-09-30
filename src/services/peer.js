import Peer from 'simple-peer'

const peer = new Peer({
  initiator: this.initiator,
  trickle: false
})

peer.on('signal', data => {
  this.outgoing = JSON.stringify(data)
})

peer.on('connect', () => {
  this.peer.send('Hi, welcome to browser coin.')
})

peer.on('data', data => {
  this.message = data
})
