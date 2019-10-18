import Peer from 'peerjs'

let id
let peer
const pairedNodes = []
const pairedNodeIds = []

export const setId = newId => {
  id = newId
}

export const getId = () => {
  return id
}

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
