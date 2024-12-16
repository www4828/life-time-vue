<template>
  <el-form
    :model="formData"
    ref="dispatchForm"
    label-width="110px"
    :rules="dispatchRules"
  >
    <Title title="工单派遣" />
    <el-row>
      <el-col :span="6">
        <el-form-item label="承办单位" prop="executeDepartCode">
          <DepartTreeSelect
            :is-immediate="false"
            :is-multiple="false"
            ref="departTreeSelectRef"
            :params="{
              childNode: false,
              currentNode: false,
              optionList: [],
              removeList: filterDeptCode,
            }"
            @getDepartCode="executeDepartCode"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="事项类别" prop="firstClass">
          <ClassSelect
            ref="classSelect"
            :departmentCode="departmentCode"
            :departmentLevel="currentDepartmentLevel"
            @getCheckedValue="getCheckedValue"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="formData.deadline"
            type="datetime"
            format="YYYY-MM-DD HH:mm"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD HH:mm"
            :editable="false"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="协办单位">
          <DepartTreeSelect
            :is-immediate="false"
            is-multiple
            :params="{
              childNode: false,
              currentNode: false,
              optionList: [],
              removeList: [execute, ...filterDeptCode],
            }"
            @getDepartCode="assistantDepartCode"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12" v-if="assDept.show">
        <el-form-item label="协办事项类别" prop="secondClass">
          <ClassSelect
            ref="classSelectAss"
            :departmentCode="assDept.assDeptCode"
            :departmentLevel="assDept.assDeptlevel"
            @getCheckedValue="getCheckedValueAss"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12" v-if="formData.firstClass == '147'">
        <el-form-item label="公司名称">
          <SelectCompany
            @getCompany="(val:any)=>company=val"
            :taskId="props.taskId"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="派遣描述" prop="description">
      <el-input
        v-model="formData.description"
        :autosize="{ minRows: 2, maxRows: 4 }"
        type="textarea"
        maxlength="500"
        show-word-limit
      />
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import Title from '@/components/Title/Title.vue'
import { ref, reactive, watch, nextTick } from 'vue'
import {
  DispatchFormModel,
  DepartmentModel,
  CaseModel,
  CaseFormModel,
} from '@/api/model/caseModel'
import { useDepartment } from '@/hooks/useDepartment'
import { useLimitTime } from '@/hooks/useLimitTime'
import { getLimitTime } from '@/hooks/getLimitTime'
import {
  type FormRules,
  type ElForm,
  ElMessage,
  ElMessageBox,
} from 'element-plus'
import { EmitProps } from '@/businessComponent/ClassSelect/type'
import DepartTreeSelect from '@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue'
import ClassSelect from '@/businessComponent/ClassSelect/ClassSelect.vue'
import SelectCompany from '@/businessComponent/SelectCompany/SelectCompany.vue'
import { DispatchService } from '@/api/service/WorkTicket/DispatchService'
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { cloneDeep } from 'lodash-es'

interface DepartmentCodeInfo {
  id: string
  val: string | string[]
  nodes: Array<DepartmentModel>
}
const props = withDefaults(
  defineProps<{
    taskId: string
    flowModel: any
    submit: boolean
    caseInfo: any
    attachments: any
    specialFlags?: any
  }>(),
  {
    taskId: '',
  }
)
const emit = defineEmits([
  'getClassInfo',
  'changeLoading',
  'changeSubmit',
  'done',
])
const dispatchService = new DispatchService()
const disposeService = new DisposeService()
const { departmentList, currentDepartmentCode, currentDepartmentLevel } =
  useDepartment()
