import { default as treeSetting } from "@/assets/ECharts";

//已存储步骤分解

function BPlusTree() {
  this.init();

}



/**
 * 输出控制
 */
BPlusTree.prototype.cmd = function (str) {
  this.stepData += ('\n' + str);
  // console.log("stepStr:", str);
  // console.log("stepData:", this.stepData);
}


/**
 * 初始化
 */
BPlusTree.prototype.init = function (degree) {
  degree = degree || 3;
  this.nextIndex = 0;
  this.max_degree = degree;
  this.max_keys = degree;
  this.min_keys = Math.ceil(degree / 2);
  this.split_index = Math.floor((degree + 1) / 2);
  this.commands = new Array();
  this.stepData = "";
  db.oprateRecord.remove({}, { multi: true }, (err, doc) => {
    // console.log("clearOprateRecord ", err, doc)
  });
  this.opId = 1;
}



/**
 * 重置
 */
BPlusTree.prototype.reset = function (degree) {
  degree = degree || 3;
  this.nextIndex = 3;
  this.max_degree = degree;
  this.max_keys = degree;
  this.min_keys = Math.ceil(degree / 2);
  this.split_index = Math.floor((degree + 1) / 2);
  this.treeRoot = null;
  this.stepData = "";
  this.stepData.length = 0;
  this.opId = 1;
}


/**
 * 阶
 */
BPlusTree.prototype.changeDegree = function (degree) {
  this.commands = new Array();
  this.deleteTree(this.treeRoot);
  this.treeRoot = null;
  this.nextIndex = 3;
  this.max_degree = degree;
  this.max_keys = degree;
  this.min_keys = Math.ceil(degree / 2);
  this.split_index = Math.floor((degree + 1) / 2);
  // Another Definition
  // this.max_keys = degree - 1;
  // this.min_keys = Math.floor((degree + 1) / 2) - 1;
  // this.split_index = Math.floor(degree / 2);
  return this.commands;
}


/**
 * 删除树
 * @param ignored
 * @return commands
 */
BPlusTree.prototype.clearTree = function (ignored) {
  this.commands = new Array();
  this.deleteTree(this.treeRoot);
  this.treeRoot = null;
  this.nextIndex = 3;
  return this.commands;
}

BPlusTree.prototype.deleteTree = function (tree) {
  if (tree != null) {
    if (!tree.isLeaf) {
      for (var i = 0; i <= tree.numKeys; i++) {
        this.deleteTree(tree.children[i]);
        tree.children[i] == null;
      }
    }
    /* todo: ts 是什么 */
    // this.cmd("Delete tree " + ts);
    // db.oprateRecord.insert({
    //   _id: this.this.opId++,
    //   oprate: "Delete tree",
    //   val: "",

    // }, (err, doc) => {
    //   console.log(err, doc)
    // })
  }
}


/**
 * 向根结点修正索引值
 * @param insertValue
 * @return commands
 */
BPlusTree.prototype.repairToRoot = function (tree) {
  let goUp = true;
  while (tree.parent != null && goUp) {
    var currentParent = tree.parent;
    let oldKey = '';
    for (let i = 0; i < currentParent.numKeys; i++) {
      oldKey += currentParent.keys[i] + " "
    }

    for (var parentIndex = 0; currentParent.children[parentIndex] != tree; parentIndex++);
    currentParent.keys[parentIndex] = tree.keys[tree.numKeys - 1];
    let newKey = "";
    for (let i = 0; i < currentParent.numKeys; i++) {
      newKey += currentParent.keys[i] + " "
    }
    this.cmd("repair node " + oldKey + " to " + newKey)
    let obj = {};
    obj.commands = "修正结点 " + oldKey + " 为 " + newKey;
    obj.data = this.dfsTree(this.treeRoot);
    obj.oprate = {
      op: "repair",
      val: [newKey]
    }
    opStep.push(obj);


    tree = tree.parent;
    if (parentIndex < currentParent.numKeys - 1) {

      goUp = false;
    }
  }
  this.cmd("repair index value end !");
}



/**
 * 插入
 * @param insertValue
 * @return commands
 */
