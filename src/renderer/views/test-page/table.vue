<template>
  <div class="container">
    <Table border ref="selection" :columns="column" :data="tableData"></Table>
  </div>
</template>

<script>
export default {
  mounted() {},
  computed: {},
  watch: {},
  methods: {
    handleSelectAll(status) {
      this.$refs.selection.selectAll(status);
    },
  },
  data() {
    return {
      column: [
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "学号",
          key: "student_id",
        },
        {
          title: "姓名",
          key: "student_name",
        },

        {
          title: "申请类别",
          key: "application_type",
        },
        {
          title: "转出专业",
          key: "out_major",
        },
        {
          title: "转入专业",
          key: "in_major",
        },
        {
          title: "状态",
          key: "state",
        },
      ],
      tableData: [
        {
          student_id: "001",
          student_name: "查数据库",
          application_type: "0",
          out_major: "信息安全",
          in_major: "通信工程",

          state: "待审核",
        },
        {
          student_id: "002",
          student_name: "查数据库",
          application_type: "1",
          out_major: "计算机科学与技术",
          in_major: "软件工程",
          state: "待审核",
        },
      ],
    };
  },
};
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}
</style>