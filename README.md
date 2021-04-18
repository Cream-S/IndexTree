# com.sa

> An electron-vue project

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

### 需求

```text
1. 对表的操作
   1. 新建表
   2. 修改表结构
   3. 删除表
2. 对表内数据的操作
   1. 增删改查

todo
    右键删除、修改

第一个界面（选表）
    先展示最近修改过的表，以及所有表类型
第二个界面
    左表右树
    表：
    增加，双击表格最后一行填信息，回车保存
    删除，删除按钮，右键删除
    修改，双击行进行修改，报错不保存
    查询，查询按钮，右键查询

```
### 表
- 表
 - _id = Table Name           string
  - Type（自定义 0、模板 1）        int
  - Clustered Index Name       string
  - col [{colName,colType,constraint}]

let x = {
  _id: "student",
  type: 1,
  clusteredIndexName: "sno",
  col: [{ colName: "sno", chColName:"学号",colType: "string", constraint: "primary key" },
  { colName: "name", chColName:"名字", colType: "string", constraint: "not null" },
  { colName: "age", chColName:"年龄", colType: "int", constraint: "none" }],
}

coltype: int float datetime varchar(64) 
constraint: primary_key(1 1)   unique(1 0)   not null(0 1)   none(0 0)

- student 
  - sno  string 
  - name string 
  - age  int

- user
  - userId     string
  - userName   string 
  - passWord   string 

改数据库
页面设计
查询失败更新
步骤拆分
历史记录

2021-01-31

treePage   Tree Cmd Step

### cmd
- Insert
  - find
  - Insert
  - repair index
  - split
- delete
  - find
  - delete
  - stealFromLeft or stealFromRight or merge
  - repair index

```js
{
  type: 'insert/delete',
  value: '',
  ts:"",// var ts=new Date().getTime()；,
}
```

tree chart

从状态1->状态6，数据有6条记录
1 2 3 4 5 6

用户点击语句4
tree -> 状态4，查找数据库的语句，逆着执行

点击了步骤分解，从3到4的详细步骤
tree -> 状态3
tree -> 状态4，并且记录 chart[] 到数据库中

展示步骤分解的过程
chart -> chart[i]，


### 图标
* drop
  * trash-alt https://fontawesome.com/icons/trash-alt?style=regular
  * 🗑️ https://twemoji.maxcdn.com/v/13.0.2/72x72/1f5d1.png
* launth
  * arrow-alt-to-right https://fontawesome.com/icons/arrow-alt-to-right?style=light
* 返回
  * arrow-alt-from-left https://fontawesome.com/icons/arrow-alt-from-left?style=light

## typeTable flag 标志

```
0 无标志
1 新建
2 最近使用
```

## 修复日志

**2021-04-06**

- 新增功能
  - [x] 数据迁移：importDbFile, exportDbFile
  - [x] 修改阶数：在索引树界面的右上角会有一个输入框，用户可以在此修改索引树的阶数，主要使用changeDegree(val)方法。
  - [ ] 当前界面的历史记录
- 修复若干 BUG
  - [x] 未填写表名可插入，重复表名可插入
  - [x] 插入（修改）成功提示
  - [x] 在主键列填入重复值
  - [x] 表数据“未填写完整”和其他提示冲突
- 待修复 BUG
  - [ ] 报错时，仍然可以点击其他地方