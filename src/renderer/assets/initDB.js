function initType() {
    db.typeTable.insert({
        _id: "学生表",
        type: 1,
        indexName: "学号",
        primaryKey: "学号",

        col: [{ colName: "学号", colType: "varchar", length: 32, notNull: 1, unique: 1 },
        { colName: "姓名", colType: "varchar", length: 30, notNull: 1, unique: 0 },
        { colName: "年龄", colType: "int", length: 0, notNull: 1, unique: 0 }],
    })

    db.typeTable.insert({
        _id: "用户表",
        type: 1,
        indexName: "账号",
        primaryKey: "账号",

        col: [{ colName: "账号", colType: "varchar", length: 32, notNull: 1, unique: 1 },
        { colName: "用户名", colType: "varchar", length: 30, notNull: 1, unique: 0 },
        { colName: "密码", colType: "varchar", length: 20, notNull: 1, unique: 0 }],
    })
    db.typeTable.insert({
        _id: "商品表",
        type: 1,
        indexName: "商品编号",
        primaryKey: "商品编号",

        col: [{ colName: "商品编号", colType: "varchar", length: 20, notNull: 1, unique: 1 },
        { colName: "商品名称", colType: "varchar", length: 32, notNull: 1, unique: 0 },
        { colName: "商品类型", colType: "varchar", length: 20, notNull: 1, unique: 0 },
        { colName: "单价", colType: "int", length: 0, notNull: 1, unique: 0 },
        { colName: "数量", colType: "int", length: 0, notNull: 1, unique: 0 }],
    })
    db.typeTable.ensureIndex({ fieldName: '_id', unique: true, sparse: true }, function (err) {
    });
    // console.log('typeTable>>>');
}


//初始化student
function initStudent() {
    db.学生表.find({}, (err, doc) => {
        if (doc.length < 10) {

            const numberMap = "0123456789";
            const alphaMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var stu = Array.apply(null, { length: 10 }).map(() => {
                let id = "",
                    name = "",
                    age;
                for (let i = 0; i < 12; i++) {
                    id += numberMap.charAt(Math.random() * numberMap.length);
                }
                for (let i = 0; i < 3; i++) {
                    name += alphaMap.charAt(Math.random() * alphaMap.length);
                }
                age = parseInt(Math.random() * 11 + 15, 10);
                return {
                    _id: id,
                    学号: id,
                    姓名: name,
                    年龄: age,
                };
            })

            for (let i = 0; i < 10; i++) {
                db.学生表.insert(stu[i]);
            }
        }
    });


    db.学生表.ensureIndex({ fieldName: '_id', unique: true, sparse: true }, function (err) {
    });

    // console.log('student>>>');

};


//初始化用户表
function initUser() {
    db.用户表.find({}, (err, doc) => {
        if (doc.length < 10) {
            const numberMap = "0123456789";
            const alphaMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var userInfo = Array.apply(null, { length: 10 }).map(() => {
                let id = "",
                    name = "",
                    pwd = "";
                for (let i = 0; i < 6; i++) {
                    id += numberMap.charAt(Math.random() * numberMap.length);
                }
                for (let i = 0; i < 3; i++) {
                    name += alphaMap.charAt(Math.random() * alphaMap.length);
                }
                for (let i = 0; i < 3; i++) {
                    pwd += numberMap.charAt(Math.random() * numberMap.length);
                    pwd += alphaMap.charAt(Math.random() * alphaMap.length);
                }
                return {
                    _id: id,
                    账号: id,
                    用户名: name,
                    密码: pwd,
                };
            })

            for (let i = 0; i < 10; i++) {
                db.用户表.insert(userInfo[i]);
            }

        }
    })
    db.用户表.ensureIndex({ fieldName: '_id', unique: true, sparse: true }, function (err) {
    });

    // console.log('user>>>');
}

//初始化商品表
function initCommodity() {
    db.商品表.find({}, (err, doc) => {
        if (doc.length < 10) {
            const numberMap = "0123456789";
            const alphaMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var commodityInfo = Array.apply(null, { length: 10 }).map(() => {
                let id = "",
                    name = "",
                    category = "",
                    unitPrice = 0,
                    quantity = 0;
                for (let i = 0; i < 10; i++) {
                    id += numberMap.charAt(Math.random() * numberMap.length);
                }
                for (let i = 0; i < 6; i++) {
                    name += alphaMap.charAt(Math.random() * alphaMap.length);
                }
                for (let i = 0; i < 5; i++) {
                    category += alphaMap.charAt(Math.random() * alphaMap.length);
                }

                unitPrice = parseInt(Math.random() * 13 + 7, 10);

                quantity = parseInt(Math.random() * 17 + 7, 10);
                return {
                    _id: id,
                    商品编号: id,
                    商品名称: name,
                    商品类型: category,
                    单价: unitPrice,
                    数量: quantity
                };
            })

            for (let i = 0; i < 10; i++) {
                db.商品表.insert(commodityInfo[i]);
            }

        }
    })
    db.商品表.ensureIndex({ fieldName: '_id', unique: true, sparse: true }, function (err) {
    });

    // console.log('commodity>>>');
}


async function init() {
    // console.log('init>>>');
    Date.prototype.format = function (fmt) {
        fmt = fmt || 'yyyy-MM-dd HH:mm:ss'
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "H+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    return new Promise(resolve => {
        initStudent();
        initUser();
        initCommodity();
        resolve();
    })
}

async function initTypeTable() {
    return new Promise(resolve => {
        initType()
        resolve();
    })
}
export { init, initTypeTable }