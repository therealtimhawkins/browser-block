<template>
  <d3-network :net-nodes="nodes" :net-links="links" :options="options" />
</template>

<script>
import D3Network from "vue-d3-network";
import { mapState } from "vuex";

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
    nodeBlackList() {
      this.updateNodes();
    }
  },
  mounted() {
    this.nodes.push({
      id: this.$store.getters.id
    });

    this.updateNodes();
  },
  methods: {
    updateNodes() {
      this.$store.getters.nodeBlackList.forEach(node => {
        if (!this.nodeExists(node.id)) {
          this.nodes.push({
            id: node.id
          });
        }
        if (this.nodeExists(node.parentId) && this.nodeExists(node.id)) {
          this.links.push({
            sid: node.parentId,
            tid: node.id,
            _color: "gray"
          });
        }
      });
    },
    nodeExists(id) {
      return this.nodes.some(node => {
        return node.id === id;
      });
    }
  }
};
</script>
