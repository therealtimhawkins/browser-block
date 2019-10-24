<template>
  <d3-network :net-nodes="nodes" :net-links="links" :options="options" />
</template>

<script>
import D3Network from "vue-d3-network";
import * as Network from "../services/network/index";

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
  watch: {
    linkedNodeIds() {
      this.updateNodes();
    }
  },
  created() {
    this.nodes.push({
      id: this.$store.getters.id,
      _color: "coral"
    });
  },
  mounted() {
    this.updateNodes();
  },
  methods: {
    updateNodes() {
      Network.getLinkedNodeIds().forEach(nodeId => {
        if (!this.nodeExists(nodeId)) {
          this.nodes.push({
            id: nodeId,
            _color: "gray",
            _labelClass: "network-node"
          });
        }
      });

      Network.getLinks().forEach(link => {
        this.links.push({ sid: link[0], tid: link[1], _color: "gray" });
      });
    },
    nodeExists(id) {
      let exists = false;
      this.nodes.forEach(node => {
        if (node.id === id) {
          exists = true;
        }
      });
      return exists;
    }
  }
};
</script>
