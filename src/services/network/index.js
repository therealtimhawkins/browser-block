import Peer from 'peerjs'

let peer
const pairedNodes = []

export const initPeer = id => {
  peer = new Peer(id)

  return peer
}

export const updatePairedNodes = node => {
  pairedNodes.push(node)
}

export const getPairedNodes = () => {
  return pairedNodes
}
