<template>
  <div class="tool_box">
    <el-tooltip class="box-item" effect="dark" content="刷新" placement="top">
      <el-button :icon="RefreshRight" @click="refresh" />
    </el-tooltip>
    <el-tooltip class="box-item" effect="dark" content="列展示" placement="top">
      <el-button :icon="Setting" ref="setBtn" />
    </el-tooltip>
    <el-popover :virtual-ref="setBtn" trigger="click" virtual-triggering placement="bottom-end">
      <el-checkbox :label="item.title" v-for="item in props.tableColumn" :key="item.id" v-model="item.checked" />
    </el-popover>
  </div>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { RefreshRight, Setting } from '@element-plus/icons-vue'
const emits = defineEmits(['refresh']);
interface TableColumn{
  title: string,
  id:string,
  checked: boolean
}
const props = defineProps({
  tableColumn: {
    type: Array
  },
})

const setBtn = ref()
// const data = reactive({
//   dialogVisible: false
// })
const refresh = () => {
  emits('refresh')
}

// watch(props, (newValue, oldValue) => {
//   data.dialogVisible = newValue.showFlag
// })
</script>
<style lang="scss">
.tool_box {
  float: right;
  display: flex;
  button {
    width: 20px;
    height: 30px;
    margin-top: 15px;
  }
}
</style>