<template>
  <Menu
    :active-name="tableName"
    theme="light"
    width="auto"
    @on-select="loadTable"
    ref="myMenu"
  >
    <MenuItem v-for="item in menuData" :key="item._id" :name="item._id">
      <svg class="icon"><use :xlink:href="'#menu-list' + item.type" /></svg>
      <span>{{ item._id }}</span>
    </MenuItem>
  </Menu>
</template>

<script>
export default {
  mounted() {
    this.reload();
  },
  data() {
    return {
      menuData: [],
      tableName: "",
      newTableName: "",
    };
  },
  methods: {
    reload() {
      this.tableName = this.$store.state.Global.tableName;
      db.typeTable.find({}, (err, doc) => {
        //   console.log(doc);
        this.menuData = doc;
        this.loadTable(this.tableName);
      });
    },
    loadTable(tableName) {
      this.$store.commit("changeTableName", tableName);
      this.tableName = tableName;
      //   this.$refs.tableStructure.setTable(tableName);
      this.$nextTick(() => {
        this.$refs.myMenu.updateActiveName();
      });
    },
  },
};
</script>

<style scoped>
</style>