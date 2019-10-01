
<template>
  <aside class="section">
    <div class>Logs</div>
    <br />
    <div v-for="(log, index) in this.logs" :key="index" class="buttons">
      <div class="box">{{log.timestamp}} - {{log.message}}</div>
    </div>
  </aside>
</template>

<script>
import { logs } from "../services/logger";

export default {
  name: "SideBar",
  data: function() {
    return {
      logs: logs
    };
  },
  components: {},
  methods: {}
};
</script>
