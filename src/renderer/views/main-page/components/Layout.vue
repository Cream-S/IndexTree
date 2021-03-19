<template>
  <div class="layout">
    <Layout>
      <Header :style="{ width: '100%' }">
        <ul class="ivu-menu ivu-menu-dark ivu-menu-horizontal">
          <div class="layout-title">
            <slot name="title"></slot>
          </div>
          <div class="layout-nav">
            <li
              class="ivu-menu-item"
              :class="headerClass('table')"
              @click="toggle('table')"
            >
              📑 表格
            </li>
            <li
              class="ivu-menu-item"
              :class="headerClass('tree')"
              @click="toggle('tree')"
            >
              🌲 索引树
            </li>
          </div>
          <div class="layout-goback" @click="goBack">
            返回
            <i class="fad fa-arrow-from-left"></i>
          </div>
        </ul>
      </Header>
      <Content
        :style="{
          padding: '20px',
          background: '#fff',
        }"
      >
        <slot name="content"></slot>
      </Content>
    </Layout>
  </div>
</template>

<script>
export default {
  data() {
    return {
      headerName: "table",
    };
  },
  methods: {
    goBack() {
      this.$router.push({
        name: "init-page",
        params: { ts: new Date().valueOf() },
      });
    },
    toggle(name) {
      this.$emit("on-toggle", name);
    },
    headerClass(name) {
      return this.headerName == name
        ? "ivu-menu-item-active ivu-menu-item-selected"
        : "";
    },
  },
};
</script>

<style scoped>
.layout {
  position: relative;
  overflow: hidden;
  height: 100vh;
}
.layout-title {
  width: 220px;
  float: left;
  color: #fff;
  font-size: 20px;
}
.layout-nav {
  width: 420px;
  margin: 0 auto;
  margin-right: 20px;
}
.layout-goback {
  width: 50px;
  float: right;
  color: #fff;
  text-align: center;
  cursor: pointer;
}
</style>