var opStep = [];
BPlusTree.prototype.insertElement = function (insertValue) {
  opStep = [];
  this.commands = new Array();

  this.cmd("insert " + insertValue + " start !");
  // console.log("insert " + insertValue + " start !");
  if (this.treeRoot == null) {
    this.treeRoot = new BTreeNode(this.nextIndex++);
    this.treeRoot.keys[0] = insertValue;

    this.cmd("insert " + insertValue + "  into the node");
    // console.log("insert " + insertValue + "into the node");

    let obj = {};
    obj.commands = "插入 " + insertValue;
    obj.data = this.dfsTree(this.treeRoot);
    obj.oprate = {
      op: "insert",
      val: [insertValue]
    }
    opStep.push(obj);

  } else {
    this.insert(this.treeRoot, insertValue);

  }


  if (insertValue != "") {
    let data = this.dfsTree(this.treeRoot)

    db.oprateRecord.insert({
      _id: this.opId++,
      oprate: "插入",
      val: insertValue,
      data: data,//插入后的树
      Command: opStep
    }, (err, doc) => {
      // console.log(err, doc)
    })
    // db.oprateRecord.find({}, (err, doc) => {
    //   console.log("存在数据条数 :", doc.length);
    // })
  }
  return this.commands;
}


BPlusTree.prototype.insert = function (tree, insertValue) {
  opStep = [];
  if (tree.isLeaf) {
    var nodeKey = '';
    for (let i = 0; i < tree.numKeys; i++) {
      nodeKey += tree.keys[i] + " ";
    }

    this.cmd("find node " + nodeKey);

    let obj = {};
    obj.commands = "找到结点 " + nodeKey;
    obj.data = this.dfsTree(this.treeRoot);
    obj.oprate = {
      op: "find",
      val: [nodeKey]
    }
    opStep.push(obj);
    obj = {};

    tree.numKeys++;
    var insertIndex = tree.numKeys - 1;
    // 确定插入位置
    while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue) {
      tree.keys[insertIndex] = tree.keys[insertIndex - 1];
      insertIndex--;
    }
    tree.keys[insertIndex] = insertValue;
    var newNode = "";
    for (let i = 0; i < tree.numKeys; i++) {
      newNode += tree.keys[i] + ' '
    }
    this.cmd("Inserting " + insertValue + "  into the node");
    obj.commands = "插入 " + insertValue;
    obj.data = this.dfsTree(this.treeRoot);
    obj.oprate = {
      op: "insert",
      val: [newNode]
    }
    opStep.push(obj);
    obj = {};
    // 若 insertValue 比当前最大值还大，需更新 treeRoot 到当前结点路径的所有索引值，之后再分裂
    if (insertIndex == tree.numKeys - 1) {
      this.cmd("repair after inserting " + insertValue);
      this.repairToRoot(tree);
    }
    this.insertRepair(tree)

    return opStep;
  } else {
    var findIndex;
    // 分支选择从左到右
    for (findIndex = 0; findIndex < tree.numKeys && tree.keys[findIndex] < insertValue; findIndex++);
    // 如果采用 numKeys = numChildren - 1 则注释该语句
    if (findIndex == tree.numKeys) {
      findIndex--;
    }
    // console.log("!!!", tree.children[findIndex]);
    let nodeKey = '';
    tree.keys.forEach(o => {
      nodeKey += o + " ";
    })
    this.cmd("find node :" + nodeKey);
    this.insert(tree.children[findIndex], insertValue);
  }
}


BPlusTree.prototype.insertRepair = function (tree) {
  if (tree.numKeys <= this.max_keys) {
    return;
  } else if (tree.parent == null) {
    this.treeRoot = this.split(tree);

    return;
  } else {

    var newNode = this.split(tree);

    this.insertRepair(newNode);
  }
}

