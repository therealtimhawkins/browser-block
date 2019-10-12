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
  computed() {
    mapState(["pairedNodes"]);
  },
  mounted() {
    this.nodes.push({
      id: this.$store.getters.id,
      _color: "palegreen"
    });

    this.$store.getters.pairedNodes.forEach(node => {
      this.nodes.push({
        id: node.id,
        _color: "coral"
      });

      this.links.push({
        sid: this.$store.getters.id,
        tid: node.id,
        _color: "gray"
      });
    });

    this.$store.getters.nodeBlackList.forEach(node => {
      this.node.push({
        id: node.id,
        _color: "yellow"
      });

      this.links.push({
        sid: node.parentId,
        tid: node.id,
        _color: "gray"
      });
    });
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
  }
};
</script>
