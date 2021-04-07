<template>
  <div>
    <Layout>
      <Nav
        slot="header"
        @on-show-build-table="showBuildTable"
        @on-update-db="$refs.myMenu.reload()"
      />
      <Menu ref="myMenu" slot="sider" />
      <existTable @on-drop-table="dropTable" slot="content" />
    </Layout>
    <Modal v-model="visible" fullscreen :closable="false" id="build-new-table">
      <Table
        :columns="table.column"
        :data="table.data"
        @on-cell-click="selectPrimaryKey"
        border
      >
        <template slot-scope="{ index }" slot="colName">
          <Input
            v-model="table.data[index].colName"
            @on-change="changeColName(index)"
            @on-blur="blurColName(index)"
            maxlength="20"
          >
            <Icon
              type="md-alert"
              slot="suffix"
              color="red"
              v-show="table.errLine == index"
            />
          </Input>
        </template>
        <template slot-scope="{ index }" slot="colType">
          <AutoComplete
            v-model="table.data[index].colType"
            :data="typeData"
            @on-blur="blurColType(index)"
          ></AutoComplete>
        </template>
        <template slot-scope="{ index }" slot="primaryKey">
          <Checkbox
            v-model="table.data[index].primaryKey"
            :disabled="table.data[index].colName == ''"
          />
        </template>
        <template slot-scope="{ index }" slot="action">
          <Button
            :disabled="table.data.length > 12"
            type="primary"
            style="margin-right: 5px"
            @click="addRow(index)"
            >增加</Button
          >
          <Button
            :disabled="table.data.length == 1"
            type="error"
            @click="removeRow(index)"
            >删除</Button
          >
        </template>
      </Table>
      <div slot="footer">
        <Button type="primary" @click="onConfirm">确定</Button>
        <Button type="text" @click="onCancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import Layout from "./components/Layout";
import Menu from "./components/Menu";
import Nav from "./components/Nav";
import existTable from "./components/Table";
import Datastore from "nedb";
const fs = require("fs");
const path = require("path");

const rowTemplate = '{ "colName": "", "colType": "", "primaryKey": false }';
const MAXLENGTH = 32;
const MINLENGTH = 1;

