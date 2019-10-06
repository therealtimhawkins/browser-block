import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    id: '',
    pairedNodes: [],
    pairedNodeIds: [],
    nodeBlackList: []
  },
  mutations: {
    addId(state, id) {
      state.id = id
    },
    updatePairedNodes(state, node) {
      state.pairedNodes.push(node)
      state.pairedNodeIds.push(node.id)
    },
    updateNodeBlackList(state, ids) {
      ids.forEach(id => {
        if (state.nodeBlackList.indexOf(id) === -1) {
          state.nodeBlackList.push(id)
        }
      })
    }
  },
  getters: {
    id: state => state.id,
    pairedNodes: state => state.pairedNodes,
    pairedNodeIds: state => state.pairedNodeIds,
    nodeBlackList: state => state.nodeBlackList
  }
})
