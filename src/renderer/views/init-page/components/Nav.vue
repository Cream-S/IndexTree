<template>
  <div class="nav_header">
    <div id="title">索引可视化实验教学平台</div>
    <div class="btn_group">
      <Button @click="showBuildTable">
        <svg class="icon"><use xlink:href="#create-table" /></svg>
        新建
      </Button>
      <Button @click="importData">
        <svg class="icon"><use xlink:href="#import_data" /></svg>
        导入
      </Button>
      <Button @click="exportData">
        <svg class="icon"><use xlink:href="#export_data" /></svg>
        导出
      </Button>
    </div>
  </div>
</template>

<script>
const { remote } = require("electron");
const fs = require("fs");
import path from "path";
import Datastore from "nedb";

export default {
  data() {
    return {
      exportList: [],
      dbList: null,
    };
  },
  mounted() {
    this.updateDbList();
  },
  methods: {
    showBuildTable() {
      this.$emit("on-show-build-table");
    },
    importData() {
      this.updateDbList();
      remote.dialog.showOpenDialog(
        {
          title: "导入的文件",
          filters: [{ name: "Text", extensions: ["txt"] }],
          properties: ["openFile"],
        },
        (filePaths) => {
          filePaths &&
            fs.readFile(filePaths[0], "utf8", (err, text) => {
              this.handleImport(text);
            });
        }
      );
    },
    async exportData() {
      this.updateDbList();
      let that = this;
      this.$Modal.confirm({
        title: "请选择需要导出的数据表",
        render(h) {
          return h("div", { style: { marginTop: "20px" } }, [
            h(
              "i-select",
              {
                props: {
                  value: that.exportList,
                  multiple: true,
                },
                on: {
                  "on-change": (val) => {
                    that.exportList = val;
                  },
                },
              },
              [
                that.dbList.map((o) => {
                  return h(
                    "i-option",
                    {
                      props: {
                        value: o._id,
                      },
                    },
                    o._id
                  );
                }),
              ]
            ),
            h(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                },
              },
              [
                h(
                  "Button",
                  {
                    props: { type: "text" },
                    on: {
                      click() {
                        that.exportList.length = 0;
                        that.$Modal.remove();
                      },
                    },
                  },
                  "取消"
                ),
                h(
                  "Button",
                  {
                    props: { type: "primary" },
                    style: { marginLeft: "8px" },
                    on: {
                      click() {
                        that.handleExport();
                        that.exportList.length = 0;
                        that.$Modal.remove();
                      },
                    },
                  },
                  "确定"
                ),
              ]
            ),
          ]);
        },
      });
    },
    handleExport() {
      let fileDataList = [];
      for (let i = 0; i < this.exportList.length; i++) {
        let tb = this.exportList[i];
        let struct = this.dbList.find((o) => o._id == tb);
        let dataText = fs.readFileSync(path.join(__static, tb + ".db"), "utf8");
        fileDataList.push({ struct: struct, dataText: dataText });
      }
      let that = this;
      remote.dialog.showSaveDialog(
        {
          title: "请选择导出文件的位置",
          defaultPath: require("os").userInfo().homedir + "/Desktop",
          filters: [{ name: "Text", extensions: ["txt"] }],
        },
        (fp) => {
          fp &&
            fs.writeFile(fp, JSON.stringify(fileDataList), (err) => {
              if (err) {
                that.$Message.error("导出失败");
              } else {
                that.$Message.success("导出成功");
              }
            });
        }
      );
    },
    handleImport(text) {
      try {
        JSON.parse(text).forEach((o) => {
          let st = o.struct;
          st.type = 0;
          const id = st._id;
          let offset = 1;
          while (this.dbList.findIndex((_o) => _o._id == st._id) != -1) {
            st._id = `${id}(${offset++})`;
          }
          st.flag = 1;
          db.typeTable.insert(st);
          fs.writeFileSync(path.join(__static, st._id + ".db"), o.dataText);
          db[st._id] = new Datastore({
            filename: path.join(__static, `/${st._id}.db`),
            autoload: true,
          });
        });
        this.$emit("on-update-db");
      } catch (error) {
        this.$Message.error("导入失败，格式错误");
      }
    },
    updateDbList() {
      db.typeTable.find({}, {}, (err, list) => {
        this.dbList = list;
      });
    },
  },
};
</script>

<style scoped>
.nav_header {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav_header #title {
  margin-left: 20px;
  color: #fff;
  font-size: 36px !important;
  white-space: nowrap;
  letter-spacing: 0;
  text-shadow: 0px 1px 0px #999, 0px 2px 0px #888, 0px 3px 0px #777,
    0px 4px 0px #666, 0px 5px 0px #555, 0px 6px 0px #444, 0px 7px 0px #333,
    0px 8px 7px #001135;
}
.nav_header .btn_group {
  align-self: flex-end;
  justify-self: flex-end;
}
.icon {
  margin-right: 8px;
}
</style>