BPlusTree.prototype.split = function (tree) {
  var oldNode = "";
  for (let i = 0; i < tree.numKeys; i++) {
    oldNode += tree.keys[i] + ' '
  }
  var rightNode = new BTreeNode(this.nextIndex++);
  // Another Definition: (tree.keys[this.split_index])
  var risingKey = tree.keys[this.split_index - 1];

  // 调整 parent & children 指针
  if (tree.parent != null) {
    var currentParent = tree.parent;
    var oldParent = "";
    for (let i = 0; i < currentParent.numKeys; i++) {
      oldParent += currentParent.keys[i] + ' '
    }
    // No Error Handler
    for (var parentIndex = 0; currentParent.children[parentIndex] != tree; parentIndex++);
    for (var i = currentParent.numKeys; i > parentIndex + 1; i--) {
      currentParent.children[i] = currentParent.children[i - 1];
      currentParent.keys[i] = currentParent.keys[i - 1];
    }
    currentParent.numKeys++;
    currentParent.keys[parentIndex + 1] = currentParent.keys[parentIndex];
    currentParent.keys[parentIndex] = risingKey;
    currentParent.children[parentIndex + 1] = rightNode;
    rightNode.parent = currentParent;
    var newParent = "";
    for (let i = 0; i < currentParent.numKeys; i++) {
      newParent += currentParent.keys[i] + ' '
    }


    // for (var parentIndex = 0; currentParent.children[parentIndex] != tree; parentIndex++);
    // for (var i = currentParent.numKeys; i > parentIndex; i--) {
    //   currentParent.children[i + 1] = currentParent.children[i];
    //   currentParent.keys[i] = currentParent.keys[i - 1];
    // }
    // currentParent.numKeys++;
    // currentParent.keys[parentIndex] = risingKey;
    // currentParent.children[parentIndex + 1] = rightNode;
    // rightNode.parent = currentParent;
  }
  // 调整 leftNode & rightNode
  var rightSplit;
  if (tree.isLeaf) {
    rightSplit = this.split_index;
    rightNode.next = tree.next;
    tree.next = rightNode;
  } else {
    rightSplit = this.split_index;
    // B+ tree of 3 degree split, keys from 3 minus to 2, keys[1] will be removed.
    // rightSplit = this.split_index + 1;
  }

  rightNode.numKeys = tree.numKeys - rightSplit;

  // 若 (max_keys = degree - 1) 则条件改为 (i < tree.numKeys + 1)
  for (var i = rightSplit; i < tree.numKeys; i++) {
    rightNode.children[i - rightSplit] = tree.children[i];
    // 清理 left child 剩下的无用指针
    if (tree.children[i] != null) {
      rightNode.isLeaf = false;
      tree.children[i].parent = rightNode;
      tree.children[i] = null;
    }
  }
  for (i = rightSplit; i < tree.numKeys; i++) {
    rightNode.keys[i - rightSplit] = tree.keys[i];
  }
  var newRightNode = "";
  for (let i = 0; i < rightNode.numKeys; i++) {
    newRightNode += rightNode.keys[i] + ' '
  }
  // 返回 tree
  var leftNode = tree;
  leftNode.numKeys = this.split_index;
  var newLeftNode = "";
  for (let i = 0; i < leftNode.numKeys; i++) {
    newLeftNode += leftNode.keys[i] + ' '
  }
  if (tree.parent != null) {
    let newParent = "";
    for (let i = 0; i < tree.parent.numKeys; i++) {
      newParent += tree.parent.keys[i] + ' '
    }

    let obj = {};
    obj.commands = "分裂旧结点 " + oldNode;
    obj.data = this.dfsTree(this.treeRoot);
    obj.oprate = {
      op: "divide",
      val: [newParent, newRightNode, newLeftNode]
    }
    opStep.push(obj);

    return tree.parent;
  } else {
    this.treeRoot = new BTreeNode(this.nextIndex++);
    // 设置索引值
    this.treeRoot.keys[0] = risingKey;
    this.treeRoot.keys[1] = rightNode.keys[rightNode.numKeys - 1];
    this.treeRoot.numKeys = 2;
    // this.treeRoot.keys[0] = risingKey;
    this.treeRoot.children[0] = leftNode;
    this.treeRoot.children[1] = rightNode;
    leftNode.parent = rightNode.parent = this.treeRoot;
    this.treeRoot.isLeaf = false;

    let newParent = "";
    for (let i = 0; i < this.treeRoot.numKeys; i++) {
      newParent += this.treeRoot.keys[i] + ' '
    }

    let obj = {};
    obj.commands = "分裂旧结点 " + oldNode;
    obj.data = this.dfsTree(this.treeRoot);
    obj.oprate = {
      op: "divide",
      val: [, newParent, newRightNode, newLeftNode]
    }
    opStep.push(obj);
    return this.treeRoot;
  }
}


