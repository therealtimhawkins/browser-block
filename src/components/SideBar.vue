
<template>
  <aside class="section">
    <div class>Logs</div>
    <br />
    <div v-for="(log) in this.logs" :key="log.id">
      <div class="box" id="log-box">
        <div class="columns">
          <div class="column is-one-quarter has-text-weight-semibold">{{log.timestamp}}</div>
          <div class="column">
            <span class="has-text-weight-semibold">{{log.title}} -</span>
            {{log.message}}
          </div>
        </div>
      </div>
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

<style scoped>
#log-box {
  margin-bottom: 8px;
}
</style>
