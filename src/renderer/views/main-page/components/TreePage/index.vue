<template>
  <div class="container">
    <div class="control">
      <Button type="text" @click="showHistory">
        <svg class="icon"><use xlink:href="#history" /></svg>
        历史记录
      </Button>
      <div style="display: flex; align-items: center">
        <div style="flex: 0 0 100px">当前阶数：</div>
        <Select v-model="degree" @on-change="changeDegree">
          <Option
            v-for="val in [3, 4, 5, 6, 7, 8, 9]"
            :value="val"
            :key="val"
            >{{ val + "阶" }}</Option
          >
        </Select>
      </div>
    </div>
    <Tree ref="tree" />
  </div>
</template>

<script>
import Tree from "./Tree";
const { ipcRenderer } = require("electron");

export default {
  data() {
    return {
      degree: 3,
    };
  },
  components: {
    Tree: Tree,
  },
  methods: {
    showHistory() {
      ipcRenderer.send("create-modal");
    },
    changeDegree(val) {
      this.$refs.tree.changeDegree(val);
    },
  },
};
</script>

<style scoped>
.container {
  position: relative;
}
.control {
  display: grid;
  margin-bottom: 20px;
  grid-template-columns: 150px 170px;
  justify-content: space-between;
}
</style>