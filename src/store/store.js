import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    id: '',
    pairedNodes: [],
    pairedNodeIds: [],
    nodeBlackList: [],
    nodeBlackListIds: []
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
    updateNodeBlackList(state, data) {
      data.ids.forEach(id => {
        if (state.nodeBlackList.indexOf(id) === -1 && state.id !== id) {
          state.nodeBlackList.push({ parentId: data.parentId, id })
          state.nodeBlackListIds.push(id)
        }
      })
    }
  },
  getters: {
    id: state => state.id,
    pairedNodes: state => state.pairedNodes,
    pairedNodeIds: state => state.pairedNodeIds,
    nodeBlackList: state => state.nodeBlackList,
    nodeBlackListIds: state => state.nodeBlackListIds
  }
})
