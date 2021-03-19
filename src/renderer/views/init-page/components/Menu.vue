<template>
  <Menu
    :active-name="tableName"
    theme="light"
    width="auto"
    @on-select="loadTable"
    ref="myMenu"
  >
    <MenuItem v-for="item in menuData" :key="item._id" :name="item._id">
      <!-- <i class="fad" :class="item.type ? 'fa-file' : 'fa-file-signature'"></i> -->
      <svg class="icon"><use :xlink:href="'#menu-list' + item.type" /></svg>
      <span>{{ item._id }}</span>
    </MenuItem>
    <div class="menu-item">
      <Button type="text" long ghost @click="showBuildTable">
        <svg class="icon"><use xlink:href="#create-table" /></svg>
        新建
      </Button>
    </div>
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
    showBuildTable() {
      this.$emit("on-show-build-table");
    },
  },
};
</script>

<style scoped>
.menu-item {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}
.menu-item button {
  height: 48px;
  font-size: 16px;
  color: var(--color-link);
}
.icon {
  margin-right: 8px;
}
</style>