const departmentCode = ref(currentDepartmentCode)
const company = ref('')
const executeDepartment = ref()
const assDepartment = ref()
const execute = ref('')
const classSelect = ref()
const assistant = ref<Array<DepartmentModel>>([])
const dispatchForm = ref<InstanceType<typeof ElForm>>()
const { disabledDate, timeLimit } = useLimitTime(true)
const filterDeptCode = ref<string[]>([]);
const departTreeSelectRef = ref();
const formData = reactive<DispatchFormModel>({
  type: '',
  taskId: '',
  disposeTime: '10',
  disposeDepartmentCode: '',
  dispatchDepartmentCode: currentDepartmentCode,
  description: '',
  deadline: '',
  firstClass: '',
  secondClass: '',
  fourthClass: undefined,
  thirdClass: undefined,
  firstClassName: '',
  secondClassName: '',
  thirdClassName: undefined,
  fourthClassName: undefined,
})
const form = reactive<CaseModel>({
  caseInfo: {} as CaseFormModel,
  specialFlags: [],
  dispatchInfos: [],
  attachmentInfos: [],
  isAuto: '',
  department: departmentList[0] as DepartmentModel,
  flowModel: {
    lineId: '',
    processId: '',
    code: '',
  },
})
let assDept: any = reactive({
  show: false,
  assDeptCode: '',
  assDeptlevel: '',
  firstClass: '',
  secondClass: '',
  thirdClass: undefined,
  fourthClass: undefined,
  firstClassName: '',
  secondClassName: '',
  thirdClassName: undefined,
  fourthClassName: undefined,
})
const validateSecondClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!assDept.firstClass) {
      callback(new Error('不能为空!'))
    } else {
      callback()
    }
  })
}
const validateFirstClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!formData.firstClass && rule.required) {
      callback(new Error('不能为空!'))
    } else {
      callback()
    }
  })
}
const dispatchRules = reactive<FormRules>({
  description: [
    { required: false, message: '派遣描述不能为空', trigger: 'blur' },
  ],
  firstClass: [
    {
      required: false,
      message: '事项类别不能为空',
      trigger: 'change',
      validator: validateFirstClass,
    },
  ],
  secondClass: [
    {
      required: true,
      message: '不能为空',
      trigger: 'change',
      validator: validateSecondClass,
    },
  ],
})
const executeDepartCode = ({ val, id }: DepartmentCodeInfo) => {
  departmentCode.value = execute.value = val as string
  formData.firstClass = formData.secondClass = ''
  classSelect.value!.resetValue()
  dispatchRules.description = [
    { required: true, message: '派遣描述不能为空', trigger: 'blur' },
  ]
  dispatchRules.firstClass = [
    {
      required: true,
      message: '事项类别不能为空',
      trigger: 'change',
      validator: validateFirstClass,
    },
  ]
  dispatchRules.deadline = [
    { required: true, message: '截止时间不能为空', trigger: 'change' },
  ]
}
const assistantDepartCode = ({ val, id, nodes }: DepartmentCodeInfo) => {
  assistant.value = nodes as Array<DepartmentModel>

  if (nodes?.filter((node) => node.departmentGroup === '7013').length > 0) {
    assDept.assDeptCode = String(
      nodes?.filter((node) => node.departmentGroup === '7013')[0].departmentCode
    )
    assDept.assDeptlevel = String(
      nodes?.filter((node) => node.departmentGroup === '7013')[0]
        .departmentLevel
    )
    assDept.show = true
  } else {
    assDept.show = false
  }
}
const getCheckedValue = ({ labels, checkedValue, secondParams }: EmitProps) => {
  if (labels.length > 0) {
    const [firstClass, secondClass] = checkedValue
    formData.firstClass = firstClass
    formData.secondClass = secondClass
    formData.firstClassName = labels[0]
    formData.secondClassName = labels[1]
    if (checkedValue[2]) {
      formData.thirdClass = checkedValue[2]
      formData.thirdClassName = labels[2]
    }
    if (checkedValue[3]) {
      formData.fourthClass = checkedValue[3]
      formData.fourthClassName = labels[3]
    }
    emit('getClassInfo', {
      firstClass: formData.firstClass,
      secondClass: formData.secondClass,
    })
  } else {
    formData.firstClass = ''
    formData.secondClass = ''
    formData.firstClassName = ''
    formData.secondClassName = ''
    formData.thirdClass = ''
    formData.thirdClassName = ''
    formData.fourthClass = ''
    formData.fourthClassName = ''
  }
}
const getCheckedValueAss = ({
  labels,
  checkedValue,
  secondParams,
}: EmitProps) => {
  if (labels.length > 0) {
    const [firstClass, secondClass] = checkedValue
    assDept.firstClass = firstClass
    assDept.secondClass = secondClass
    assDept.firstClassName = labels[0]
    assDept.secondClassName = labels[1]
    if (checkedValue[2]) {
      assDept.thirdClass = checkedValue[2]
      assDept.thirdClassName = labels[2]
    }
    if (checkedValue[3]) {
      assDept.fourthClass = checkedValue[3]
      assDept.fourthClassName = labels[3]
    }
  } else {
    assDept.firstClass = ''
    assDept.secondClass = ''
    assDept.thirdClass = undefined
    assDept.fourthClass = undefined
    assDept.firstClassName = ''
    assDept.secondClassName = ''
    assDept.thirdClassName = undefined
    assDept.fourthClassName = undefined
  }
}

