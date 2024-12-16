<template>
  <Title :title="props.type + '信息'">
    <template #content>
      <el-table
        :data="tableData"
        style="width: 100%; margin-bottom: 10px"
        ref="checkTable"
        @selection-change="selectionChange"
      >
        <el-table-column
          type="selection"
          :selectable="selectable"
          width="55"
          v-if="props.isChoice"
        />
        <el-table-column prop="person" label="联系人" />
        <el-table-column prop="phone" label="市民电话" />
        <el-table-column prop="typeName" :label="props.type + '方式'" />
        <el-table-column
          prop="resultName"
          :label="
            props.type === '甄别'
              ? '甄别状态'
              : props.type === '联系市民'
              ? '联系结果'
              : props.type + '结果'
          "
        />
        <el-table-column prop="reasonName" label="未联原因" />
        <el-table-column prop="time" :label="props.type + '时间'" />
        <el-table-column
          prop="description"
          :label="props.type + '内容'"
          maxlength="500"
          show-word-limit
          show-overflow-tooltip
        />
      </el-table>
    </template>
  </Title>
</template>
<script lang="ts" setup>
import {
  ref,
  reactive,
  nextTick,
  getCurrentInstance,
  onBeforeUnmount,
} from 'vue'
import Title from '@/components/Title/Title.vue'
import { ElTable } from 'element-plus'
import { SearchModel } from '@/api/model/baseModel'
import { SearchParamsModel } from '@/api/interface'
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { ContactModel } from '@/api/model/disposeModel'
import { cloneDeep } from 'lodash-es'

const props = defineProps<{
  taskId: string
  isChoice?: boolean
  isOnlyLook?: boolean
  type: string
  defaultValue?: ContactModel[]
}>()
const emit = defineEmits(['getResult'])
const { proxy } = <any>getCurrentInstance()!
const tableData = ref<ContactModel[]>([])
const checkTable = ref<InstanceType<typeof ElTable>>()
const disposeService = new DisposeService()
const searchModel = ref<SearchModel<ContactModel>[]>([
  {
    key: 'taskId',
    value: props.taskId,
    match: 'eq',
  },
])
const searchParamsModel = reactive(new SearchParamsModel<ContactModel>())
const getList = () => {
  searchParamsModel.searchParams = searchModel.value
  if (props.defaultValue) {
    tableData.value = props.defaultValue
    nextTick(() => {
      checkTable.value!.toggleRowSelection(tableData.value.find(({ status }) => status == 2), true)
    })
  } else {
    disposeService.list(searchParamsModel).then((res) => {
      if (res.code == 200) {
        tableData.value = cloneDeep(res.data.results)
        if (res.data.results.length >= 1) {
          nextTick(() => {
            const result = tableData.value.find(({ status }) => status == 2)

            if (result) {
              nextTick(() => {
                checkTable.value!.toggleRowSelection(result, true)
              })
              emit('getResult', {
                row: result,
                sourceData: cloneDeep(tableData.value),
              })
            }
          })
        }
      }
    })
  }
}
const selectable = (row: any) => {
  return !props.isOnlyLook
}
proxy.mittBus.on('updateConcatInfo', getList)
onBeforeUnmount(() => {
  proxy.mittBus.off('updateConcatInfo')
})
const selectionChange = (result: ContactModel[]) => {
  if (result.length > 1) {
    checkTable.value!.clearSelection()
    checkTable.value!.toggleRowSelection(result[result.length - 1], true)
  }
  emit('getResult', {
    row: result[result.length - 1] || {},
    sourceData: tableData.value,
  })
}
getList()
defineExpose({
  getCheckedList(){
    return tableData.value.filter(i=>i.status)
  }
})
</script>

<style lang="scss" scoped>
::v-deep(.el-table th) {
  background-color: #e1eaf7;
  color: #414951;
  padding-top: 8px;
  padding-bottom: 8px;
}

::v-deep(.el-table .cell) {
  text-align: center;
  font-size: 14px;
}

::v-deep(.el-table, .el-table__expanded-cell) {
  background-color: transparent;
}

::v-deep(.el-table tbody th) {
  background-color: transparent;
  color: #7a8693;
}

::v-deep(.el-radio__label) {
  color: #414951;
  font-weight: bold;
}
</style>