/**
 * 删除
 * @param insertValue
 * @return commands
 */
BPlusTree.prototype.deleteElement = function (deletedValue) {
  this.commands = new Array();
  this.cmd("Deleting " + deletedValue + " start !");
  let data = this.dfsTree(this.treeRoot);
  opStep = [];
  this.doDelete(this.treeRoot, deletedValue);
  // 测试暂时还不用加，有 bug 再说
  // if (this.treeRoot.numKeys == 1) {
  //   this.treeRoot = this.treeRoot.children[0];
  //   this.treeRoot.parent = null;
  // }


  if (deletedValue != "") {

    db.oprateRecord.insert({
      _id: this.opId++,
      oprate: "删除",
      val: deletedValue,

      data: data,//删除前的树
      Command: opStep
    }, (err, doc) => {
      console.log(err, doc)
    })
  }

  return this.commands;
}

BPlusTree.prototype.doDelete = function (tree, val) {
  if (tree != null) {
    var i;
    for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);

    if (!tree.isLeaf) {
      if (i == tree.numKeys) {
        --i;
      }
      this.doDelete(tree.children[i], val);
      // if (tree.keys[i] == val) {
      //   this.doDelete(tree.children[i + 1], val);
      // } else {
      //   this.doDelete(tree.children[i], val);
      // }
    }
    if (tree.isLeaf) {
      var nodeKey = "";//删除前的结点
      var newNode = "";//删除后的结点
      for (let i = 0; i < tree.numKeys; i++) {
        nodeKey += tree.keys[i] + " ";
        if (i != tree.numKeys - 1)
          newNode += tree.keys[i] + " ";
      }

      this.cmd("find node " + nodeKey);
      let obj = {};
      obj.commands = "找到结点 " + nodeKey;
      obj.data = this.dfsTree(this.treeRoot);
      obj.oprate = {
        op: "find",
        val: [nodeKey]
      }
      opStep.push(obj);
      if (tree.keys[i] == val) {
        tree.keys.splice(i, 1);
        // for (var j = i; j < tree.numKeys - 1; j++) {
        //   tree.keys[j] = tree.keys[j + 1];
        // }
        tree.numKeys--;
        let obj = {};
        obj.commands = "删除 " + val;
        obj.data = this.dfsTree(this.treeRoot);
        obj.oprate = {
          op: "delete",
          val: [newNode]//删除后的结点
        }
        opStep.push(obj);


        if (i == tree.numKeys) {
          // console.log('更新结点值');
          // console.log(tree);
          this.repairToRoot(tree);
        }
        // if we remove the smallest element in a leaf, go up our parent stack, and fix index keys
        // if (i == 0 && tree.parent != null) {
        //   var nextSmallest = "";
        //   var parentNode = tree.parent;
        //   var parentIndex;
        //   for (parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
        //   if (tree.numKeys == 0) {
        //     if (parentIndex == parentNode.numKeys) {
        //       nextSmallest == "";
        //     } else {
        //       nextSmallest = parentNode.children[parentIndex + 1].keys[0];
        //     }
        //   } else {
        //     nextSmallest = tree.keys[0];
        //   }
        //   while (parentNode != null) {
        //     if (parentIndex > 0 && parentNode.keys[parentIndex - 1] == val) {
        //       parentNode.keys[parentIndex - 1] = nextSmallest;
        //     }
        //     var grandParent = parentNode.parent;
        //     for (parentIndex = 0; grandParent != null && grandParent.children[parentIndex] != parentNode; parentIndex++);
        //     parentNode = grandParent;
        //   }
        // }
        this.repairAfterDelete(tree);
      } else {
        this.cmd("Element " + val + " is not in the tree");
      }
    }
  }
}