export default {
  data() {
    return {
      visible: false,
      typeData: ["int", "varchar(10)", "float", "datetime"],
      table: {
        name: "", // 表名
        errLine: -1,
        column: [
          {
            title: "列名",
            key: "colName",
            slot: "colName",
          },
          {
            title: "数据类型",
            key: "colType",
            slot: "colType",
          },
          {
            title: "主键", //约束
            key: "primaryKey",
            slot: "primaryKey",
          },
          {
            title: " ",
            key: "action",
            slot: "action",
          },
        ],
        data: [],
      },
    };
  },
  mounted() {
    // 仅用于调试
    if (!this.$route.params.ts) {
      this.$router.push({ name: "loading-page" });
    }
  },
  methods: {
    showBuildTable() {
      this.table.data = [JSON.parse(rowTemplate)];
      this.table.errLine = -1;
      this.visible = true;
    },
    selectPrimaryKey(row, col) {
      if (col.key == "primaryKey" && row.colName != "") {
        this.table.data.forEach((o, i) => {
          o.primaryKey = row._index == i && !o.primaryKey;
        });
      }
    },
    changeColName(idx) {
      let row = this.table.data[idx];
      if (row.colName == "" && row.primaryKey) {
        row.primaryKey = false;
      }
      if (row.colName != "") {
        if (row.colType == "") {
          row.colType = "varchar(10)";
        }
      }
      this.table.errLine = -1;
    },
    blurColName(idx) {
      let row = this.table.data[idx];
      row.colName = row.colName.trim();
      const repeat = this.table.data.findIndex(
        (o, i) => o.colName == row.colName && i != idx
      );
      if (row.colName != "" && repeat != -1) {
        row.colName = "";
        this.table.errLine = idx;
        this.$Message.error("列名不能重复");
      }
    },
    blurColType(idx) {
      let row = this.table.data[idx];
      const colType = row.colType;
      if (colType == "" && row.colName == "") {
        return;
      }
      // TODO 其他类型校验
      const typeReg = [/^int$/, /^varchar\((\d+)\)$/, /^float$/, /^datetime$/];
      const res = typeReg.some((reg) => reg.test(colType));
      if (res) {
        const ch = colType[0];
        switch (ch) {
          case "v":
            let length = parseInt(colType.match(typeReg[1])[1]);
            if (length > MAXLENGTH) {
              this.$Message.error("最大长度不超过" + MAXLENGTH);
              length = MAXLENGTH;
            }
            if (length < MINLENGTH) {
              this.$Message.error("最小长度不小于" + MINLENGTH);
              length = MINLENGTH;
            }
            row.colType = "varchar(" + length + ")";
            break;
        }
      } else {
        row.colType = "varchar(10)";
        this.$Message.error("类型错误");
      }
    },
    addRow(idx) {
      this.table.errLine = -1;
      this.table.data.splice(idx + 1, 0, JSON.parse(rowTemplate));
    },
    removeRow(idx) {
      this.table.errLine = -1;
      this.table.data.splice(idx, 1);
    },
    onConfirm() {
      const data = this.table.data;
      let keyFlag = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i].colName == "") {
          this.table.errLine = i;
          this.$Message.error(`表格${i + 1}行未填写完整`);
          return;
        }
        if (data[i].primaryKey) {
          keyFlag = true;
        }
      }
      if (keyFlag) {
        this.addTableName();
      } else {
        this.$Message.error("请设置主键");
      }
    },
    onCancel() {
      let that = this;
      this.$Modal.confirm({
        title: "提示",
        content: "确定离开当前页面，数据将会丢失",
        onOk() {
          that.visible = false;
        },
      });
    },
    addTableName() {
      let that = this;
      this.$Modal.confirm({
        render: (h) => {
          return h("div", [
            h("h3", { style: { marginBottom: "20px" } }, "请输入表名"),
            h("Input", {
              props: {
                value: that.table.name,
                autofocus: true,
                placeholder: "请输入表名...",
              },
              on: {
                input: (val) => {
                  that.table.name = val;
                },
              },
            }),
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
                        that.$Modal.remove();
                        const origin = that.table.name.trim();
                        const tbLength = origin.length;
                        if (tbLength == 0) {
                          that.$Message.error("表名不能为空");
                        } else if (tbLength > 10) {
                          that.$Message.error("表名长度不超过10个字符");
                        } else {
                          db.typeTable.find({}, {}, (findErr, findList) => {
                            let offset = 1,
                              tbName = origin;
                            while (
                              findList.findIndex((_o) => _o._id == tbName) != -1
                            ) {
                              tbName = `${origin}(${offset++})`;
                            }
                            that.insertDb(tbName);
                          });
                        }
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
    insertDb(tableName) {
      this.$Spin.show({
        render: (h) => {
          return h("div", [
            h("Icon", {
              class: "demo-spin-icon-load",
              props: {
                type: "ios-loading",
                size: 18,
              },
            }),
            h("div", "Loading"),
          ]);
        },
      });
      const data = this.table.data;
      const primaryKey = data.find((row) => row.primaryKey).colName;
      db.typeTable.insert(
        {
          _id: tableName,
          type: 0,
          indexName: primaryKey,
          primaryKey: primaryKey,
          col: this.table.data.map((o) => {
            let colType = o.colType,
              length = 0;
            if (o.colType[0] == "v") {
              (colType = "varchar"), (length = o.colType.match(/\d+/)[0]);
            }
            return {
              colName: o.colName,
              colType: colType,
              length: length,
              notNull: 1,
              unique: o.primaryKey ? 1 : 0,
            };
          }),
          // { colName: "age", colType: "int", length: 0, notNull: 1, unique: 0 },
        },
        () => {
          this.visible = false;
          db[tableName] = new Datastore({
            filename: path.join(__static, `/${tableName}.db`),
            autoload: true,
          });
          this.$store.commit("changeTableName", tableName);
          this.$refs.myMenu.reload();
          this.$Spin.hide();
        }
      );
    },
    dropTable() {
      this.$Spin.show({
        render: (h) => {
          return h("div", [
            h("Icon", {
              class: "demo-spin-icon-load",
              props: {
                type: "ios-loading",
                size: 18,
              },
            }),
            h("div", "Loading"),
          ]);
        },
      });
      const tableName = this.$store.state.Global.tableName;
      db.typeTable.remove({ _id: tableName }, (err, num) => {
        console.log(num);
        fs.unlink(path.join(__static, `${tableName}.db`), (err) => {});
        delete db[tableName];
        this.$store.commit("changeTableName", "学生表");
        this.$refs.myMenu.reload();
        this.$Spin.hide();
        this.$Message.success("删除成功！");
      });
    },
  },
  components: {
    Layout,
    Menu,
    existTable,
    Nav,
  },
};
</script>