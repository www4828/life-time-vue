<template>
  <div class="flow-wrap">
    <div class="container" ref="container"></div>
    <Palette :lf="logicflow" />
    <ToolBar :lf="logicflow" />
  </div>
</template>
<script scoped lang="ts" setup>
import { h, nextTick, ref } from 'vue';
import LogicFlow from '@logicflow/core'
import '@logicflow/core/lib/style/index.css'
import { DndPanel, SelectionSelect, Menu, Control } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'
import ToolBar from '@/components/FlowTool/ToolBar/index.vue'
import { register } from '@logicflow/vue-node-registry'
import CommonNode from '@/components/FlowTool/CommonNode/index.vue'
import Palette from '@/components/FlowTool/Palette/index.vue'


LogicFlow.use(DndPanel);
LogicFlow.use(SelectionSelect);
LogicFlow.use(Menu);
// LogicFlow.use(Control);

const container = ref()
const logicflow = ref()

const init = () => {
  logicflow.value = new LogicFlow({
    container: container.value,
    grid: true,
    plugins: [Menu],
  });
  register({
    type: 'custom-vue-node',
    component: CommonNode
  }, logicflow.value)
  logicflow.value.setTheme({
    baseEdge: {
      stroke: "#999",
      strokeWidth: 2,
    },
  });
  logicflow.value.render()
}


nextTick(() => {
  init()
})
</script>
<style lang="scss" scoped>
.flow-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 40px 0 0;
  box-sizing: border-box;

  .container {
    width: 100%;
    height: 100%;
  }
}
</style>
