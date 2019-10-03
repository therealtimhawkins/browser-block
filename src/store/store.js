import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    id: '',
    pairedNodes: []
  },
  mutations: {
    addId(state, id) {
      state.id = id
    },
    updatePairedNodes(state, node) {
      state.pairedNodes.push(node)
    }
  },
  getters: {
    id: state => state.id,
    pairedNodes: state => state.pairedNodes
  }
})
