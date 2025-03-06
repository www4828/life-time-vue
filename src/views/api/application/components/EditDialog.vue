<template>
  <el-dialog v-model="data.dialogVisible" :title="props.dialogStatus" width="45%" @close="$emit('closeDialog')" destroy-on-close :close-on-click-modal="false">
    <el-form ref="dataForm" :inline="true" :model="props.formData" class="form" :rules="rules">
      <el-form-item label="appId:" prop="appId" >
        <el-input v-model="props.formData.appId" placeholder="appId" :disabled="props.dialogStatus === '添加' ? false : true" />
      </el-form-item>
      <el-form-item label="应用名称:" prop="appName" >
        <el-input v-model="props.formData.appId" placeholder="应用名称" />
      </el-form-item>
      <el-form-item label="认证code:" prop="appCode" >
        <el-input v-model="props.formData.appCode" placeholder="认证code" />
      </el-form-item>
      <el-form-item label="密钥ID:" prop="appKey" >
        <el-input v-model="props.formData.appKey" placeholder="密钥ID" />
      </el-form-item>
      <el-form-item label="appSecret:" prop="appSecret" >
        <el-input v-model="props.formData.appSecret" placeholder="appSecret" />
      </el-form-item>
      <el-form-item label="应用描述:" prop="appDes" >
        <el-input v-model="props.formData.appDes" placeholder="应用描述" />
      </el-form-item>
      <el-form-item label="策略类型:" prop="strategy" >
        <el-select v-model="props.formData.strategy" clearable placeholder="策略类型" >
          <el-option label="白名单"  value="white" />
          <el-option label="黑名单"  value="black" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态:" prop="status" >
        <el-switch v-model="props.formData.status" active-value="1" inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('closeDialog')">取消</el-button>
        <el-button type="primary" @click="createData()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { ElForm } from 'element-plus'
import type { FormRules } from "element-plus";
import { View, Hide, Edit } from '@element-plus/icons-vue'
import { ClientModel } from "@/api/model/clientModel";

import { useCode } from '@/hooks/useCode'
import { cloneDeep } from "lodash-es";

const {  } = useCode();
const emits = defineEmits(['closeDialog', 'update', 'save']);
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: {} as ClientModel
  },
  dialogStatus: {
    type: String
  }
})
const typeOption:any = []
const resourceOption:any = []

const data = reactive({
  dialogVisible: false,
  pwdType: 'password',
  showUrlFlag: false,
  urlList: [{
      text: '',
      show: false
    }],
  updateUrlId: ''
})
const dataForm = ref(ElForm)

const rules = reactive<InstanceType<typeof FormRules>>({
  clientId: [{ required: true, message: "不能为空", trigger: "blur" }]
});


const createData = () => {
  const form = unref(dataForm)
  form.validate(async (valid: any) => {
    if (valid) {
      let params = cloneDeep(props.formData)
      props.dialogStatus === '修改' ? emits('update', params) : emits('save', params)
     }
  })
}


const closeUrlDialog = () => {
  data.showUrlFlag = false
}
const saveUrl = (param: any) => {
  data.showUrlFlag = false
  let arr = param.map((item: any) => {
    return item.text
  })
  props.formData.webServerRediectUrl = arr.join(';')
}

watch(props, (newValue, oldValue) => {
  data.dialogVisible = newValue.showFlag
})
</script>
<style lang="scss" scoped>
.uris{
  position: absolute;
  right: -30px;
}
.el-form{
  .long_item{
    width: 100%;
  }
}
</style>