BPlusTree.prototype.repairAfterDelete = function (tree) {
  if (tree.numKeys < this.min_keys) {
    if (tree.parent == null) {
      // children 进行 Merge 后 parent 仅有一个索引值
      // Another Definition: (tree.numKeys == 0)
      // 原本代码没有 (!tree.isLeaf) 条件，在当前模式仅剩根结点时会报错
      if (tree.numKeys == 1 && !tree.isLeaf) {
        this.treeRoot = tree.children[0];
        if (this.treeRoot != null) {
          this.treeRoot.parent = null;
        }
      }
      let node = "";
      for (let i = 0; i < this.treeRoot.numKeys; i++) {
        node += this.treeRoot.keys[i] + ' '
      }
      let obj = {};
      obj.commands = "修正根结点 " + node;
      obj.data = this.dfsTree(this.treeRoot);
      obj.oprate = {
        op: "repair",
        val: [node]
      }
      opStep.push(obj);


    } else {
      var parentNode = tree.parent;
      for (var parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
      if (parentIndex > 0 && parentNode.children[parentIndex - 1].numKeys > this.min_keys) {
        this.stealFromLeft(tree, parentIndex);
        // var node = "";

        // for (let i = 0; i < tree.numKeys; i++) {
        //   node += tree.keys[i] + " ";
        // }
        // let obj = {};
        // obj.commands = "node " + node + " steal from left";
        // obj.data = this.dfsTree(this.treeRoot);
        // opStep.push(obj);

      } else if (parentIndex < parentNode.numKeys - 1 && parentNode.children[parentIndex + 1].numKeys > this.min_keys) {
        // Another Definition: parentIndex < parentNode.numKeys
        this.stealFromRight(tree, parentIndex);


      } else {
        // Merge with sibling
        var nextNode = (parentIndex == 0) ? (this.mergeRight(tree)) : (this.mergeRight(parentNode.children[parentIndex - 1]));

        this.repairAfterDelete(nextNode.parent);

      }
    }
  }
}

BPlusTree.prototype.mergeRight = function (tree) {
  var parentNode = tree.parent;
  var parentIndex;
  for (parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
  var rightSib = parentNode.children[parentIndex + 1];
  var node = "";

  for (let i = 0; i < tree.numKeys; i++) {
    node += tree.keys[i] + " ";
  }
  var rightNode = '';
  // 合并索引值
  for (var i = 0; i < rightSib.numKeys; i++) {
    var insertIndex = tree.numKeys + i;
    tree.keys[insertIndex] = rightSib.keys[i];
    rightNode += rightSib.keys[i] + " ";
  }
  // if (!tree.isLeaf) {
  //   tree.keys[tree.numKeys] = parentNode.keys[parentIndex];
  // }
  // for (var i = 0; i < rightSib.numKeys; i++) {
  //   var insertIndex = tree.numKeys + 1 + i;
  //   if (tree.isLeaf) {
  //     insertIndex -= 1;
  //   }
  //   tree.keys[insertIndex] = rightSib.keys[i];
  // }
  // 调整合并结点的 next, children, numKeys
  if (!tree.isLeaf) {
    for (i = 0; i < rightSib.numKeys; i++) {
      tree.children[tree.numKeys + i] = rightSib.children[i];
      tree.children[tree.numKeys + i].parent = tree;
    }
  } else {
    tree.next = rightSib.next;
  }
  tree.numKeys = tree.numKeys + rightSib.numKeys;
  var newNode = "";
  for (let i = 0; i < tree.numKeys; i++) {
    newNode += tree.keys[i] + ' '
  }
  // if (!tree.isLeaf) {
  //   for (i = 0; i <= rightSib.numKeys; i++) {
  //     tree.children[tree.numKeys + 1 + i] = rightSib.children[i];
  //     tree.children[tree.numKeys + 1 + i].parent = tree;
  //   }
  //   tree.numKeys = tree.numKeys + rightSib.numKeys + 1;
  // } else {
  //   tree.numKeys = tree.numKeys + rightSib.numKeys;
  //   tree.next = rightSib.next;
  // }

  // 调整 parent 的 children 指针
  parentNode.keys[parentIndex] = parentNode.keys[parentIndex + 1];
  for (i = parentIndex + 2; i < parentNode.numKeys; i++) {
    parentNode.children[i - 1] = parentNode.children[i];
    parentNode.keys[i - 1] = parentNode.keys[i];
  }
  parentNode.numKeys--;
  let newParent = "";
  for (let i = 0; i < parentNode.numKeys; i++) {
    newParent += parentNode.keys[i] + " "
  }
  let obj = {};
  obj.commands = "合并结点 " + node + " 和 " + rightNode;
  obj.data = this.dfsTree(this.treeRoot);
  obj.oprate = {
    op: "merge",
    val: [newParent, newNode]//合并后的结点
  }
  opStep.push(obj);
  // for (i = parentIndex + 1; i < parentNode.numKeys; i++) {
  //   parentNode.children[i] = parentNode.children[i + 1];
  //   parentNode.keys[i - 1] = parentNode.keys[i];
  // }
  // parentNode.numKeys--;
  // TODO: 释放 parentNode 删除的内存
  // parentNode.children.length = parentNode.numKeys;

  return tree;
}

BPlusTree.prototype.stealFromRight = function (tree, parentIndex) {
  this.cmd("Stealing from right sibling");
  var parentNode = tree.parent;
  var rightSib = parentNode.children[parentIndex + 1];
  var node = "";
  for (let i = 0; i < tree.numKeys; i++) {
    node += tree.keys[i] + " ";
  }

  // 调整 left child, parent 的索引值

  tree.numKeys++;

  tree.keys[tree.numKeys - 1] = parentNode.keys[parentIndex] = rightSib.keys[0];
  var newNode = "";
  for (let i = 0; i < tree.numKeys; i++) {
    newNode += tree.keys[i] + ' ';
  }
  var newParent = "";
  for (let i = 0; i < parentNode.numKeys; i++) {
    newParent += parentNode.keys[i] + ' '
  }

  // tree.numKeys++;
  // if (tree.isLeaf) {
  //   tree.keys[tree.numKeys - 1] = rightSib.keys[0];
  //   parentNode.keys[parentIndex] = rightSib.keys[1];
  // } else {
  //   tree.keys[tree.numKeys - 1] = parentNode.keys[parentIndex];
  //   parentNode.keys[parentIndex] = rightSib.keys[0];
  // }
  // 调整 left child, right child 的 children 指针
  if (!tree.isLeaf) {
    tree.children[tree.numKeys - 1] = rightSib.children[0];
    tree.children[tree.numKeys - 1].parent = tree;
    for (var i = 1; i < rightSib.numKeys; i++) {
      rightSib.children[i - 1] = rightSib.children[i];
    }
  }
  // if (!tree.isLeaf) {
  //   tree.children[tree.numKeys] = rightSib.children[0];
  //   tree.children[tree.numKeys].parent = tree;
  //   for (var i = 1; i < rightSib.numKeys + 1; i++) {
  //     rightSib.children[i - 1] = rightSib.children[i];
  //   }
  // }
  // 调整 right child 的索引值
  var newRight = "";
  for (i = 1; i < rightSib.numKeys; i++) {
    rightSib.keys[i - 1] = rightSib.keys[i];
    newRight += rightSib.keys[i] + " ";
  }
  rightSib.numKeys--;

  let obj = {};
  obj.commands = "结点 " + node + " 从右兄弟结点借元素";
  obj.data = this.dfsTree(this.treeRoot);
  obj.oprate = {
    op: "stealRight",
    val: [newNode, newParent, newRight]
  }
  opStep.push(obj);

  return tree;

}

BPlusTree.prototype.stealFromLeft = function (tree, parentIndex) {
  this.cmd("Node has too few keys.  Stealing from left sibling.");
  var parentNode = tree.parent;
  var leftSib = parentNode.children[parentIndex - 1];
  var node = "";
  for (let i = 0; i < tree.numKeys; i++) {
    node += tree.keys[i] + " ";
  }
  // 调整 right child, parent 的索引值
  tree.numKeys++;
  for (i = tree.numKeys - 1; i > 0; i--) {
    tree.keys[i] = tree.keys[i - 1];
  }
  tree.keys[0] = leftSib.keys[leftSib.numKeys - 1];
  parentNode.keys[parentIndex - 1] = leftSib.keys[leftSib.numKeys - 2];
  var newNode = "";
  for (let i = 0; i < tree.numKeys; i++) {
    newNode += tree.keys[i] + ' ';
  }
  var newParent = "";
  for (let i = 0; i < parentNode.numKeys; i++) {
    newParent += parentNode.keys[i] + ' '
  }

  // tree.numKeys++;
  // for (i = tree.numKeys - 1; i > 0; i--) {
  //   tree.keys[i] = tree.keys[i - 1];
  // }
  // if (tree.isLeaf) {
  //   tree.keys[0] = leftSib.keys[leftSib.numKeys - 1];
  //   parentNode.keys[parentIndex - 1] = leftSib.keys[leftSib.numKeys - 1];
  // } else {
  //   tree.keys[0] = parentNode.keys[parentIndex - 1];
  //   parentNode.keys[parentIndex - 1] = leftSib.keys[leftSib.numKeys - 1];
  // }
  // 调整 left child, right child 的 children 指针
  if (!tree.isLeaf) {
    for (var i = tree.numKeys - 1; i > 0; i--) {
      tree.children[i] = tree.children[i - 1];
    }
    tree.children[0] = leftSib.children[leftSib.numKeys - 1];
    leftSib.children[leftSib.numKeys - 1] = null;
    tree.children[0].parent = tree;
  }
  // if (!tree.isLeaf) {
  //   for (var i = tree.numKeys; i > 0; i--) {
  //     tree.children[i] = tree.children[i - 1];
  //   }
  //   tree.children[0] = leftSib.children[leftSib.numKeys];
  //   leftSib.children[leftSib.numKeys] = null;
  //   tree.children[0].parent = tree;
  // }
  // 调整 left child 的索引值
  leftSib.numKeys--;
  var newLeft = "";
  for (let i = 0; i < leftSib.numKeys; i++) {
    newLeft += leftSib.keys[i] + ' ';
  }

  let obj = {};
  obj.commands = "结点 " + node + " 从左兄弟结点借元素";
  obj.data = this.dfsTree(this.treeRoot);
  obj.oprate = {
    op: "stealLeft",
    val: [newNode, newParent, newLeft]
  }
  opStep.push(obj);
  return tree;
}


/**
 * 查找某个值
 * @param findValue
 * @return commands
 */
BPlusTree.prototype.findElement = function (findValue) {
  this.commands = new Array();
  this.cmd("Finding " + findValue);
  this.findInTree(this.treeRoot, findValue);
  return this.commands;
}

BPlusTree.prototype.findInTree = function (tree, val) {
  if (tree != null) {
    var i;
    for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
    if (i == tree.numKeys) {
      if (!tree.isLeaf) {
        this.findInTree(tree.children[tree.numKeys], val);
      } else {
        this.cmd("Element " + val + " is not in the tree");
      }
    } else if (tree.keys[i] > val) {
      if (!tree.isLeaf) {
        this.findInTree(tree.children[i], val);
      } else {
        this.cmd("Element " + val + " is not in the tree");
      }
    } else {
      if (tree.isLeaf) {
        this.cmd("Element " + val + " found");
      } else {
        this.findInTree(tree.children[i + 1], val);
      }
    }
  } else {
    this.cmd("Element " + val + " is not in the tree");
  }
}

// this.treeData = this.dfsTree(this.tree.treeRoot);
BPlusTree.prototype.dfsTree = function (tree) {
  if (tree == null) {
    return {};
  }
  let nameArr = [];
  for (let i = 0; i < tree.numKeys; i++) {
    nameArr.push(tree.keys[i]);
  }
  let sonArr = [];
  if (!tree.isLeaf) {
    for (let i = 0; i < tree.numKeys; i++) {
      sonArr.push(this.dfsTree(tree.children[i]));
    }
  }
  let ret = {
    name: nameArr.join("  "),
    children: sonArr,
  };
  if (sonArr.length == 0) {
    ret.name = treeSetting.leavesOption.name(ret.name);
  }
  return ret;
}


function BTreeNode(id) {
  this.graphicID = id;
  this.numKeys = 1;
  this.keys = [];
  this.parent = null;
  this.children = [];
  this.isLeaf = true;
  this.next = null; // 要连接左右节点
}

export default BPlusTree