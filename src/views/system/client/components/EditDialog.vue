<template>
  <el-dialog v-model="data.dialogVisible" :title="props.dialogStatus" width="45%" @close="$emit('closeDialog')" destroy-on-close :close-on-click-modal="false">
    <el-form ref="dataForm" :inline="true" :model="props.formData" class="form" :rules="rules">
      <el-form-item label="客户端ID:" prop="clientId" >
        <el-input v-model="props.formData.clientId" placeholder="用户编号" :disabled="props.dialogStatus === '添加' ? false : true" />
      </el-form-item>
      <el-form-item label="客户端密码:" prop="clientSecret" v-if="props.dialogStatus === '添加'" >
        <el-input
          v-model="props.formData.clientSecret"
          type="password"
          placeholder="客户端密码"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="授权范围:" prop="scope" >
        <el-input v-model="props.formData.scope" placeholder="授权范围" />
      </el-form-item>
      <el-form-item label="服务器回调地址" prop="uris" >
        <el-input v-model="props.formData.uris" placeholder="服务器回调地址" />
        <el-link :icon="Edit" type="primary" @click="editUrls" class="uris" ></el-link>
      </el-form-item>
     <el-form-item label="token时长:" prop="accessTokenValidity" >
        <el-input v-model.number="props.formData.accessTokenValidity" placeholder="token时长" />
      </el-form-item>
      <el-form-item label="token刷新:" prop="refreshTokenValidity" >
        <el-input v-model.number="props.formData.refreshTokenValidity" placeholder="token刷新" />
      </el-form-item>
      <el-form-item label="附件信息:" prop="additionalInformation" >
        <el-input v-model="props.formData.additionalInformation" placeholder="附件信息" />
      </el-form-item>
      <el-form-item label="自动授权:" prop="autoapprove" >
        <el-switch v-model="props.formData.autoApprove" active-value="true" inactive-value="false" />
      </el-form-item>
      <el-form-item label="可访问资源:" prop="resourceList" class="long_item" >
        <el-select class="sh3h-search-input" v-model="props.formData.resourceList" multiple>
          <el-option
            v-for="item in resourceTypes" 
            :label="item.codeName"
            :value="item.codeValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="授权类型:" prop="authList" class="long_item" >
        <el-select class="sh3h-search-input" v-model="props.formData.authList" multiple >
          <el-option
            v-for="item in authTypes" 
            :label="item.codeName"
            :value="item.codeValue"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('closeDialog')">取消</el-button>
        <el-button type="primary" @click="createData()">确定</el-button>
      </span>
    </template>
  </el-dialog>
  <UrlDialog :showFlag="data.showUrlFlag" :formData="data.urlList" @saveUrl="saveUrl" @closeUrlDialog="closeUrlDialog" />
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { ElForm } from 'element-plus'
import type { FormRules } from "element-plus";
import { View, Hide, Edit } from '@element-plus/icons-vue'
import { ClientModel } from "@/api/model/clientModel";
import UrlDialog from "./urlDialog.vue";
import { useCode } from '@/hooks/useCode'
import { cloneDeep } from "lodash-es";

const { authTypes, resourceTypes } = useCode();
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

const checkAccessTokenValidity = (rule: any, value: any, callback: any)=>{
  if (!value) {
    return callback(new Error('请输入10的倍数'))
  }else{
    if(value % 10 === 0){
      callback()
    }else{
      callback(new Error('请输入10的倍数'))
    }
  }
}
const checkClientId = (rule: any, value: any, callback: any)=>{
  var usernamePatt = /^\w{2,15}$/;
  if (value) {
    if(usernamePatt.test(value)){
      callback()
    }else{
      callback(new Error('长度2-15，只由数字、字母、下划线组成'))
    }
  }else{
    return callback(new Error('客户端编号不能为空'))
  }
}
const rules = reactive<FormRules>({
  // clientId: [{ required: true, validator: checkClientId, trigger: 'blur' }],
  clientId: [{ required: true, message: "客户端编号不能为空", trigger: "blur" }],
  resourceList: [{ required: true, message: "请选择可访问资源", trigger: "blur" }],
  scope: [{ required: true, message: "授权范围不能为空", trigger: "blur" }],
  authList: [{ required: true, message: "请选择授权类型", trigger: "blur" }],
  accessTokenValidity: [{ validator: checkAccessTokenValidity, trigger: 'blur' }],
  refreshTokenValidity: [{ validator: checkAccessTokenValidity, trigger: 'blur' }],
  clientSecret:  [{ required: true, message: "密码不能为空", trigger: "blur" }]
});


const createData = () => {
  const form = unref(dataForm)
  form.validate(async (valid: any) => {
    if (valid) {
      let params = cloneDeep(props.formData)
      params.resourceIds = props.formData.resourceList.join(',')
      params.authorizedGrantTypes = props.formData.authList.join(',')
      delete params.authList
      delete params.resourceList
      props.dialogStatus === '修改' ? emits('update', params) : emits('save', params)
     }
  })
}

const editUrls = () => {
  // data.updateUrlId = row.clientId
  data.urlList = []
  let arr = props.formData.uris?.split(';') || []
  arr.forEach((item: any) => {
    data.urlList.push({
      text: item,
      show: false
    })
  })
  // console.log(data.urlList)
  data.showUrlFlag = true
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