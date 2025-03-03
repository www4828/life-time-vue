<template>
  <el-drawer :modal="false" destroy-on-close v-model="state.drawer" size="45%" :with-header="false" direction="rtl"
    class="response_drawer">
    <template #default>
      <div class="content">
        <el-icon class="close-icon" @click="close">
          <Close />
        </el-icon>
        <Title title="返回参数" />
        <el-table :data="state.list" header-cell-class-name="tableHeader">
          <el-table-column prop="paramName" label="参数名称" align="center">
            <template #default="scope">
              <el-input v-model="state.list[scope.$index].paramName" style="width: 100%" placeholder="参数名称" />
            </template>
          </el-table-column>
          <el-table-column prop="columnName" label="映射字段" align="center">
            <template #default="scope">
              <el-input v-model="state.list[scope.$index].columnName" style="width: 100%" placeholder="映射字段" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="参数类型" align="center">
            <template #default="scope">
              <el-select class="sh3h-search-input" v-model="state.list[scope.$index].paramType"
                style="width: 100%" placeholder="参数类型">
                <el-option label="String" value="String" />
                <el-option label="Int" value="Int" />
                <el-option label="Date" value="Date" />
                <el-option label="Array" value="Array" />
                <el-option label="Boolean" value="Boolean" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="example" label="示例值" align="center">
            <template #default="scope">
              <el-input v-model="state.list[scope.$index].example" style="width: 100%" placeholder="示例值" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" align="center">
            <template #default="scope">
              <el-input v-model="state.list[scope.$index].remark" style="width: 100%" placeholder="备注" />
            </template>
          </el-table-column>
          <el-table-column prop="privacy" label="脱敏" align="center" width="80px">
            <template #default="scope">
              <el-checkbox v-model="state.list[scope.$index].privacy" size="large" />
            </template>
          </el-table-column>
          <el-table-column label="" align="center" class-name="setting" width="50px">
            <template #default="scope">
              <el-link type="primary" @click="deleteDocument(scope)" :underline="false">
                <el-icon class="el-icon--right">
                  <Delete />
                </el-icon>
              </el-link>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <div class="op-icon">
          <el-tooltip effect="light" content="解析SQL语句" placement="bottom">
            <el-link type="primary" :underline="false">
              <el-icon>
                <SetUp />
              </el-icon>
            </el-link>
          </el-tooltip>
          <el-tooltip effect="light" content="添加请求参数" placement="bottom">
            <el-link type="primary" :underline="false" @click="addDocument">
              <el-icon>
                <DocumentAdd />
              </el-icon>
            </el-link>
          </el-tooltip>
        </div>
        <Title title="返回结构" />
        <el-form :model="state.formData" label-width="120px" style="max-width: 50%" >
          <el-form-item label="数据结构:">
            <el-select v-model="state.formData.type" placeholder="请选择">
              <el-option label="树形" value="树形" />
              <el-option label="扁平形" value="扁平形" />
            </el-select>
          </el-form-item>
          <template v-if="state.formData.type === '树形' " >
            <el-form-item label="key值">
              <el-input v-model="state.formData.key" />
            </el-form-item>
            <el-form-item label="value值">
              <el-input v-model="state.formData.value" />
            </el-form-item>
            <el-form-item label="父节点key值">
              <el-input v-model="state.formData.parentKey" />
            </el-form-item>
            <el-form-item label="根节点">
              <el-input v-model="state.formData.nodeValue" />
            </el-form-item>
          </template>
        </el-form>
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="close">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from 'vue'
import { ElForm } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { RequestInfoModel } from '@/api/model/apiModel'
import Title from '@/components/Title/Title.vue'
import { Close, Delete, SetUp, DocumentAdd } from '@element-plus/icons-vue'

const emits = defineEmits(['closeDialog', 'update', 'save'])
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Array<RequestInfoModel>,
    default: [] as RequestInfoModel[],
  },
})

const state = reactive({
  drawer: false,
  formData: {type:'扁平形'} as any,
  list: [] as RequestInfoModel[],
  isPage: '0',
})

const close = () => {
  state.drawer = false
  emits('closeDialog')
}

const init = () => { }
init()
const deleteDocument = (scope: any) => {
  state.list = state.list.filter(
    (item, index) => index !== scope.$index
  )
}
const addDocument = () => {
  state.list.push({
    apiCode: '',
    columnName: '',
    dataType: '',
    defaultValue: '',
    example: '',
    paramModel: '',
    paramName: '',
    paramType: '',
    privacy: '',
    remark: '',
    required: '',
  } as RequestInfoModel)
}

watch(
  () => props.showFlag,
  (newValue, oldValue) => {
    state.drawer = props.showFlag
  }
)
watch(
  () => props.formData,
  (newValue, oldValue) => {
    state.formData = cloneDeep(props.formData)
  },
  {
    deep: true,
  }
)

defineExpose({
  getformData() {
    return {
      params: state.list.filter(i=>i.paramName),
      formData: state.formData,
    }
  },
})
</script>
<style lang="scss" scoped>
.op-icon {
  width: 100%;
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;

  .el-icon {
    margin-right: 10px;
    font-size: 20px;
  }
}

.el-table {
  min-height: 300px;
}

.close-icon {
  position: absolute;
  right: 15px;
  top: 15px;
}
</style>
