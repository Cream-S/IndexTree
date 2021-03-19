<template>
  <div class="treepage-cmd">
    <Collapse simple accordion @on-change="onChange">
      <Panel v-for="item in treeData" :name="'' + item.name" :key="item.name">
        {{ item.title }}
        <CellGroup slot="content" @on-click="runCmd">
          <Cell
            v-for="(cmd, index) in item.cmds"
            :name="index"
            :key="index"
            :selected="cmd.active"
          >
            <p class="cmd-desc">{{ cmd.commands }}</p>
          </Cell>
        </CellGroup>
      </Panel>
    </Collapse>
  </div>
</template>

<script>
export default {
  mounted() {
    this.initCmd();
  },
  data() {
    return {
      curIdx: -1,
      curActive: [],
      treeData: [],
    };
  },
  methods: {
    initCmd() {
      db.find({}, (err, doc) => {
        // console.log(doc);
        this.treeData = doc
          .map((o) => {
            // console.log("get", o);
            return {
              title: o.oprate + " " + o.val,
              name: o._id,
              data: o.data,
              cmds: [],
            };
          })
          .sort((a, b) => a.name - b.name);
      });
    },
    runCmd(idx) {
      // if (this.curActive != idx) {
      let cur = this.treeData[this.curIdx];
      if (this.curActive.length > 0) {
        this.treeData[this.curActive[0]].cmds[this.curActive[1]].active = false;
      }
      cur.cmds[idx].active = true;
      this.curActive = [this.curIdx, idx];
      this.$emit("on-draw-tree", cur.cmds[idx]);
      // }
    },
    onChange(nameArr) {
      if (nameArr && nameArr.length == 0) {
        return;
      }
      const idx = parseInt(nameArr[0]) - 1;
      let cur = this.treeData[idx];
      // console.log(cur);
      if (this.curIdx != idx) {
        this.curIdx = idx;
        // this.$emit("on-draw-tree", cur.data);
        // 获取分步
        db.find({ _id: cur.name }, (err, doc) => {
          cur.cmds = doc[0].Command.map((o) => {
            o["active"] = false;
            return o;
          });
        });
      }
    },
  },
};
</script>

<style scoped>
.treepage-cmd {
  max-height: 100vh;
  overflow-y: scroll;
}
.cmd-desc {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>