<template>
  <div class="container">
    <Button type="text" @click="showHistory">
      <svg class="icon"><use xlink:href="#history" /></svg>
      历史记录
    </Button>
    <Tree />
  </div>
</template>

<script>
import Tree from "./Tree";
const { ipcRenderer } = require("electron");

export default {
  data() {
    return {};
  },
  components: {
    Tree: Tree,
  },
  methods: {
    showHistory() {
      ipcRenderer.send("create-modal");
    },
  },
};
</script>

<style scoped>
.container {
  position: relative;
}
.control {
  position: absolute;
  display: flex;
  left: 20px;
  top: 20px;
}
</style>