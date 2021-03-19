<template>
  <div>
    <Input v-model="inputValue" size="large">
      <Select v-model="selectOption" slot="prepend" style="width: 80px">
        <Option value="query">查询</Option>
        <Option value="delete">删除</Option>
      </Select>
      <Button slot="append" icon="ios-search" @click="onClick"></Button>
    </Input>
  </div>
</template>
<script>
export default {
  data() {
    return {
      inputValue: "",
      selectOption: "query",
    };
  },
  methods: {
    onClick() {
      if (this.inputValue != "") {
        if (this.selectOption == "query") {
          //   this.$Message.info("query" + this.inputValue);
          // this.$emit("childQueryData", this.inputValue);
          this.$store.commit("changeOperate", {
            type: "query",
            val: this.inputValue,
          });
        } else if (this.selectOption == "delete") {
          //   this.$Message.info("delete" + this.inputValue);
          // this.$emit("childDeleteData", this.inputValue);
          this.$store.commit("changeOperate", {
            type: "delete",
            val: this.inputValue,
          });
        } else {
          this.$Message.info("ERROR : please choose a option !");
        }
      } else {
        this.$Message.info("ERROR : inputValue is null !");
      }
    },
  },
};
</script>