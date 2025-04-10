<template>
  <div class="demo-collapse">
    <CommonNode v-for="(item, index) in patternItems" :key='index' :option='item' @mousedown.prevent="startDrag(item)" />
  </div>
</template>

<script lang="ts" setup>
import LogicFlow from "@logicflow/core"
import { patternItems } from '@/utils/typeMap'
import { ref } from 'vue'
import CommonNode from '@/components/FlowTool/CommonNode/index.vue'

const props = defineProps({
  lf: {
    type: LogicFlow,
    required: true,
  }
})

const startDrag = (item: any) => {
  const { lf } = props;
  lf.dnd.startDrag({
    type: item.type,
    className: item.className,
    properties: {
      className: item.className,
      nodeName: item.text,
      nodeLabel: item.label,
      width: 120,
      height: 80,
    }
  })
}


</script>
<style lang='scss' scoped>
.demo-collapse {
  width: 100px;
  position: absolute;
  top: 50px;
  left: 10px;
  font-size: 16px;
  background: #fff;
  padding: 15px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  // box-sizing: border-box;
  .common-node{
    margin-bottom: 10px
  }
}

</style>