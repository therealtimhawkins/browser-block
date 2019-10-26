<template>
  <section id="app" class="section">
    <Logs v-if="this.logs" />
  </section>
</template>

<script>
import Logs from "./components/Logs.vue";

export default {
  name: "app",
  components: {
    Logs
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
