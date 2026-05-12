<template>
  <el-dialog
    v-model="data.dialogVisible"
    :title="props.dialogStatus"
    width="30%"
    @close="$emit('closeDialog')"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form
      ref="dataForm"
      :inline="true"
      :model="data.formData"
      class="form"
      :rules="rules"
    >
      <el-form-item label="模型名称:" prop="modelName" class="long_item">
        <el-input v-model="data.formData.modelName" placeholder="模型名称" />
      </el-form-item>
      <el-form-item label="模型类型:" prop="modelType" class="long_item">
        <el-input v-model="data.formData.modelType" placeholder="模型类型" />
        <!-- <el-select class="sh3h-search-input" v-model="props.formData.authList" multiple >
          <el-option
            v-for="item in modelTypes" 
            :label="item.codeName"
            :value="item.codeValue"
          />
        </el-select> -->
      </el-form-item>
      <el-form-item label="API密钥:" prop="apiKey" class="long_item">
        <el-input v-model="data.formData.apiKey" placeholder="API密钥" />
      </el-form-item>
      <el-form-item label="URL:" prop="url" class="long_item">
        <el-input v-model="data.formData.url" placeholder="url" />
      </el-form-item>
      <el-form-item label="基础模型:" prop="baseModel" class="long_item">
        <el-input v-model="data.formData.baseModel" placeholder="基础模型" />
      </el-form-item>
      <el-form-item label="嵌入模型:" prop="embedModel" class="long_item">
        <el-input v-model="data.formData.embedModel" placeholder="嵌入模型" />
      </el-form-item>
      <el-form-item label="模型版本:" prop="modelVersion" class="long_item">
        <el-input v-model="data.formData.modelVersion" placeholder="模型版本" />
      </el-form-item>
      <el-form-item label="模型状态:" prop="status" class="long_item">
        <el-input v-model="data.formData.status" placeholder="模型版本" />
      </el-form-item>

      <el-form-item label="温度:" prop="temperature" class="long_item">
        <el-input
          v-model="data.formData.temperature"
          placeholder="温度"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('closeDialog')">关闭</el-button>
        <el-button type="primary" @click="createData" >确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from 'vue'
import { ElForm } from 'element-plus'
import type { FormRules } from 'element-plus'
import { View, Hide, Edit } from '@element-plus/icons-vue'

import { useCode } from '@/hooks/useCode'
import { cloneDeep } from 'lodash-es'
import { CodeModel } from '@/api/model/codeModel'
import { AIModelModel } from '@/api/model/aiModel'
import { DataSourceService } from '@/api/service/Data/DataSourceService'
import { ElMessage } from 'element-plus'

const { types } = useCode()
const dataSourceSever = new DataSourceService();
const emits = defineEmits(['closeDialog', 'update', 'save'])
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: AIModelModel,
    default: {} as AIModelModel,
  },
  dialogStatus: {
    type: String,
  },
})

const data = reactive({
  dialogVisible: false,
  formData: {} as AIModelModel,
  loading: false
})
const dataForm = ref(ElForm)

const rules = reactive<InstanceType<typeof FormRules>>({
  dataSourceUrl: [{ required: true, message: '不能为空', trigger: 'blur' }]
})


const createData = () => {
  const form = unref(dataForm)
  form.validate(async (valid: any) => {
    if (valid) {
      let params = cloneDeep(data.formData)
      props.dialogStatus === '修改'
        ? emits('update', params)
        : emits('save', params)
    }
  })
}

watch(()=>props.showFlag, (newValue, oldValue) => {
  data.dialogVisible = props.showFlag
})
watch(()=>props.formData, (newValue, oldValue) => {
  data.formData = cloneDeep(props.formData)
},{
  deep: true
})
</script>
<style lang="scss" scoped>
.sql_icon-wrap {
  width: 100%;
}
.sql_icon-box {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .item {
    cursor: pointer;
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin: 10px;
    height: 100px;
    padding: 15px 10px 20px;
    box-sizing: border-box;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    &:hover {
      // box-shadow: none;
      box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
        rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
    }
    img {
      width: 30px;
      height: 30px;
      height: fit-content;
      // margin-bottom: 15px;
    }
    span {
      font-size: 16px;
    }
  }
}
.el-form {
  .long_item {
    width: 100%;
  }
}
</style>