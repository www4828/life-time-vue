<template>
  <el-dialog v-model="data.dialogVisible" :title="props.dialogStatus" width="50%" @close="$emit('closeDialog')"
    destroy-on-close :close-on-click-modal="false">
    <el-form ref="dataForm" :inline="true" :model="props.formData">
      <el-form-item label="操作人:">
        <span>{{ props.formData.createUser }}</span>
      </el-form-item>
      <el-form-item label="操作类型:">
        <span>{{ props.formData.operationTypeName }}</span>
      </el-form-item>
      <el-form-item label="操作时间:">
        <span>{{ props.formData.createTime }}</span>
      </el-form-item>
      <el-form-item label="调用方法名:">
        <span>{{ props.formData.apiMethod }}</span>
      </el-form-item>
      <el-form-item label="日志描述:">
        <span>{{ props.formData.description }}</span>
      </el-form-item>
      <el-form-item label="请求信息:">
        <json-viewer style="width:100%" :value="props.formData.requestArgumentsData" copyable :expand-depth="1"
          boxed></json-viewer>

      </el-form-item>
      <el-form-item label="响应信息:">
        <json-viewer style="width:100%" :value="props.formData.responseResultData" copyable :expand-depth="1"
          boxed></json-viewer>
      </el-form-item>
      <el-form-item label="错误信息:">
        <el-input v-model="props.formData.errorMsg" autofocus :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
          disabled></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('closeDialog')">取消</el-button>

      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { ElForm } from 'element-plus'
import { ClientModel } from "@/api/model/clientModel";
import { useCode } from '@/hooks/useCode'
import JsonViewer from 'vue-json-viewer'
import 'vue-json-viewer/style.css'

const { authTypes, resourceTypes } = useCode();
const emits = defineEmits(['closeDialog']);
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


const data = reactive({
  dialogVisible: false,
  pwdType: 'password',
  showUrlFlag: false,
  urlList: [{
    text: '',
    show: false
  }],
  updateUrlId: '',
  
})
const dataForm = ref(ElForm)

watch(props, (newValue, oldValue) => {
  data.dialogVisible = newValue.showFlag
})
</script>
<style lang="scss" scoped>
.uris {
  position: absolute;
  right: -30px;
}

.el-form {
  .long_item {
    width: 100%;
  }
}
</style>