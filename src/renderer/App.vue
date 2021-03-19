<template>
  <div id="app">
    <Meta />
    <router-view></router-view>
  </div>
</template>

<script>
import { default as Meta } from "@/components/Meta";
export default {
  name: "com.sa",
  components: {
    Meta,
  },
};
</script>

<style>
/* CSS */
</style>