const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    dispatchForm.value!.validate((valid, fields) => {
      if (valid) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const clear = () => {
  dispatchForm.value!.resetFields()
  formData.type = ''
  formData.taskId = ''
  formData.disposeTime = '10'
  formData.disposeDepartmentCode = ''
  formData.dispatchDepartmentCode = currentDepartmentCode
  formData.description = ''
  formData.deadline = ''
  formData.firstClass = ''
  formData.secondClass = ''
  formData.thirdClass = undefined
  formData.fourthClass = undefined
  formData.firstClassName = ''
  formData.secondClassName = ''
  formData.thirdClassName = undefined
  formData.fourthClassName = undefined
  execute.value = ''
  assistant.value = []

  executeDepartment.value!.resetValue()
  assDepartment.value!.resetValue()
  classSelect.value!.resetValue()
  assDept.show = false
  dispatchRules.description = [
    { required: false, message: '派遣描述不能为空', trigger: 'blur' },
  ]
  dispatchRules.deadline = [
    { required: false, message: '截止时间不能为空', trigger: 'change' },
  ]
  dispatchRules.firstClass = [
    {
      required: false,
      message: '事项类别不能为空',
      trigger: 'change',
      validator: validateFirstClass,
    },
  ]
}

const sourceChange = async ({ firstParam, secondParam }: any) => {
  formData.deadline = timeLimit.value = await getLimitTime(
    firstParam,
    secondParam
  )
}
const setFormData = (form: DispatchFormModel) => {
  Object.keys(formData).forEach((key) => {
    formData[key] = form[key]
  })
}
const getDispatchNote = () => {
  disposeService
    .getDispatchNote(props.taskId, currentDepartmentCode)
    .then((res) => {
      res.code == 200 && (formData.description = res.data.dispatchNote)
    })
}
getDispatchNote()

const dispatch = () => {
  emit('changeSubmit')
  console.log(form)

  // emit('changeLoading', true)
  // dispatchService
  //   .save(form, props.taskId)
  //   .then((res) => {
  //     ElMessage({
  //       message: res.data,
  //       type: res.code == 200 ? 'success' : 'error',
  //     })
  //   })
  //   .finally(() => {
  //     emit('done')
  //   })
}
const save = () => {
  form.specialFlags = props.specialFlags
  form.caseInfo = {
    ...props.caseInfo,
    reflectIndustryCode: formData.firstClass,
    reflectClassCode: formData.secondClass,
    reflectContentCode: formData.thirdClass,
  }
  form.flowModel!.code = props.flowModel?.code!
  form.flowModel!.lineId = props.flowModel?.id!
  form.flowModel!.processId = props.flowModel?.processId!
  form.attachmentInfos = props.attachments
  if (assistant.value.length === 0 && execute.value !== '') {
    // 没选择协办但是承办单位不为空
    formData.type = '1'
    formData.disposeDepartmentCode = execute.value
    form.dispatchInfos[0] = formData
  } else {
    //选择了承办部门并且也选择了协办部门
    const thirdDePartments = {
      thirdClass: formData.thirdClass,
      fourthClass: formData.fourthClass,
      thirdClassName: formData.thirdClassName,
      fourthClassName: formData.fourthClassName,
    }
    const assistants: DispatchFormModel[] = []
    assistant.value!.forEach((ass) => {
      assistants.push({
        type: '0',
        taskId: props.taskId,
        disposeTime: formData.disposeTime,
        disposeDepartmentCode: ass.departmentCode,
        dispatchDepartmentCode: currentDepartmentCode,
        description: formData.description,
        deadline: formData.deadline,
        firstClass:
          ass.departmentGroup === '7013'
            ? assDept.firstClass
            : formData.firstClass,
        secondClass:
          ass.departmentGroup === '7013'
            ? assDept.secondClass
            : formData.secondClass,
        thirdClass:
          ass.departmentGroup === '7013'
            ? assDept.thirdClass
            : formData.thirdClass,
        fourthClass:
          ass.departmentGroup === '7013'
            ? assDept.fourthClass
            : formData.fourthClass,
        firstClassName:
          ass.departmentGroup === '7013'
            ? assDept.firstClassName
            : formData.firstClassName,
        secondClassName:
          ass.departmentGroup === '7013'
            ? assDept.secondClassName
            : formData.secondClassName,
        thirdClassName:
          ass.departmentGroup === '7013'
            ? assDept.thirdClassName
            : formData.thirdClassName,
        fourthClassName:
          ass.departmentGroup === '7013'
            ? assDept.fourthClassName
            : formData.thirdClassName,
      })
    })
    form.dispatchInfos = [
      {
        type: '1',
        taskId: props.taskId,
        disposeTime: formData.disposeTime,
        disposeDepartmentCode: execute.value,
        dispatchDepartmentCode: currentDepartmentCode,
        description: formData.description,
        deadline: formData.deadline,
        firstClass: formData.firstClass,
        firstClassName: formData.firstClassName,
        secondClass: formData.secondClass,
        secondClassName: formData.secondClassName,
        ...thirdDePartments,
      },
      ...assistants,
    ]
  }
  // 核验派遣时，如果是派给 78号安质监总站的、并且反映区名为 浦东 和奉贤的，
  // 系统提示一下：请确认反映区名是否正确？是继续派遣，否可以修改反映区名。依此来提醒派遣员，针对临港的修改和定位，现在容易忘掉。
  const { district } = props.caseInfo
  if (execute.value === '78' && (district === '20' || district === '30')) {
    ElMessageBox.confirm('请确认反映区名是否正确？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    }).then(() => {
      dispatch()
    })
  } else {
    dispatch()
  }
}

watch(
  () => props.submit,
  (val) => {
    val &&
      dispatchForm.value?.validate((valid: any) => {
        if (valid) {
          save()
        } else {
          emit('changeSubmit')
        }
      })
  }
)
watch(
  () => props.caseInfo,
  async (val) => {
    console.log(props.caseInfo)
    if(val.taskId){
      const {
        firstClass,
        secondClass,
        acceptDepartment,
        taskId,
        firstClassName,
        secondClassName,
       } = val
  
      formData.firstClass = firstClass
      formData.firstClassName = firstClassName
      formData.secondClass = secondClass
      formData.secondClassName = secondClassName
      if (acceptDepartment !== '') {
        filterDeptCode.value = [acceptDepartment]
      } else {
        departTreeSelectRef.value.getDepartmentInfo()
      }
      const { getLimitTime } = useLimitTime()
      formData.deadline = timeLimit.value = await getLimitTime(taskId)

    }
  },
  {
    deep: true,
  }
)
defineExpose({
  getInfo() {
    return {
      formData,
      execute,
      assistant,
      assDept,
    }
  },
  clear,
  checkForm,
  sourceChange,
  setFormData,
})
</script>
<style lang="scss" scoped></style>
