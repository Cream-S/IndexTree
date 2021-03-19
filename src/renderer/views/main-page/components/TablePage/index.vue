<template>
  <div class="table-pannel">
    <Input />
    <Table />
  </div>
</template>

<script>
import Input from "./Input";
import Table from "./Table";

export default {
  components: {
    Input: Input,
    Table: Table,
  },
};
</script>

<style scoped>
.table-pannel > :first-child {
  margin-bottom: 20px;
}
</style>