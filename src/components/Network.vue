<template>
  <d3-network :net-nodes="nodes" :net-links="links" :options="options" />
</template>

<script>
import D3Network from "vue-d3-network";
import { mapState } from "vuex";
import _ from "lodash";

export default {
  name: "Network",
  components: {
    D3Network
  },
  data() {
    return {
      nodes: [],
      links: [],
      options: {
        force: 3000,
        nodeSize: 20,
        nodeLabels: true,
        linkWidth: 1
      }
    };
  },
  computed: mapState(["pairedNodes", "nodeBlackList"]),
  watch: {
    pairedNodes() {
      this.updatePairedNodes();
    },
    nodeBlackList() {
      this.updateBlackListedNodes();
    }
  },
  mounted() {
    this.nodes.push({
      id: this.$store.getters.id
    });

    this.updatePairedNodes();
    this.updateBlackListedNodes();
  },
  methods: {
    updatePairedNodes() {
      this.$store.getters.pairedNodes.forEach(node => {
        if (
          !_.find(this.nodes, {
            id: node.id
          })
        ) {
          this.nodes.push({
            id: node.id
          });
        }
        if (
          !_.find(this.links, {
            sid: this.$store.getters.id,
            tid: node.id,
            _color: "gray"
          })
        ) {
          this.links.push({
            sid: this.$store.getters.id,
            tid: node.id,
            _color: "gray"
          });
        }
      });
    },
    updateBlackListedNodes() {
      this.$store.getters.nodeBlackList.forEach(node => {
        if (
          !_.find(this.nodes, {
            id: node.id
          })
        ) {
          this.nodes.push({
            id: node.id
          });
        }
        if (
          !_.find(this.links, {
            sid: node.parentId,
            tid: node.id,
            _color: "gray"
          })
        ) {
          this.links.push({
            sid: node.parentId,
            tid: node.id,
            _color: "gray"
          });
        }
      });
    }
  }
};
</script>
