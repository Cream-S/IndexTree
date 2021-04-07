<template>
  <div class="container">
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
</template>

<script>
export default {
  mounted() {
    this.setTable(this.$store.state.Global.tableName);
  },
  computed: {
    tableName() {
      return this.$store.state.Global.tableName;
    },
  },
  watch: {
    tableName(newval, oldval) {
      // console.log(oldval, newval);
      if (newval != oldval) {
        this.setTable(newval);
      }
    },
  },
  methods: {
    async setTable(name) {
      this.tableData.length = 0;
      // 获取表结构
      // console.log(name);
      db.typeTable.find({ _id: name }, (err, doc) => {
        this.tableData = doc[0].col;
        this.indexName = doc[0].indexName;
        this.primaryKey = doc[0].primaryKey;
        this.tableType = doc[0].type;
        // console.log(this.tableData);
      });
    },
    launch() {
      this.$router.push({
        name: "main-page",
        params: { ts: new Date().valueOf },
      });
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
</style>