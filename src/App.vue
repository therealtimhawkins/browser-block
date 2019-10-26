<template>
  <section id="app" class="section">
    <!-- <div class="buttons">
      <button @click="selectView('logs')" class="button" id="logs-button">Logs</button>
      <button @click="selectView('network')" class="button" id="network-button">Network</button>
    </div>-->
    <NetworkGraph v-if="this.network" />
    <Logs v-if="this.logs" />
  </section>
</template>

<script>
import Logs from "./components/Logs.vue";
import NetworkGraph from "./components/Network";

export default {
  name: "app",
  components: {
    Logs,
    NetworkGraph
  },
  data() {
    return {
      id: null,
      network: false,
      logs: true
    };
  },
  methods: {
    selectView(view) {
      if (view === "logs") {
        this.logs = true;
        this.network = false;
      } else {
        this.logs = false;
        this.network = true;
      }
    }
  }
};
</script>
