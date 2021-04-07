<template>
  <Layout @on-toggle="toggle" ref="layout">
    <template slot="title">{{ title }}</template>
    <div slot="content" v-show="mode == 'table'">
      <TablePage />
    </div>
    <div slot="content" v-show="mode == 'tree'">
      <TreePage />
    </div>
  </Layout>
</template>

<script>
import { Layout, TablePage, TreePage } from "./components";

export default {
  data() {
    return {
      tableName: "",
      title: "",
      indexName: "",
      mode: "table",
    };
  },
  methods: {
    queryData(val) {
      this.$refs.table.handleOpration(val, "query");
      this.$refs.tree.showPath(val);
    },
    showPath(val) {
      this.$refs.tree.showPath(val);
    },
    deleteData(val) {
      this.$refs.table.handleOpration(val, "delete");
    },
    toggle(name) {
      const errLine = this.$store.state.Global.errLine;
      if (errLine == -1) {
        this.mode = name;
        this.$refs.layout.headerName = name;
      } else {
        // this.$Message.error(`第${errLine + 1}行未填写完整`);
      }
    },
    insertIntoTree(val) {
      this.$refs.tree.insertElement(val);
    },
    deleteFromTree(val) {
      this.$refs.tree.deleteElement(val);
    },
    updateTree(args) {
      const oldVal = args[0],
        newVal = args[1];
      if (oldVal == "") {
        this.$refs.tree.insertElement(newVal);
      } else if (newVal == "") {
        this.$refs.tree.deleteElement(oldVal);
      } else {
        this.$refs.tree.updateElement(args[0], args[1]);
      }
    },
  },
  components: {
    Layout: Layout,
    TablePage: TablePage,
    TreePage: TreePage,
  },
  mounted() {
    // 仅用于调试
    if (!this.$route.params.ts) {
      this.$router.push({ name: "loading-page" });
    }
    //挂载，加载数据，接收参数
    this.tableName = this.$store.state.Global.tableName;
    this.title = this.$store.state.Global.tableName;
    // db.find(
    //   { tablename: "typeTable", "row.existTableName": this.tableName },
    //   (err, doc) => {
    //     const cur = doc[0].row.filter(
    //       (o) => o.existTableName == this.tableName
    //     )[0];
    //     this.title = cur.chTableName;
    //     this.indexName = cur.indexName;
    //     this.$refs.tree.loadData(this.tableName, this.indexName);
    //   }
    // );
  },
};
</script>

