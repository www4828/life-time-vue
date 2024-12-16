<template>
  <div
    class="PersonalizedForm"
    v-loading="loading"
    element-loading-background="rgba(255,255,255,0.3)"
    element-loading-text="正在获取数据请稍后..."
  >
    <el-form :model="form" class="from" :rules="rules" label-width="auto" ref="ruleFormRef">
      <el-row>
        <el-col :span="8">
          <el-form-item label="报建编号" prop="bjbh">
            <el-input
              v-model="form.bjbh"
              placeholder="请点击获取按钮"
              :readonly="disabled"
              >
              <!-- :readonly="Boolean(props.formData?.bjbh)" -->
              <template #append
                ><div
                  @click="getBjZjgcForXfxt"
                  v-if="!disabled"
                  class="bjbh"
                  >
                  <!-- v-if="!props.formData?.bjbh" -->
                  获取
                </div></template
              >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="项目名称" prop="xmmc">
            <el-input
              v-model="form.xmmc"
              placeholder="项目名称"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="建设单位" prop="jsdwmc">
            <el-input
              v-model="form.jsdwmc"
              placeholder="建设单位"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="总包单位" prop="zbdwmc">
            <el-input
              v-model="form.zbdwmc"
              placeholder="总包单位"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="实际涉及人数" prop='sjsjrs' >
            <el-input
              v-model.number="form.sjsjrs"
              placeholder="实际涉及人数"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="实际欠薪金额" prop='sjsjje'>
            <el-input
              v-model.number="form.sjsjje"
              placeholder="实际涉及金额"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="欠薪责任单位" prop='qxzrdw'>
            <el-select
              v-model="form.qxzrdw"
              placeholder="请选择"
              :disabled="disabled"
            >
              <el-option label="建设单位" value="建设单位" />
              <el-option label="总包单位" value="总包单位" />
              <el-option label="分包单位" value="分包单位" />
              <el-option label="劳务单位" value="劳务单位" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="劳务单位" prop='lwdw'>
            <el-input
              v-model="form.lwdw"
              placeholder="劳务单位"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="分包单位" prop='fbdw'>
            <el-input
              v-model="form.fbdw"
              placeholder="分包单位"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="项目类型">
            <el-input
              v-model="form.xmfl"
              placeholder="项目类型"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="工程进展">
            <el-select
              v-model="form.gcjz"
              placeholder="请选择"
              :disabled="disabled"
            >
              <el-option label="完工" value="完工" />
              <el-option label="未完工" value="未完工" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="财政资金项目">
            <el-select
              v-model="form.isczzj"
              placeholder="请选择"
              :disabled="disabled"
              >
              <!-- :disabled="Boolean(props.formData?.bjbh)" -->
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="解决金额">
            <el-input
              v-model="form.jjje"
              placeholder="解决金额"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="姓名">
            <el-input
              v-model="form.xm"
              placeholder="姓名(全名)"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="身份证信息">
            <el-input
              v-model="form.zjh"
              placeholder="身份证信息"
              :readonly="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="实名制工人">
            <el-select
              v-model="form.yqState"
              placeholder="请选择"
              :disabled="disabled"
            >
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="简要描述" prop="jyms">
        <el-input
          v-model="form.jyms"
          autofocus
          :autosize="{ minRows: 2, maxRows: 4 }"
          type="textarea"
          maxlength="500"
          show-word-limit
          :readonly="disabled"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { DisposeService } from '@/api/service/Dispose/DisposeService'

const props = withDefaults(
  defineProps<{
    formData?: any,
    // reload: false,
    disabled?: false
  }>(),
  {}
)
const ruleFormRef = ref<FormInstance>()
const disposeService = new DisposeService()
let form: any = reactive({
  bjbh: '',
  xm: '',
  zjh: '',
  name: '',
  jyms: '',
  xmmc: '',
  xmfl: '',
  gcjz: '',
  jsdwmc: '',
  zbdwmc: '',
  fbdw: '',
  lwdw: '',
  isczzj: '',
  qxzrdw: '',
  sjsjje: '',
  jjje: '',
  yqState: '',
})
const rules = reactive<FormRules>({
  bjbh: [{ required: true, message: '请输入报建编号', trigger: 'blur' }],
  xmmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  jsdwmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  zbdwmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  qxzrdw: [{ required: true, message: '请输入', trigger: 'blur' }],
  lwdw: [{ required: true, message: '请输入', trigger: 'blur' }],
  fbdw: [{ required: true, message: '请输入', trigger: 'blur' }],
  sjsjrs: [{ required: true, message: '请输入涉及人数', trigger: 'blur' },{ type: 'number', message: '请填写数字' }],
  sjsjje: [{ required: true, message: '请输入涉及金额', trigger: 'blur' },{ type: 'number', message: '请填写数字' }],
})
const loading = ref(false)

const getBjZjgcForXfxt = () => {
  if(form.bjbh){
    loading.value = true
    disposeService
      .getBjZjgcForXfxt(form.bjbh)
      .then((res) => {
        Object.keys(form).forEach(key=>{
          Object.keys(res.data).forEach(item=>{
            key === item && (form[key] = res.data[key])
          })
        })
        form.sjsjje = form.sjsjje - 0 ? form.sjsjje - 0 : form.sjsjje
        form.sjsjrs = form.sjsjrs - 0 ? form.sjsjrs - 0 : form.sjsjrs
        
        getZbdwForXfxt()
        // getWorkerYg()
      })
      .catch(() => (loading.value = false))
  }else{
    ElMessage.warning('请输入报建编号')
  }
}
const getZbdwForXfxt = () => {
  disposeService
    .getZbdwForXfxt(form.bjbh)
    .then((res) => {
      // Object.keys(res.data[0]).forEach((key) => {
      //   form[key] = res.data[key]
      // })
      Object.keys(form).forEach(key=>{
        Object.keys(res.data[0]).forEach(item=>{
          key === item && (form[key] = res.data[0][key])
        })
      })
      loading.value = false
    })
    .catch(() => (loading.value = false))
}
const getWorkerYg = () => {
  disposeService
    .getWorkerYg({
      bjbk: form.bjbh,
      xm: form.xm,
      zjh: form.zjh,
    })
    .then((res) => {
      Object.keys(res.data).forEach((key) => {
        form[key] = res.data[key]
      })
    })
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
      
      form.sjsjje = form.sjsjje - 0 ? form.sjsjje - 0 : form.sjsjje
      form.sjsjrs = form.sjsjrs - 0 ? form.sjsjrs - 0 : form.sjsjrs
    }else{
      Object.keys(form).forEach(key=>{
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
