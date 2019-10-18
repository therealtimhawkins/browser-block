<template>
  <section id="app" class="section">
    <div class="buttons">
      <button @click="selectView('logs')" class="button" id="logs-button">Logs</button>
      <button @click="selectView('network')" class="button" id="network-button">Network</button>
    </div>
    <NetworkGraph v-if="this.network" />
    <Logs v-if="this.logs" />
  </section>
</template>

<script>
import Logs from "./components/Logs.vue";
import NetworkGraph from "./components/Network";
import * as Network from "./components/Network";
import * as uuidv1 from "uuid/v1";
import { logger } from "./services/logger";

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
  created() {
    if (!this.id) {
      this.id = uuidv1();
      Network.setId(this.id);
      this.$store.commit("addId", this.id);
    }
    logger("ID", this.id);
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
