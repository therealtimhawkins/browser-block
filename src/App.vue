<template>
  <div id="app">
    <Peer />
  </div>
</template>

<script>
import Peer from "./network/Peer.vue";

export default {
  name: "app",
  components: {
    Peer
  }
};
</script>
