<template>
  <div class="houseQuality" v-loading="loading" element-loading-background="rgba(255,255,255,0.3)"
      element-loading-text="正在获取数据请稍后...">
    <el-form :model="form" class="from" ref="ruleFormRef" label-width="auto" :rules="rules">
      <el-row>
        <el-col :span="8">
          <el-form-item label="报建编号" prop="bjbh">
            <el-input v-model="form.bjbh" placeholder="请点击获取按钮" :readonly="disabled">
              <template #append><div @click="getBjZjgcForXfxt" class="bjbh">获取</div></template>
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
            <el-input v-model="form.zbdwmc" placeholder="总包单位" :readonly="disabled"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="小区名称">
            <el-input v-model="form.xqmc" placeholder="小区名称" :readonly="disabled"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="竣工备案时间">
            <!-- <el-input v-model="form.jgbasj" placeholder="竣工备案时间" :readonly="Boolean(props.formData?.bjbh)"/> -->
            <el-date-picker
              v-model="form.jgbasj"
              type="datetime"
              :editable="false"
              placeholder="竣工备案时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="报建类型">
            <el-select v-model="form.bjlx" placeholder="报建类型"  :disabled="disabled">
              <el-option label="装修" value="装修" />
              <el-option label="毛坯" value="毛坯" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="装配式建筑">
            <el-input v-model="form.iszps"  placeholder="装配式建筑" :readonly="disabled"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否进入保险期" prop="isbxq">
            <el-select v-model="form.isbxq" placeholder="是否进入保险期"  :disabled="disabled">
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否在质保期内" prop="iszbq">
            <el-select v-model="form.iszbq" placeholder="是否在质保期内"  :disabled="disabled">
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="简要描述" prop="jyms">
        <el-input
          v-model="form.jyms"
          autofocus :readonly="disabled"
          :autosize="{ minRows: 2, maxRows: 4 }"
          type="textarea" maxlength="500" show-word-limit
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { DisposeService } from "@/api/service/Dispose/DisposeService";

const props = withDefaults(defineProps<{
  formData?: any,
  // reload: false,
  disabled?: false
}>(), {
});

const disposeService = new DisposeService()
let form:any = reactive({
  bjbh:'',
  xm:'',
  zjh:'',
  name: '',
  xqmc: '',
  jgbasj: '',
  bjlx: '',
  jsdwmc: '',
  zbdwmc: '',
  iszps: '',
  jyms: '',
  isbxq: '',
  iszbq: '',
})
const rules = reactive<FormRules>({
  bjbh: [{ required: true, message: '请输入报建编号', trigger: 'blur' }],
  jsdwmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  zbdwmc: [{ required: true, message: '请输入', trigger: 'blur' }],
  isbxq: [{ required: true, message: '请选择', trigger: 'blur' }],
  iszbq: [{ required: true, message: '请选择', trigger: 'blur' }],
})
const loading = ref(false)
const ruleFormRef = ref<FormInstance>()
const getBjZjgcForXfxt = ()=>{
  if(form.bjbh){
    loading.value = true
    disposeService.getBjZjgcForXfxt(form.bjbh).then(res=>{
      Object.keys(form).forEach(key=>{
        Object.keys(res.data).forEach(item=>{
          key === item && (form[key] = res.data[key])
        })
      })
      getZbdwForXfxt()
    }).catch(()=>loading.value = false)
  }else{
    ElMessage.warning('请输入报建编号')
  }
}
const getZbdwForXfxt = ()=>{
  disposeService.getZbdwForXfxt(form.bjbh).then(res=>{
    Object.keys(form).forEach(key=>{
      Object.keys(res.data[0]).forEach(item=>{
        key === item && (form[key] = res.data[0][key])
      })
    })
    getWorkerYg()
  }).catch(()=>loading.value = false)
}
const getWorkerYg = ()=>{
  disposeService.getWorkerYg({
    bjbk:form.bjbh,
    xm: form.xm,
    zjh: form.zjh
  }).then(res=>{
    Object.keys(form).forEach(key=>{
      Object.keys(res.data).forEach(item=>{
        key === item && (form[key] = res.data[key])
      })
    })
    loading.value = false
  }).catch(()=>loading.value = false)
}
// const getInfoByBjbh = ()=>{
//   loading.value = true
//   getBjZjgcForXfxt()
//   getZbdwForXfxt()
//   getWorkerYg()
// }
const submitForm = ()=>{
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

watch(()=>props.formData,(val)=>{
  if(val?.bjbh){
    Object.keys(val).forEach(key=>{
      form[key] = val[key]
    })
  }else{
    Object.keys(form).forEach(key=>{
      form[key] = ''
    })
  }
},{
  deep:true,
  immediate:true
})

defineExpose({
  form,submitForm, resetFields
});
</script>
<style lang="scss" scoped>
::v-deep(.el-input-group__append){
  padding: 0;
}
.bjbh{
  width: 100%;
  height: 100%;
  padding: 0 15px;
  cursor: pointer;
}
</style>