<template>
  <div class="treepage-history">
    <Command @on-draw-tree="drawTree" />
    <Tree ref="tree" />
  </div>
</template>

<script>
import path from "path";
import Datastore from "nedb";
import Command from "./Command";
import Tree from "./Tree2";

global.db = new Datastore({
  filename: path.join(__static, `/oprateRecord.db`),
  autoload: true,
});

export default {
  components: {
    Command,
    Tree,
  },
  methods: {
    drawTree(cmd) {
      console.log(cmd.oprate);
      this.$refs.tree.treeData = cmd.data;
      this.$refs.tree.commands = cmd.commands;
      this.$refs.tree.oprate = cmd.oprate;
      this.$refs.tree.draw();
    },
  },
};
</script>

<style scope>
.treepage-history {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-column-gap: 20px;
  grid-template-columns: 300px auto;
}
</style>