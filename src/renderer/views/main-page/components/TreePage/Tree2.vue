<template>
  <div id="tree" style="height: 90%; width: 100%">
    You are the apple of my eyes
  </div>
</template>

<script>
import * as echarts from "echarts";
import { default as treeSetting } from "@/assets/ECharts";

export default {
  data() {
    return {
      myChart: null, // echarts实例
      treeData: [], // 绘图数据
      commands: "",
      oprate: {},
      changeOption: {
        emphasis: {
          label: {
            formatter: (params) => {
              // 富文本展示表格数据
              return params.name;
            },
          },
        },
        label: {
          color: "white",
          backgroundColor: "#ff0077",
          borderColor: "#ff4800",
        },
      },
    };
  },
  mounted() {
    this.myChart = echarts.init(document.getElementById("tree"));
  },
  methods: {
    parseCmd() {
      return this.commands.match(/[0-9A-Za-z ]+/g).map((v) => v.trim());
    },
    highlightTree() {
      // console.log(this.treeData);
      const arr = this.oprate.val;
      const op = this.oprate.op;
      if (op == "find") {
        this.showPath(arr[0].trim().split(/\s+/)[0]);
      }
      // console.log(arr, op);
      for (let i = 0; i < arr.length; i++) {
        let tree = this.treeData;
        let val = arr[i].trim().split(/\s+/);
        let max = val[val.length - 1];
        // console.log(val);
        let flag = 0;
        while (tree.children.length > 0 && !flag) {
          let node = tree.name.trim().split(/\s+/);
          if (val.toString() == node.toString()) {
            // console.log("str.toString()", str.toString());
            // console.log("node.toString()", node.toString());
            flag = 1;
            break;
          }
          let idx;
          idx = node.findIndex((str) => max <= str);
          idx = idx == -1 ? tree.children.length - 1 : idx;
          tree = tree.children[idx];
        }
        tree.label = treeSetting.highlightOption.label;
      }
      // TODO 优化多个点的高亮
      return;
      // const val = arr.length > 1 ? arr[1] : arr[0];
      // let idx;
      // while (tree.children.length > 0) {
      //   idx = tree.name.split(/\s+/).findIndex((str) => val <= str);
      //   idx = idx == -1 ? tree.children.length - 1 : idx;
      //   tree = tree.children[idx];
      // }
      // // console.log("叶子", tree.name);
      // tree.label = {
      //   formatter: `{h|${tree.name}}`,
      //   rich: {
      //     h: { color: "red" },
      //   },
      // };
    },
    draw() {
      if (this.myChart && this.myChart.dispose) {
        this.myChart.dispose();
      }
      this.myChart = echarts.init(document.getElementById("tree"));
      this.myChart.showLoading();
      // console.log(this.treeData);
      this.highlightTree();
      treeSetting.echartOption.series[0].data = [this.treeData];
      this.myChart.setOption(treeSetting.echartOption);
      this.myChart.hideLoading();
      this.myChart.resize();
    },
    showPath(val) {
      let tree = this.treeData;
      while (tree.children.length > 0) {
        const keys = tree.name.split(/\s+/);
        let idx = keys.findIndex((v) => v >= val);
        tree.children[idx].lineStyle = {
          color: "#ff8f77",
        };
        tree = tree.children[idx];
      }
    },
  },
};
</script>