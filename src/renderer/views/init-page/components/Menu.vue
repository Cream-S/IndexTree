<template>
  <Menu
    :active-name="tableName"
    theme="light"
    width="auto"
    @on-select="selectTable"
    ref="myMenu"
  >
    <MenuItem name="">
      <svg class="icon"><use xlink:href="#notes" /></svg>
      使用说明
    </MenuItem>
    <MenuItem v-for="item in menuData" :key="item._id" :name="item._id">
      <svg class="icon" :class="item.type ? 'offset_icon' : 'mid_icon'">
        <use :xlink:href="'#menu-list' + item.type" />
      </svg>
      <Badge v-if="item.flag == 1" dot :offset="[0, -10]">
        <span>{{ item._id }}</span>
      </Badge>
      <span v-else>{{ item._id }}</span>
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
    };
  },
  computed: {
    tableName() {
      return this.$store.state.Global.tableName;
    },
  },
  watch: {
    tableName() {
      this.reload();
    },
  },
  methods: {
    reload() {
      db.typeTable.find({}, (err, doc) => {
        this.menuData = doc.sort((a, b) => {
          if (a.type == b.type) {
            return a._id > b._id ? 1 : -1;
          } else {
            return b.type - a.type;
          }
        });
        this.$nextTick(() => {
          this.$refs.myMenu.updateActiveName();
        });
      });
    },
    selectTable(name) {
      this.$store.commit("changeTableName", name);
    },
  },
};
</script>

<style scoped>
.offset_icon {
  margin: 0 2.5px;
}
.mid_icon {
  width: 28px;
  height: 28px;
}
</style>