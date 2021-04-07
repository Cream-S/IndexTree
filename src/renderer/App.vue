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
#app {
  min-height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  font-family: Verdana, "微软雅黑", "sans-serif";
}
</style>
