import Vue from 'vue'
import Vuex from 'vuex'
import * as _ from 'lodash'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    id: '',
    pairedNodes: [],
    pairedNodeIds: [],
    links: [],
    linkedNodeIds: []
  },
  mutations: {
    addId(state, id) {
      state.id = id
    },
    updatePairedNodes(state, node) {
      if (state.id !== node.id) {
        state.pairedNodes.push(node)
        state.pairedNodeIds.push(node.id)
      }
    },
    updateLinks(state, link) {
      if (!linkExists(state.links, link)) {
        state.links.push(link.sort())
      }
      link.forEach(linkId => {
        if (linkId === state.id) {
          return
        }
        if (_.includes(state.linkedNodeIds, linkId)) {
          return
        }
        state.linkedNodeIds.push(linkId)
      })
    }
  },
  getters: {
    id: state => state.id,
    pairedNodes: state => state.pairedNodes,
    pairedNodeIds: state => state.pairedNodeIds,
    links: state => state.links,
    linkedNodeIds: state => state.linkedNodeIds,
    isPaired: state => {
      return id => {
        return !_.find(state.pairedNodeIds, id)
      }
    },
    isLinked: state => {
      return id => {
        return _.find(state.linkedNodeIds, id)
      }
    }
  }
})

const linkExists = (links, link) => {
  const check = JSON.stringify(links).indexOf(JSON.stringify(link.sort()))
  if (check != -1) {
    return true
  }
  return false
}
