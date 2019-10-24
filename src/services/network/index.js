import Peer from 'peerjs'
import _ from 'lodash'

let id
let peer
const pairedNodes = []
const pairedNodeIds = []
const links = []
const linkedNodeIds = []

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

const linkExists = (links, link) => {
  const check = JSON.stringify(links).indexOf(JSON.stringify(link.sort()))
  if (check != -1) {
    return true
  }
  return false
}

export const updateLink = link => {
  if (!linkExists(links, link)) {
    links.push(link.sort())
  }
  link.forEach(linkId => {
    if (linkId === id) {
      return
    }
    if (_.includes(linkedNodeIds, linkId)) {
      return
    }
    linkedNodeIds.push(linkId)
  })
}

export const updateLinks = links => {
  links.forEach(link => {
    updateLink(link)
  })
}

export const getLinks = () => {
  return links
}

export const isPaired = id => {
  return !_.find(pairedNodeIds, id)
}

export const isLinked = id => {
  return _.find(linkedNodeIds, id)
}
