<template>
  <div class="container">
    <div class="table" v-if="tableName">
      <Table :columns="column" :data="tableData">
        <template slot-scope="{ row }" slot="length">
          {{ row.length != 0 ? row.length : "" }}
        </template>
        <template slot-scope="{ row }" slot="primaryKey">
          {{ row.colName == primaryKey ? " ✔ " : "" }}
        </template>
        <template slot-scope="{ row }" slot="notNull">
          {{ row.notNull ? " ✔ " : "" }}
        </template>
        <template slot-scope="{ row }" slot="unique">
          {{ row.unique ? " ✔ " : "" }}
        </template>
        <template slot-scope="{ row }" slot="indexName">
          {{ row.colName == indexName ? " ✔ " : "" }}
        </template>
      </Table>
      <div class="footer">
        <Button
          v-show="!tableType"
          size="large"
          type="error"
          @click="dropTable"
          style="margin-right: 60px"
        >
          删除
          <i class="fad fa-trash-alt"></i>
        </Button>
        <Button size="large" type="primary" @click="launch">
          进入
          <i class="fad fa-arrow-alt-to-right"></i>
        </Button>
        <!-- <Button size="large" type="primary" @click="test">test</Button> -->
      </div>
    </div>
    <div class="note" v-else>
      <div class="welcome">欢迎使用</div>
      <div class="author">By Cream</div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.tableName && this.setTable(this.tableName);
  },
  computed: {
    tableName() {
      return this.$store.state.Global.tableName;
    },
  },
  watch: {
    tableName(newVal, oldVal) {
      if (newVal != oldVal && newVal) {
        this.setTable(newVal);
      }
    },
  },
  methods: {
    async setTable(name) {
      this.tableData.length = 0;
      // 获取表结构
      db.typeTable.find({ _id: name }, (err, doc) => {
        this.tableData = doc[0].col;
        this.indexName = doc[0].indexName;
        this.primaryKey = doc[0].primaryKey;
        this.tableType = doc[0].type;
        // console.log(this.tableData);
      });
    },
    launch() {
      db.typeTable.update(
        { flag: 2 },
        { $set: { flag: 0 } },
        { multi: true },
        (err, num) => {
          db.typeTable.update(
            { _id: this.tableName },
            { $set: { flag: 2 } },
            {},
            (err) => {
              this.$router.push({
                name: "main-page",
                params: { ts: new Date().valueOf },
              });
            }
          );
        }
      );
    },
    dropTable() {
      let that = this;
      this.$Modal.confirm({
        title: "提示",
        content: "是否删除数据表",
        onOk() {
          that.$emit("on-drop-table");
        },
      });
    },
    test() {
      this.$router.push({
        name: "test-page",
        params: { ts: new Date().valueOf },
      });
    },
  },
  data() {
    return {
      column: [
        {
          title: "列名",
          key: "colName",
          align: "center",
        },
        {
          title: "数据类型",
          key: "colType",
          align: "center",
        },
        {
          title: "长度",
          key: "length",
          slot: "length",
          align: "center",
        },
        {
          title: "聚集索引",
          key: "indexName",
          slot: "indexName",
          align: "center",
        },
        {
          title: "主键", //约束
          key: "primaryKey",
          slot: "primaryKey",
          align: "center",
        },
        {
          title: "Not Null", //约束
          key: "notNull",
          slot: "notNull",
          align: "center",
        },
        {
          title: "Unique", //约束
          key: "unique",
          slot: "unique",
          align: "center",
        },
      ],
      tableData: [],
      tableType: 1,
    };
  },
};
</script>

<style scoped>
.container {
  height: 100%;
}
.footer {
  display: flex;
  justify-content: center;
  margin-top: 60px;
}
.footer button {
  width: 120px;
}
.footer button i {
  margin-left: 8px;
}
.note {
  height: 100%;
  padding: 60px;
  background: url(https://cdn.jsdelivr.net/gh/mt-theme/metron-assets@3.0.2/metron/media/bg/bg-01-450.jpg);
}
.note .welcome {
  color: #fff;
  font-size: 36px !important;
}
.note .author {
  color: #fff;
  text-align: right;
}
</style>