import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    pairedNodes: []
  },
  mutations: {
    updatePairedNodes(state, node) {
      state.pairedNodes.push(node)
    }
  },
  getters: {
    pairedNodes: state => {
      return state.pairedNodes
    }
  }
})
