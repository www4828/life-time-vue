<template>
  <div :class="[state.className, 'common-node']">
    <div class="node">{{ state.nodeName }}</div>
    <div class="label">{{ state.label }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watchEffect, watch, inject } from 'vue'
import { EventType } from '@logicflow/core'
import { vueNodesMap } from '@logicflow/vue-node-registry'
const props = defineProps<{
    option?: any
  }>()


const state = reactive({
  nodeName: '',
  label: '',
  className: ''
})
const init = ()=>{
  if(props.option){
    state.nodeName = props.option.text
    state.label = props.option.label
    state.className = props.option.className
  }else{
    const node: any = inject('getNode')
    const graph: any = inject('getGraph')
    console.log(node().properties.className)
    state.nodeName = node().properties.nodeName
    state.label = node().properties.nodeLabel
    state.className = node().properties.className
  }
}
init()
// graph().eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, (eventData: any) => {
//   console.log('properties',eventData.properties)
// })

</script>

<style lang="scss" scoped>
.common-node {
  // width: 100px;
  height: 65px;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  cursor: pointer;
  .node {
    width: 100%;
    height: 30px;
    color: #fff;
    line-height: 30px;
    text-align: center;
  }
  .label {
    height: 30px;
    width: 100%;
    color: var(--el-color-primary);
    text-align: center;
    line-height: 30px;
    background-color: #fff;
  }
  &.primary {
    border: 1px solid var(--el-color-primary);
    .node {
      background-color: var(--el-color-primary);
    }
  }
  &.danger {
    border: 1px solid var(--el-color-danger);
    .node {
      background-color: var(--el-color-danger);
    }
    .label{
      color: var(--el-color-danger);
    }
  }
  &.info {
    border: 1px solid var(--el-color-info);
    .node {
      background-color: var(--el-color-info);
    }
    .label{
      color: var(--el-color-info);
    }
  }
  &.success {
    border: 1px solid var(--el-color-success);
    .node {
      background-color: var(--el-color-success);
    }
    .label{
      color: var(--el-color-success);
    }
  }
  &.warning {
    border: 1px solid var(--el-color-warning);
    .node {
      background-color: var(--el-color-warning);
    }
    .label{
      color: var(--el-color-warning);
    }
  }
}
</style>
