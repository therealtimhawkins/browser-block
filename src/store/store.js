import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    id: '',
    pairedNodes: [],
    pairedNodeIds: []
  },
  mutations: {
    addId(state, id) {
      state.id = id
    },
    updatePairedNodes(state, node) {
      state.pairedNodes.push(node)
      state.pairedNodeIds.push(node.id)
    }
  },
  getters: {
    id: state => state.id,
    pairedNodes: state => state.pairedNodes,
    pairedNodeIds: state => state.pairedNodeIds
  }
})
