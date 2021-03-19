<template>
  <Table
    context-menu
    border
    max-height="650"
    :show-context-menu="showMenu"
    :columns="columns1"
    :data="data1"
    :row-class-name="rowClassName"
    @on-contextmenu="handleContextMenu"
  >
    <template
      slot-scope="{ row, index }"
      v-for="item in columns1"
      :slot="item.slot"
    >
      <input
        :key="item.slot"
        v-model="data1[index][item.slot]"
        class="input"
        placeholder="NULL"
        @blur="handleBlur(index, item.slot)"
        @focus="handleFocus(index, item.slot)"
        @keyup.enter="handleEnter(index, item.slot)"
        :ref="index + item.slot"
      />
    </template>

    <template slot="contextMenu">
      <DropdownItem @click.native="onClickContextMenu('query')"
        >查询</DropdownItem
      >
      <DropdownItem
        @click.native="onClickContextMenu('delete')"
        style="color: #ed4014"
        >删除</DropdownItem
      >
    </template>
  </Table>
</template>

<script>
export default {
  mounted() {
    // 全局获取tablename并查找indexname
    this.tableName = this.$store.state.Global.tableName;
    // 加载数据
    this.loadData();
  },
  data() {
    return {
      tableName: "",
      indexName: "",
      columns1: [],
      data1: [],
      curline: 0,
      errLine: -1, // 被标记的错误行
      showMenu: true,
      oldVal: "",
      loading: true, // 表格加载中
      colName: [], // 列名
    };
  },
  methods: {
    loadData() {
      db.typeTable.find({ _id: this.tableName }, (err, doc) => {
        this.indexName = doc[0].indexName;
        // 显示行号的列
        this.columns1.push({
          type: "index",
          width: 70,
          align: "center",
          title: " ",
        });
        // 数据列
        this.colName.length = 0;
        doc[0].col.forEach((o) => {
          let col = {
            title: o.colName,
            key: o.colName,
            slot: o.colName,
            colType: o.colType,
            length: o.length,
            // sortable: true,
          };
          this.colName.push(o.colName);
          if (o.colName == this.indexName) {
            col.title = col.title + " 🔑";
          }
          this.columns1.push(col);
        });
      });
      db[this.tableName].find({}, (err, doc) => {
        this.data1 = doc;
        let tmp = {};
        this.colName.forEach((k) => (tmp[k] = ""));
        this.data1.push(JSON.parse(JSON.stringify(tmp)));
      });
      this.loading = false;
    },
    handleContextMenu(row, event, pos) {
      this.curline = this.data1.findIndex(
        (item) => item[this.indexName] == row[this.indexName]
      );
    },
    onClickContextMenu(oprate) {
      if (this.curline != this.data1.length - 1) {
        const opVal = this.data1[this.curline][this.indexName];
        this.$store.commit("changeOperate", {
          type: oprate,
          val: opVal,
        });
      } else {
        return;
      }
    },
    handleOpration(val, oprate) {
      // 没有空缺行
      if (this.errLine == -1) {
        let opVal;
        let idx;
        if (typeof val !== "string") {
          val = "" + val;
        }
        const spIdx = val.indexOf("$");
        val = spIdx == -1 ? val : val.slice(spIdx + 1);
        idx = this.data1.findIndex((o) => o[this.indexName] == val);
        if (idx == -1) {
          this.$Message.error(`找不到索引 ${val}`);
          return;
        } else {
          this.curline = idx;
        }
        opVal = val;
        const opObj = {};
        opObj[this.indexName] = opVal;
        if (oprate == "delete") {
          // this.$store.commit("changeOperate", {
          //   type: "delete",
          //   val: opVal,
          // });

          // todo: 从数据库删除
          db[this.tableName].remove(opObj, {}, (err, doc) => {
            if (doc > 0) {
              this.data1.splice(this.curline, 1);
              this.$Message.success(`已删除 ${opVal}`);
            } else {
              this.$Message.error(`ERROR : 未删除 ${opVal}！`);
            }
          });
        } else if (oprate == "query") {
          this.$Message.success(`找到索引 ${opVal}位于${this.curline + 1}行`);
          // this.$store.commit("changeOperate", {
          //   type: "query",
          //   val: opVal,
          // });
        } else if (oprate == "update") {
          // 更新数据库
        } else {
        }
      } else if (this.errLine != this.curline) {
        this.$Message.error(`第${this.errLine + 1}行未填写完整`);
      }
    },
    verifyColType(index, colName) {
      let row = this.data1[index];
      let val = row[colName];
      const col = this.columns1.filter((col) => col.key == colName)[0];
      const maxlength = col.length;
      let ret = false;
      if (typeof val == "string") {
        row[colName] = val = val.trim();
        if (val.length == 0) {
          this.$Message.error(`请输入${colName}的值`);
          return ret;
        }
      }
      switch (col.colType) {
        case "varchar":
          if (val.length <= maxlength) {
            ret = true;
          } else {
            this.$Message.error(`长度超过${maxlength}位`);
          }
          break;
        case "int":
          const intVal = parseInt(val);
          if (intVal == val) {
            if (intVal >= 1 << 31 && intVal <= -(1 << 31) - 1) {
              row[colName] = intVal;
              ret = true;
            } else {
              this.$Message.error(`已超过数据范围`);
            }
          } else {
            this.$Message.error(`未被识别为有效 Int 型数据`);
          }
          break;
        case "float":
          const floatVal = parseFloat(val);
          if (floatVal == val) {
            row[colName] = floatVal;
            ret = true;
          } else {
            this.$Message.error(`未被识别为有效 Float 型数据`);
          }
          break;
        case "datetime":
          const dateVal = new Date(val);
          const MINDATETIME = new Date("1753-1-1");
          const MAXDATETIME = new Date("9999-12-31 23:59:59");
          if (
            dateVal != "Invalid Date" &&
            dateVal >= MINDATETIME &&
            dateVal <= MAXDATETIME
          ) {
            row[colName] = dateVal.format();
            ret = true;
          } else {
            this.$Message.error(`未被识别为有效 Datetime 型数据`);
          }
          break;
        default:
      }
      return ret;
    },
    handleEditSubmit(index, key) {
      // 提交数据
      const row = this.data1[index];
      if (!this.verifyColType(index, key)) {
        this.$refs[index + key][0].focus();
        return;
      }

      // submit(data)
      const ret = Object.keys(row).every((k) => {
        return row[k] != "";
      });
      if (ret) {
        let opObj = {};
        const oldVal = (opObj[this.indexName] = this.data1[index]._id);
        db[this.tableName].remove(opObj, {}, (err, deleteNum) => {
          var insertObj = this.data1[index];
          insertObj._id = insertObj[this.indexName];
          db[this.tableName].insert(insertObj, (err, d) => {
            // 索引列失去焦点且值发生改变
            const newVal = this.data1[index][this.indexName];
            if (deleteNum == 0) {
              this.$store.commit("changeOperate", {
                type: "insert",
                val: newVal,
              });
            } else if (key == this.indexName && oldVal != newVal) {
              this.$store.commit("changeOperate", {
                type: "update",
                val: oldVal + "$" + newVal,
              });
            }
          });
        });
      }
      return ret;
    },
    handleFocus(index, key) {
      // 聚焦索引列时，索引树可能发生修改，记录oldVal
      if (this.indexName == key) {
        this.oldVal = this.data1[index][key];
      }
      // 如果有错误的行，并且聚焦了其他行，则失去焦点
      if (this.errLine != -1 && index != this.errLine) {
        this.$refs[index + key][0].blur();
        this.$Message.error(`第${this.errLine + 1}行未填写完整`);
      }
    },
    handleEnter(index, key) {
      this.$refs[index + key][0].blur();
    },
    async handleBlur(index, key) {
      let item = this.data1[index];
      this.curline = index;
      // 如果最后一行填写了数据，则新增一行
      const isAdd = index == this.data1.length - 1;
      if (isAdd) {
        if (Object.keys(item).some((k) => item[k] != "")) {
          let tmp = {};
          this.colName.forEach((k) => (tmp[k] = ""));
          this.data1.push(JSON.parse(JSON.stringify(tmp)));
        } else {
          return;
        }
      }
      // 尝试提交数据
      if (!isAdd || (isAdd && index == this.data1.length - 2)) {
        // 避免有错误行时，聚焦其他行触发的blur
        if (this.errLine != -1 && index != this.errLine) {
          return;
        }

        if (!this.handleEditSubmit(index, key)) {
          this.errLine = index; // 记录提交错误的行
          this.$store.commit("changeErrLine", index);
        } else {
          // 补充未完成的并提交成功
          if (this.errLine == index) {
            this.errLine = -1; // 重置空缺行的行号
            this.$store.commit("changeErrLine", -1);
          }

          // if (index == this.data1.length - 2) {
          //   this.$emit(
          //     "on-insert-into-tree",
          //     this.data1[index][this.indexName]
          //   );
          // }
        }
      }

      // // 索引列失去焦点且值发生改变
      // const newVal = this.data1[index][key];
      // if (key == this.indexName && newVal != this.oldVal) {
      //   if (isAdd) {
      //     this.$store.commit("changeOperate", {
      //       type: "insert",
      //       val: newVal,
      //     });
      //   } else {
      //     this.$store.commit("changeOperate", {
      //       type: "update",
      //       val: this.oldVal + "$" + newVal,
      //     });
      //   }
      // }
    },
    rowClassName(row, index) {
      if (index == this.errLine) {
        return "error-row";
      }
      return "";
    },
  },
  computed: {
    operate() {
      return this.$store.state.Global.operate;
    },
  },
  watch: {
    operate(newVal, oldVal) {
      this.handleOpration(newVal.val, newVal.type);
    },
  },
};
</script>

<style scoped>
.input {
  display: inline-block;
  width: 100%;
  height: 32px;
  line-height: 1.5;
  padding: 4px 7px;
  font-size: 14px;
  border: 0px solid #dcdee2;
  border-radius: 4px;
  color: #515a6e;
  background: transparent;
  position: relative;
  cursor: text;
}
.input:focus {
  outline: 1px solid rgb(47, 189, 255);
}
.input::placeholder {
  color: #b1b4b8;
}
.error-row td .input {
  color: red;
}
</style>