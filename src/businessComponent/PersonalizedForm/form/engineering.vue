<template>
  <div class="engineering" v-loading="loading" element-loading-background="rgba(255,255,255,0.3)"
    element-loading-text="正在获取数据请稍后...">
    <el-form :model="form" class="from" :rules="rules" ref="ruleFormRef">
      <el-row>
        <el-col :span="8">
          <el-form-item label="报建编号" prop="bjbh">
            <el-input v-model="form.bjbh" placeholder="请点击获取按钮" :readonly="disabled">
              <template #append>
                <div @click="getBjZjgcForXfxt" v-if="!disabled" class="bjbh">
                  获取
                </div>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="建设单位" prop="jsdwmc">
            <el-input v-model="form.jsdwmc" placeholder="建设单位" :readonly="disabled" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="总包单位" prop="zbdwmc">
            <el-input v-model="form.zbdwmc" placeholder="总包单位" :readonly="disabled" />
          </el-form-item>
        </el-col>
        <el-col :span="8"></el-col>
      </el-row>
      <el-form-item label="简要描述" prop="jyms">
        <el-input v-model="form.jyms" autofocus :readonly="disabled" :autosize="{ minRows: 2, maxRows: 4 }"
          type="textarea" maxlength="500" show-word-limit />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { DisposeService } from '@/api/service/Dispose/DisposeService'

const props = withDefaults(
  defineProps<{
    formData: any
    // reload: false
    disabled?: false
  }>(),
  {}
)

const loading = ref(false)
const ruleFormRef = ref<FormInstance>()
const disposeService = new DisposeService()
let form: any = reactive({
  bjbh: '',
  jyms: '',
  name: '',
  jsdwmc: '',
  zbdwmc: '',
})
const rules = reactive<FormRules>({
  bjbh: [{ required: true, message: '请输入报建编号', trigger: 'blur' }],
  jsdwmc: [{ required: true, message: '建设单位', trigger: 'blur' }],
  zbdwmc: [{ required: true, message: '总包单位', trigger: 'blur' }],
})

const getBjZjgcForXfxt = () => {
  if (form.bjbh) {
    loading.value = true
    disposeService
      .getBjZjgcForXfxt(form.bjbh)
      .then((res) => {
        Object.keys(form).forEach((key) => {
          Object.keys(res.data).forEach((item) => {
            key === item && (form[key] = res.data[key])
          })
        })
        getZbdwForXfxt()
      })
      .catch(() => (loading.value = false))
  } else {
    ElMessage.warning('请输入报建编号')
  }
}
const getZbdwForXfxt = () => {
  disposeService
    .getZbdwForXfxt(form.bjbh)
    .then((res) => {
      Object.keys(form).forEach((key) => {
        Object.keys(res.data[0]).forEach((item) => {
          key === item && (form[key] = res.data[0][key])
        })
      })
      loading.value = false
    })
    .catch(() => (loading.value = false))
}
const submitForm = () => {
  return new Promise((resolve) => {
    ruleFormRef.value?.validate((valid, fields) => {
      if (valid) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
const resetFields = ()=>{
  ruleFormRef.value?.resetFields()
}

watch(
  () => props.formData,
  (val) => {
    if (val?.bjbh) {
      Object.keys(val).forEach((key) => {
        form[key] = val[key]
      })
    } else {
      Object.keys(form).forEach((key) => {
        form[key] = ''
      })
    }
  },
  {
    deep: true,
    immediate: true,
  }
)

defineExpose({
  form,
  submitForm,
  resetFields
})
</script>
<style lang="scss" scoped>
::v-deep(.el-input-group__append) {
  padding: 0;
}

.bjbh {
  width: 100%;
  height: 100%;
  padding: 0 15px;
  cursor: pointer;
}
</style>
