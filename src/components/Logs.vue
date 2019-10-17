<template>
  <aside class="section">
    <Peer />
    <br />
    <div>Logs</div>
    <br />
    <div class="columns">
      <div class="column is-two-thirds">
        <div v-for="(log) in this.logs.slice().reverse()" :key="'log-' + log.id">
          <div class="box is-scrollable" id="log-box">
            <div class="columns">
              <div
                class="column is-one-quarter has-text-weight-semibold has-text-link"
                v-bind:class="getColour(log.title)"
              >{{log.timestamp}}</div>
              <div class="column">
                <span
                  class="has-text-weight-semibold has-text-link"
                  v-bind:class="getColour(log.title)"
                >{{log.title}}</span>
                <VueJsonPretty
                  id="json"
                  v-if="log.data"
                  :path="'res'"
                  :data="deepParseJson(log.data)"
                ></VueJsonPretty>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div
          v-for="(transaction) in this.transactions.slice().reverse()"
          :key="'transaction-' + transaction.id"
        >
          <div class="box is-scrollable" id="log-box">
            <div class="columns">
              <div class="column">
                <VueJsonPretty
                  id="json"
                  v-if="transaction.data"
                  :path="'res'"
                  :data="deepParseJson(transaction)"
                ></VueJsonPretty>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import Peer from "./Peer";
import { logs } from "../services/logger";
import { transactions } from "../services/transactions";
import VueJsonPretty from "vue-json-pretty";
const { deepParseJson } = require("deep-parse-json");

export default {
  name: "Logs",
  data: function() {
    return {
      logs,
      transactions,
      deepParseJson
    };
  },
  components: {
    Peer,
    VueJsonPretty
  },
  methods: {
    getColour(title) {
      switch (title) {
        case "Error":
          return "has-text-danger";
        case "Connection":
          return "has-text-success";
        default:
          return null;
      }
    }
  }
};
</script>

<style scoped>
#log-box {
  margin-bottom: 8px;
  padding: 12px 0 0 12px;
}

.columns:first-child {
  margin-bottom: 0;
}

#json {
  width: 90%;
}
</style>
