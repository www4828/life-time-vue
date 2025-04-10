export const toolMap = {
  undo: {
    name: 'undo',
    desc: '返回上一步',
    icon: 'http://8.155.10.223/lifetime/static/images/prev.png'
  },
  redo: {
    name: 'redo',
    desc: '恢复下一步',
    icon: 'http://8.155.10.223/lifetime/static/images/next.png'
  },
  zoomIn: {
    name: 'zoomIn',
    desc: '画布放大',
    icon: 'http://8.155.10.223/lifetime/static/images/zoomIn.png'
  },
  zoomOut: {
    name: 'zoomOut',
    desc: '画布缩小',
    icon: 'http://8.155.10.223/lifetime/static/images/zoomOut.png'
  },
  fitView: {
    name: 'fitView',
    desc: '区域适应',
    icon: 'http://8.155.10.223/lifetime/static/images/fitView.png'
  },
  beautify: {
    name: 'beautify',
    desc: '美化布局',
    icon: 'http://8.155.10.223/lifetime/static/images/beautify.png'
  },
  reset: {
    name: 'reset',
    desc: '重置',
    icon: 'http://8.155.10.223/lifetime/static/images/reset.png'
  },
  clear: {
    name: 'clear',
    desc: '清空画布',
    icon: 'http://8.155.10.223/lifetime/static/images/clear.png'
  }
  // ,
  // navigation: {
  //   name: 'navigation',
  //   desc: '全图导航',
  //   icon: 'http://8.155.10.223/lifetime/static/images/zoomIn.png'
  // }
}


export const patternItems = [
  {
    type: 'custom-vue-node',
    text: '开始',
    label: '节点1',
    className: 'primary'
  },
  {
    type: 'custom-vue-node',
    text: '节点2',
    label: '节点2',
    className: 'warning'
  },
  {
    type: 'custom-vue-node',
    text: '节点3',
    label: '节点3',
    className: 'success'
  },
  {
    type: 'custom-vue-node',
    text: '节点4',
    label: '节点4',
    className: 'info'
  },
  {
    type: 'custom-vue-node',
    text: '结束',
    label: '节点5',
    className: 'danger'
  }
]