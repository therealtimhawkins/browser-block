<template>
  <div id="app">
    <section class="columns">
      <div class="column is-one-third">
        <SideBar />
      </div>
      <div class="column">
        <Peer />
      </div>
    </section>
  </div>
</template>

<script>
import Peer from "./network/Peer.vue";
import SideBar from "./components/SideBar.vue";

export default {
  name: "app",
  components: {
    Peer,
    SideBar
  }
};
</script>
