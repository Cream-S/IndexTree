<template>
  <Form :label-width="80" class="student-form">
    <FormItem label="学号">
      <Input v-model="info.username" size="small" />
    </FormItem>
    <FormItem label="姓名">
      <Input v-model="info.name" size="small" />
    </FormItem>
    <FormItem label="性别">
      <Select v-model="info.gender" size="small">
        <Option value="1">男</Option>
        <Option value="0">女</Option>
      </Select>
    </FormItem>
    <FormItem label="联系电话">
      <Input v-model="info.phone" size="small" />
    </FormItem>
    <FormItem label="年级">
      <Input v-model="info.grade" size="small" />
    </FormItem>
    <FormItem label="专业">
      <Cascader v-model="info.major" :data="majorData" filterable />
    </FormItem>
  </Form>
</template>

<script>
export default {
  mounted() {
    this.$http
      .get("/system/major/get")
      .then((r) => (this.majorData = r.data.major_list));
  },
  data() {
    return {
      info: {
        username: "",
        name: "",
        gender: "",
        phone: "",
        grade: "",
        major: [],
      },
      majorData: [],
    };
  },
  methods: {
    test() {
      let ret = true;
      Object.keys(this.info).forEach((k) => {
        switch (k) {
          case "gender":
            if (this.info[k] != "0" && this.info[k] != "1") {
              ret = false;
            }
            break;
          case "phone":
            if (!/^\d{11}$/.test(this.info[k])) {
              ret = false;
            }
            break;
          case "grade":
            const YY = new Date().getFullYear();
            if (Math.abs(YY - parseInt(this.info[k])) > 8) {
              ret = false;
            }
            break;
          case "major":
            if (typeof this.info[k] != "object" || this.info[k].length != 2) {
              ret = false;
            }
            break;
          default:
            if (this.info[k] === "") {
              ret = false;
            }
        }
      });
      return ret;
    },
  },
};
</script>

<style scoped>
.student-form .ivu-form-item {
  margin-bottom: 5px;
}
</style>