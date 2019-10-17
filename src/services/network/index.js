import Peer from 'peerjs'

let peer
const pairedNodes = []
const pairedNodeIds = []

export const initPeer = id => {
  peer = new Peer(id)

  return peer
}

export const updatePairedNodes = node => {
  pairedNodes.push(node)
  pairedNodeIds.push(node.id)
}

export const getPairedNodes = () => {
  return pairedNodes
}

export const getPairedNodeIds = () => {
  return pairedNodeIds
}
