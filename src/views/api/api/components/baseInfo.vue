<template>
  <el-form ref="dataForm" :inline="true" :model="data.formData" class="dataForm" :rules="rules">
    <el-form-item label="接口编码:" prop="apiCode">
      <el-input v-model="data.formData.apiCode" placeholder="接口编码" />
    </el-form-item>
    <el-form-item label="接口名称:" prop="apiName">
      <el-input v-model="data.formData.apiName" placeholder="接口名称" />
    </el-form-item>
    <el-form-item label="接口地址:" prop="apiUrl">
      <el-input v-model="data.formData.apiUrl" placeholder="接口地址" >
        <template #prepend>/api/common</template>
      </el-input>
    </el-form-item>
    <el-form-item label="请求方式:" prop="apiMethod">
      <el-select class="sh3h-search-input" v-model="data.formData.apiMethod" placeholder="请求方式">
        <el-option label="GET" value="GET"/>
        <el-option label="POST" value="POST"/>
        <el-option label="PUT" value="PUT"/>
        <el-option label="DELETE" value="DELETE"/>
        <el-option label="PATCH" value="PATCH"/>
      </el-select>
    </el-form-item>
    <el-form-item label="认证方式:" prop="authType">
      <el-select class="sh3h-search-input" v-model="data.formData.authType" placeholder="认证方式">
        <el-option label="无认证" value="无认证"/>
        <el-option label="签名认证" value="签名认证"/>
        <el-option label="oauth2认证" value="oauth2认证"/>
      </el-select>
    </el-form-item>
    <el-form-item label="接口分组:" prop="groupCode">
      <el-tree-select
        v-model="data.formData.groupCode"
        :data="props.list"
        :render-after-expand="false"
        node-key="code"
        :props="{ children: 'child', label: 'name', value: 'code' }"
      />
    </el-form-item>
    <el-form-item label="接口类型:" prop="remark">
      <el-select class="sh3h-search-input" v-model="data.formData.apiType" placeholder="接口类型">
        <el-option label="SQL脚本" value="SQL脚本"/>
        <!-- <el-option label="表格模式" value="表格模式"/> -->
      </el-select>
    </el-form-item>
    <el-form-item label="版本号:" prop="versionNumber">
      <el-input v-model="data.formData.versionNumber" placeholder="版本号" />
    </el-form-item>
    <el-form-item label="描述说明:" prop="remark" class="long_item" >
      <el-input
        v-model="data.formData.remark"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        maxlength="500"
        show-word-limit
      >
      </el-input>
    </el-form-item>
  </el-form>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from 'vue'
import { ElForm } from 'element-plus'
import type { FormRules } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { ApiBaseInfoModel } from '@/api/model/apiModel'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['closeDialog', 'update', 'save'])
const props = defineProps({
  formData: {
    type: ApiBaseInfoModel
  },
  groupCode: {
    type: String
  },
  list: {}
})

const data = reactive({
  formData: {} as ApiBaseInfoModel
})
const dataForm = ref(ElForm)

const rules = reactive<InstanceType<typeof FormRules>>({
  apiCode: [{ required: true, message: '不能为空', trigger: 'blur' }],
  apiName: [{ required: true, message: '不能为空', trigger: 'blur' }],
  apiMethod: [{ required: true, message: '不能为空', trigger: 'blur,change' }],
  apiUrl: [{ required: true, message: '不能为空', trigger: 'blur' }],
  authType: [{ required: true, message: '不能为空', trigger: 'blur,change' }],
  groupCode: [{ required: true, message: '不能为空', trigger: 'blur,change' }],
})

const init = ()=>{
  data.formData.apiType = 'SQL脚本'
  props.groupCode && (data.formData.groupCode = props.groupCode)
}
init()
watch(
  () => props.formData,
  (newValue, oldValue) => {
    if(props.formData){
      data.formData = cloneDeep(props.formData)
    }else{
      data.formData = {} as ApiBaseInfoModel
    }
    init()
  },
  {
    deep: true,
    immediate: true
  }
)
watch(
  () => props.groupCode,
  (newValue, oldValue) => {
    props.groupCode && (data.formData.groupCode = props.groupCode)
  },
  {
    immediate: true,
  }
)

defineExpose({
  checkForm(){
    return new Promise((resolve) => {
      dataForm.value!.validate((valid:boolean) => {
        if (valid) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
  });
  },
  getformData() {
    return data.formData
  },
})
</script>
<style lang="scss" scoped>
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
.dataForm{
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  .el-form-item{
    width: 25%;
    margin-right: 0;
    padding-right: 10px;
    box-sizing: border-box;
    margin-bottom: 15px;
    ::v-deep(label){
      width: 100px;
    }
  }
}
.el-form {
  .long_item {
    width: 100%;
  }
  ::v-deep(.el-input-group__prepend){
    padding: 0 5px;
  }
}
</style>
