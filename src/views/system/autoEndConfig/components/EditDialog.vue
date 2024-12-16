<template>
  <el-dialog v-model="data.dialogVisible" :title="props.dialogStatus" width="20%" @close="$emit('closeDialog')" destroy-on-close :close-on-click-modal="false">
    <el-form ref="dataForm" :inline="true" :model="props.formData" :rules="rules">
      <el-form-item label="配置项名称:" prop="configName" >
        <el-input v-model="props.formData.configName" placeholder="配置项名称" />
      </el-form-item>
      <el-form-item label="工单类型:" prop="configType" >
        <el-select class="sh3h-search-input" v-model="props.formData.configType">
          <el-option
            v-for="item in ticketTypes" 
            :label="item.codeName"
            :value="item.codeValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="等待间隔:" prop="intervalTime" >
        <el-select class="sh3h-search-input" v-model="props.formData.intervalTime">
          <el-option
            v-for="item in autoEndLimitTypes" 
            :label="item.codeName"
            :value="item.codeValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="截止时限:" prop="overdueTime" >
        <el-select class="sh3h-search-input" v-model="props.formData.overdueTime">
          <el-option
            v-for="item in autoEndLimitTypes" 
            :label="item.codeName"
            :value="item.codeValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否启用:" prop="isValid" >
        <el-switch v-model="props.formData.isValid" active-value="1" inactive-value="0" />
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
import { ClientModel } from "@/api/model/clientModel";
import { useCode } from '@/hooks/useCode'
import { cloneDeep } from "lodash-es";

const { ticketTypes, autoEndLimitTypes } = useCode();
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

const data = reactive({
  dialogVisible: false,
  pwdType: 'password',
  showUrlFlag: false,
  updateUrlId: ''
})
const dataForm = ref(ElForm)

const rules = reactive<FormRules>({
  clientSecret:  [{ required: true, message: "密码不能为空", trigger: "blur" }]
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