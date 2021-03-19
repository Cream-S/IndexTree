<template>
  <div class="treepage-cmd">
    <Collapse
      simple
      accordion
      @on-change="onCommandChange"
      class="cmd-collapse"
    >
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
    <Page
      :total="this.idxSum"
      size="small"
      :page-size="20"
      @on-change="onPageChange"
      class="cmd-page"
    />
  </div>
</template>

<script>
export default {
  mounted() {
    this.initCmd();
  },
  data() {
    return {
      curIdx: -1, //当前大项idx
      curActive: [], //[当前大项idx，在大项中的位置]
      treeData: [],
      idxSum: 0, //数据总条数
      curPage: 0, //当前页码,从0开始
    };
  },
  methods: {
    initCmd() {
      this.readDB(0);
      db.count({}, (err, num) => {
        this.idxSum = num;
      });
    },
    readDB(pageNum) {
      db.find({})
        .skip(pageNum * 20)
        .limit(20)
        .exec((err, doc) => {
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
      console.log("readDB", this.treeData);
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
    onCommandChange(nameArr) {
      if (nameArr && nameArr.length == 0) {
        return;
      }
      const idx = parseInt(nameArr[0]) - this.curPage * 20 - 1;
      let cur = this.treeData[idx];
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
    onPageChange(num) {
      this.curPage = num - 1;
      this.curIdx = -1;
      this.curActive = [];
      this.readDB(num - 1);
    },
  },
};
</script>

<style scoped>
.treepage-cmd {
  max-height: 100vh;
  overflow-y: scroll;
  position: relative;
  display: grid;
  grid-template-rows: auto 40px;
}
.cmd-desc {
  word-wrap: break-word;
  white-space: pre-wrap;
}
.treepage-cmd .cmd-collapse {
}
.treepage-cmd .cmd-page {
  height: 40px;
  padding: 6px 15px;
  width: 100%;
  box-sizing: border-box;
}
</style>