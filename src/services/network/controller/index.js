import Peer from 'peerjs'
import _ from 'lodash'
import * as uuidv1 from 'uuid/v1'
import { logger } from '../data/logger'
import { router } from '../router/router.service'

const id = uuidv1()
export let peer
export const maxNodes = 3
const pairedNodes = []
const pairedNodeIds = []
const links = []
const linkedNodeIds = []

export const getId = () => {
  return id
}

export const initPeer = myPeer => {
  peer = new Peer(id)
  peer.on('connection', connection => {
    connection.on('data', data => {
      logger('Data recieved', data)
      router(JSON.parse(data), myPeer)
    })
  })
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

export const getLinkedNodeIds = () => {
  return linkedNodeIds
}

export const isPaired = id => {
  return !_.find(pairedNodeIds, id)
}

export const isLinked = id => {
  return _.find(linkedNodeIds, id)
}
