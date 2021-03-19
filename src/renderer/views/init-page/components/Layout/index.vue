<template>
  <div class="layout">
    <Layout style="height: 100vh">
      <Sider>
        <slot name="sider"></slot>
      </Sider>
      <Layout>
        <Content
          :style="{ margin: '20px', background: '#fff', minHeight: '220px' }"
        >
          <slot name="content"></slot>
        </Content>
      </Layout>
    </Layout>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.layout {
  /* border: 1px solid #d7dde4; */
  background: #f5f7f9;
  position: relative;
  /* border-radius: 4px; */
  overflow: hidden;
}
.layout-header-bar {
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}
</style>