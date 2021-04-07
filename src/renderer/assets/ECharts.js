var echartOption = {
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: [{
    type: 'tree',
    data: null,

    // left: '2%',
    // right: '2%',
    // top: '8%',
    // bottom: '20%',
    left: 'center',
    top: 'middle',

    symbol: 'none', // 隐藏符号，避免遮挡文字
    orient: 'vertical', // 树形的方向
    initialTreeDepth: -1, // 初始深度
    expandAndCollapse: true, // 是否可折叠或展开

    label: {
      position: 'inside',
      verticalAlign: 'middle',
      align: 'center',
      rotate: 0,
      fontSize: 18, // 文字大小
      color: '#222', // 文字颜色
      backgroundColor: '#f5f7fa', // 文字背景
      padding: 10,
      borderColor: '#bdbdbd',
      borderWidth: .5,
      borderRadius: 10,
    },

    lineStyle: {
      curveness: 0, // 树路径的曲线程度
    },

    // 高亮设置
    // emphasis: {
    //     focus: 'descendant',    // 聚焦后代节点
    // },

    // 提示信息
    tooltip: {
      formatter: '{c}'
    },

    roam: true, // 开启缩放和平移
  }],

  animation: true,
  animationThreshold: 1500,
}

var leavesOption = {
  label: {
    color: "white",
    backgroundColor: "#ff8f77",
    borderColor: "#ff4821",
  },
  name(name) {
    return name.split(/\s+/).map(v => v + '  ...').join('\n\n');
  }
}

var highlightOption = {
  label: {
    color: "white",
    backgroundColor: "#ff8f77",
    borderColor: "#ff4821",
  },
}

export default {
  echartOption,
  leavesOption,
  highlightOption
}