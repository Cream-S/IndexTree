function BPlusTree() {
  this.init();
}


/**
 * 输出控制
 */
BPlusTree.prototype.cmd = function (str) {

  // console.log(str);
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
    this.cmd("Delete tree", tree.graphicID);
  }
}


/**
 * 向根结点修正索引值
 * @param insertedValue
 * @return commands
 */
BPlusTree.prototype.repairToRoot = function (tree) {
  let goUp = true;
  while (tree.parent != null && goUp) {
    var currentParent = tree.parent;
    for (var parentIndex = 0; currentParent.children[parentIndex] != tree; parentIndex++);
    currentParent.keys[parentIndex] = tree.keys[tree.numKeys - 1];

    tree = tree.parent;
    if (parentIndex < currentParent.numKeys - 1) {
      this.cmd("modify index value end ");
      goUp = false;
    }
  }
}



/**
 * 插入
 * @param insertedValue
 * @return commands
 */
BPlusTree.prototype.insertElement = function (insertedValue) {
  this.commands = new Array();
  this.cmd("Inserting " + insertedValue);
  if (this.treeRoot == null) {
    this.treeRoot = new BTreeNode(this.nextIndex++);
    this.treeRoot.keys[0] = insertedValue;
  } else {
    this.insert(this.treeRoot, insertedValue);
  }
  return this.commands;
}

BPlusTree.prototype.insert = function (tree, insertValue) {
  if (tree.isLeaf) {
    this.cmd("Inserting " + insertValue + ".  Inserting into a leaf");
    tree.numKeys++;
    var insertIndex = tree.numKeys - 1;
    // 确定插入位置
    while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue) {
      tree.keys[insertIndex] = tree.keys[insertIndex - 1];
      insertIndex--;
    }
    tree.keys[insertIndex] = insertValue;
    // 若 insertValue 比当前最大值还大，需更新 treeRoot 到当前结点路径的所有索引值，之后再分裂
    if (insertIndex == tree.numKeys - 1) {
      this.repairToRoot(tree);
    }
    this.insertRepair(tree);
  } else {
    var findIndex;
    // 分支选择从左到右
    for (findIndex = 0; findIndex < tree.numKeys && tree.keys[findIndex] < insertValue; findIndex++);
    // 如果采用 numKeys = numChildren - 1 则注释该语句
    if (findIndex == tree.numKeys) {
      findIndex--;
    }
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
  var rightNode = new BTreeNode(this.nextIndex++);
  // Another Definition: (tree.keys[this.split_index])
  var risingKey = tree.keys[this.split_index - 1];
  // 调整 parent & children 指针
  if (tree.parent != null) {
    var currentParent = tree.parent;
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
  // 返回 tree
  var leftNode = tree;
  leftNode.numKeys = this.split_index;
  if (tree.parent != null) {
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
    return this.treeRoot;
  }
}


/**
 * 删除
 * @param insertedValue
 * @return commands
 */
BPlusTree.prototype.deleteElement = function (deletedValue) {
  this.commands = new Array();
  this.cmd("Deleting " + deletedValue);
  this.doDelete(this.treeRoot, deletedValue);
  // 测试暂时还不用加，有 bug 再说
  // if (this.treeRoot.numKeys == 1) {
  //   this.treeRoot = this.treeRoot.children[0];
  //   this.treeRoot.parent = null;
  // }
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
      if (tree.keys[i] == val) {
        tree.keys.splice(i, 1);
        // for (var j = i; j < tree.numKeys - 1; j++) {
        //   tree.keys[j] = tree.keys[j + 1];
        // }
        tree.numKeys--;
        if (i == tree.numKeys) {
          console.log('更新结点值');
          console.log(tree);
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
    } else {
      var parentNode = tree.parent;
      for (var parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++);
      if (parentIndex > 0 && parentNode.children[parentIndex - 1].numKeys > this.min_keys) {
        this.stealFromLeft(tree, parentIndex);
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
  // 合并索引值
  for (var i = 0; i < rightSib.numKeys; i++) {
    var insertIndex = tree.numKeys + i;
    tree.keys[insertIndex] = rightSib.keys[i];
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
  // 调整 left child, parent 的索引值
  tree.numKeys++;
  tree.keys[tree.numKeys - 1] = parentNode.keys[parentIndex] = rightSib.keys[0];
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
  for (i = 1; i < rightSib.numKeys; i++) {
    rightSib.keys[i - 1] = rightSib.keys[i];
  }
  rightSib.numKeys--;
  return tree;

}

BPlusTree.prototype.stealFromLeft = function (tree, parentIndex) {
  this.cmd("Node has too few keys.  Stealing from left sibling.");
  var parentNode = tree.parent;
  var leftSib = parentNode.children[parentIndex - 1];
  // 调整 right child, parent 的索引值
  tree.numKeys++;
  for (i = tree.numKeys - 1; i > 0; i--) {
    tree.keys[i] = tree.keys[i - 1];
  }
  tree.keys[0] = leftSib.keys[leftSib.numKeys - 1];
  parentNode.keys[parentIndex - 1] = leftSib.keys[leftSib.numKeys - 2];
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