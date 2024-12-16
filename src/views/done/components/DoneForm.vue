<template>
  <el-form
    :model="caseDispose"
    class="donefrom"
    ref="caseDisposeDtoForm"
    :rules="disposeRules"
  >
    <el-row>
      <el-col :span="6">
        <el-form-item label="处理结果" prop="result">
          <el-select v-model="caseDispose.result" filterable>
            <el-option
              v-for="item in resultTypes"
              :label="item.codeName"
              :value="item.codeValue"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="处理人员" prop="person">
          <el-input v-model="caseDispose.person"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="处理时间" prop="time">
          <el-date-picker
            v-model="caseDispose.time"
            type="datetime"
            :editable="false"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="事项类别" prop="firstClass">
          <ClassSelect
            :departmentCode="props.form.disposeDept || props.form.departmentCode"
            departmentLevel="2"
            :showValue="defaultVale"
            @getCheckedValue="getCheckedValue"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item :label="props.label || '意见说明'" prop="description">
      <el-input
        v-model="caseDispose.description"
        :autosize="{ minRows: 2, maxRows: 4 }"
        type="textarea"
        maxlength="500"
        show-word-limit
        @dblclick="() => props.nodeCode && showDialog()"
      />
    </el-form-item>
    <IdiomDialog
      v-if="props.nodeCode"
      :node-code="props.nodeCode"
      :show-flag="idiomControl"
      @close-dialog="closeDialog"
      @get-idiom-content="IdiomContent"
      ref="idiomRef2"
    />
    <Idiom
      v-if="props.nodeCode"
      :node-code="props.nodeCode"
      @idiomContentText="IdiomContent"
    ></Idiom>
  </el-form>
</template>
<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useCode } from '@/hooks/useCode'
import { FormRules } from 'element-plus'
import { DisposeFormModel } from '@/api/model/disposeModel'
import { EmitProps } from '@/businessComponent/ClassSelect/type'
import ClassSelect from '@/businessComponent/ClassSelect/ClassSelect.vue'
import Idiom from '@/businessComponent/Idiom/Idiom.vue'
import IdiomDialog from '@/businessComponent/Idiom/IdiomDialog.vue'
import { useIdiom } from '@/hooks/useIdiom'
import type { FormInstance } from 'element-plus'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'

type FormRules = /*unresolved*/ any
type FormInstance = /*unresolved*/ any
const props = defineProps<{
  form: DisposeFormModel
  label?: string
  display?: boolean
  nodeCode?: NodeCodeKey
}>()
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom()
const { resultTypes } = useCode()
const defaultVale = ref<string[]>([])
const classLabels = ref<string>('')
const caseDisposeDtoForm = ref<FormInstance>()
const caseDispose: DisposeFormModel = reactive({
  id: '',
  content: '',
  description: '',
  person: '',
  result: '',
  taskId: '',
  time: '',
  type: '',
  firstClass: '',
  secondClass: '',
  thirdClass: '',
  fourthClass: '',
  status: '',
  departmentCode: '',
  dispatchId: '',
  recordId: '',
  flowId: '',
})
const disposeRules = reactive<FormRules>({
  result: [{ required: true, message: '处理结果不能为空', trigger: 'change' }],
  person: [{ required: true, message: '处理人员不能为空', trigger: 'blur' }],
  time: [{ required: true, message: '处理时间不能为空', trigger: 'change' }],
  firstClass: [
    { required: true, message: '事项类别不能为空', trigger: 'change' },
  ],
  content: [{ required: true, message: '处理内容不能为空', trigger: 'change' }],
  description: [
    { required: true, message: '意见说明不能为空', trigger: 'blur' },
  ],
})

const getCheckedValue = ({ labels, checkedValue, secondParams }: EmitProps) => {
  classLabels.value = labels?.join('/')
  const [firstClass, secondClass, thirdClass] = checkedValue
  caseDispose.firstClass = firstClass
  caseDispose.secondClass = secondClass
  caseDispose.thirdClass = thirdClass
}
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    caseDisposeDtoForm.value!.validate((valid: boolean) => {
      if (valid) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
const IdiomContent = (idContent: string) => {
  caseDispose.description = idContent
}

const isChinese = (temp:string)=>{
  var reg = new RegExp("[\\u4E00-\\u9FFF]+","g")
  if (reg.test(temp)) return true
  return false
}
watch(
  () => props.form,
  (data) => {
    
    if(props.form.firstClassName){
      classLabels.value = props.form.firstClassName + '/' + props.form.secondClassName
    }
    if(props.form.firstClass){
      Object.keys(caseDispose).forEach((key) => {
        caseDispose[key] = data[key]
      })
    }
    
    nextTick(() => {
      // defaultVale.value = [data.firstClass, data.secondClass, isChinese(data.thirdClass) ? '' : data.thirdClass  ]
      defaultVale.value = [data.firstClass, data.secondClass, data.thirdClass  ]
    })
  },
  {
    deep: true,
    immediate: true
  }
)
defineExpose({
  checkForm,
  getFormData() {
    return caseDispose
  },
})
</script>

<style lang="scss" scoped></style>
