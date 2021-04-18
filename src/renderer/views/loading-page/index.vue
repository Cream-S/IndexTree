<template>
  <div class="container">LOADING...</div>
</template>

<script>
import path from "path";
import Datastore from "nedb";
import { init, initTypeTable } from "@/assets/initDB";

export default {
  created() {
    this.initDatabase();
  },
  methods: {
    async initDatabase() {
      var db = {};
      global.db = db;
      // 初始化typeTable
      db.typeTable = new Datastore({
        filename: path.join(__static, `/typeTable.db`),
        autoload: true,
      });
      // 插入typeTable
      await initTypeTable();
      const doc = await new Promise((resolve) => {
        db.typeTable.find({}, { _id: 1 }, (err, doc) => {
          resolve(doc);
        });
      });
      await new Promise((resolve) => {
        doc.forEach((o, i) => {
          db[o._id] = new Datastore({
            filename: path.join(__static, `/${o._id}.db`),
            autoload: true,
          });
          console.log(`${o._id} init end!!!`);
          if (i == doc.length - 1) {
            resolve();
          }
        });
      });

      db.oprateRecord = new Datastore({
        filename: path.join(__static, `/oprateRecord.db`),
        autoload: true,
      });

      // 插入初始化数据
      await init();
      db.typeTable.find({ flag: 2 }, {}, (e, l) => {
        console.log(l);
        if (l.length > 0) {
          this.$store.commit("changeTableName", l[0]._id);
        }
      });
      this.$router.push({
        name: "init-page",
        params: { ts: new Date().valueOf() },
      });
    },
  },
};
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  background-color: #000;
  color: #fff;
  text-align: center;
  padding-top: 30vh;
  font-size: 30px;
  font-weight: bold;
}
</style>