<template>
  <div id="tree" style="height: 80vh; width: 100vw">
    You are the apple of my eyes
  </div>
</template>

<script>
import * as echarts from "echarts";
import Tree from "@/assets/BPlusTree";
import { default as treeSetting } from "@/assets/ECharts";

export default {
  computed: {
    operate() {
      return this.$store.state.Global.operate;
    },
  },
  watch: {
    operate(newVal, oldVal) {
      if (newVal.val == "") {
        return;
      }
      switch (newVal.type) {
        case "insert":
          this.insertElement(newVal.val);
          break;
        case "delete":
          this.deleteElement(newVal.val);
          break;
        case "query":
          this.showPath(newVal.val);
          break;
        case "update":
          this.updateElement(...newVal.val.split("$"));
      }
      if (newVal.type == "delete" || newVal.type == "query") {
      }
    },
  },
  data() {
    return {
      myChart: null, // echarts实例
      tree: null, // B+树实例
      treeData: [], // 绘图数据
      tableName: null,

      // changeOption: {
      //   emphasis: {
      //     label: {
      //       formatter: (params) => {
      //         // 富文本展示表格数据
      //         return params.name;
      //       },
      //     },
      //   },
      //   label: {
      //     color: "white",
      //     backgroundColor: "#ff0077",
      //     borderColor: "#ff4800",
      //   },
      // },
    };
  },
  mounted() {
    this.myChart = echarts.init(document.getElementById("tree"));
    this.tree = new Tree();
    const tableName = this.$store.state.Global.tableName;
    this.tableName = tableName;
    db.typeTable.find({ _id: tableName }, (err, doc) => {
      let indexName = doc[0].indexName;
      db[tableName].find({}, (err, doc) => {
        doc.forEach((o) => {
          this.tree.insertElement(o[indexName]);
        });
        this.drawNewTree();
      });
    });
  },
  methods: {
    async dfsTree(tree) {
      if (tree == null) {
        return {};
      }
      let nameArr = [];
      for (let i = 0; i < tree.numKeys; i++) {
        nameArr.push(tree.keys[i]);
      }
      let sonArr = [];
      if (!tree.isLeaf) {
        for (let i = 0; i < tree.numKeys; i++) {
          sonArr.push(await this.dfsTree(tree.children[i]));
        }
      }
      let ret = {
        name: nameArr.join("  "),
        children: sonArr,
      };
      if (sonArr.length == 0) {
        ret.label = treeSetting.leavesOption.label;
        ret.name = treeSetting.leavesOption.name(ret.name);
      }
      return ret;
      return new Promise(async (resolve) => {
        if (sonArr.length == 0) {
          let name = ret.name.split(/\s+/);
          let leafStr = "";
          for (let i = 0, n = name.length; i < n; i++) {
            await new Promise((resolve) => {
              console.log(name[i]);
              db[this.tableName].find({ _id: name[i] }, (err, doc) => {
                // console.log(JSON.stringify(doc[0]));
                delete doc[0]._id;
                if (i == n - 1) {
                  leafStr += Object.keys(doc[0])
                    .map((k) => doc[0][k])
                    .join("  ");
                } else {
                  leafStr +=
                    Object.keys(doc[0])
                      .map((k) => doc[0][k])
                      .join("  ") + "\n\n";
                }

                resolve();
              });
            });
          }
          ret.name = leafStr;
        }
        resolve(ret);
      });
    },
    async handleLeafData() {},
    draw() {
      if (this.myChart && this.myChart.dispose) {
        this.myChart.dispose();
      }
      this.myChart = echarts.init(document.getElementById("tree"));
      this.myChart.showLoading();
      treeSetting.echartOption.series[0].data = [this.treeData];
      this.myChart.setOption(treeSetting.echartOption);
      this.myChart.hideLoading();
      this.myChart.resize();
    },
    async drawNewTree() {
      this.treeData = await this.dfsTree(this.tree.treeRoot);
      this.draw();
    },
    insertElement(val) {
      this.tree.insertElement(val);
      this.drawNewTree();
    },
    deleteElement(val) {
      this.tree.deleteElement(val);
      this.drawNewTree();
    },
    updateElement(oldVal, newVal) {
      this.tree.deleteElement(oldVal);
      this.tree.insertElement(newVal);
      this.drawNewTree();
    },
    async showPath(val) {
      this.treeData = await this.dfsTree(this.tree.treeRoot);
      let tree = this.treeData;
      while (tree.children.length > 0) {
        const keys = tree.name.split(/\s+/);
        let idx = keys.findIndex((v) => v >= val);
        if (idx == -1) {
          this.$Message.error(`找不到索引 ${val}`);
          break;
        } else {
          tree.children[idx].lineStyle = {
            color: "#ff8f77",
          };
          tree = tree.children[idx];
        }
      }
      this.draw();
    },
  },
};
</script>