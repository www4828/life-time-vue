<template>
  <div>
    <Title title="申请信息" />
    <returnTable
      :taskId="props.taskId"
      @changeCheck="changeCheck"
      ref="returnTableRef"
    />
    <returnApply
      v-if="caseBackApproveDto.backId"
      :taskId="props.taskId"
      :flowModel="{}"
      :submit="false"
      :attachments="[]"
      :allFiles="[]"
      :caseInfo="props.caseInfo"
      :nodeCode="''"
      :backId="caseBackApproveDto.backId"
      :applyDetail="mcaseHotBackDto"
      ref="returnApplyRef"
    />
    <Title title="退单审批">
      <template #content>
        <el-form
          :model="caseBackApproveDto"
          class="from"
          ref="returnApplyForm"
          label-width="120px"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="是否同意" prop="result">
                <el-select
                  v-model="caseBackApproveDto.result"
                  placeholder="请选择"
                  v-if="isAssist"
                >
                  <el-option
                    v-for="item in returnCheckTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
                <el-select
                  v-model="caseBackApproveDto.result"
                  placeholder="请选择"
                  v-else-if="
                    !isAssist &&
                    departmentList[0].departmentLevel == '1' &&
                    currentDepartmentCode == '12319'
                  "
                  @change="changeResult"
                >
                  <el-option
                    v-for="item in approveTypes"
                    :key="item.codeValue"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
                <el-select
                  v-model="caseBackApproveDto.result"
                  placeholder="请选择"
                  @change="changeResult"
                  v-else
                >
                  <el-option
                    v-for="item in returnApproveTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <template v-if="caseBackApproveDto.result == '3'">
              <el-col :span="6">
                <el-form-item label="承办单位" prop="executeDepartCode">
                  <DepartTreeSelect
                    :is-immediate="immediate"
                    :is-multiple="false"
                    :params="{
                      childNode: false,
                      currentNode: false,
                      optionList: [],
                      removeList: filterDeptCode,
                    }"
                    ref="executeDepartment"
                    @getDepartCode="executeDepartCode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="事项类别" prop="firstClass" class="long">
                  <ClassSelect
                    :departmentCode="execute"
                    :departmentLevel="departmentList[0].departmentLevel"
                    :showValue="showValue"
                    @getCheckedValue="getCheckedValue"
                    @getSecondPrams="getSecondPrams"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="截止时间" prop="deadline">
                  <el-date-picker
                    v-model="caseBackApproveDto.deadline"
                    type="datetime"
                    format="YYYY-MM-DD HH:mm"
                    :disabled-date="disabledDate"
                    value-format="YYYY-MM-DD HH:mm"
                  />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
          <el-form-item label="意见说明" prop="description">
            <el-input
              @dblclick="showDialog"
              v-model="caseBackApproveDto.description"
              autofocus
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="500"
              show-word-limit
              type="textarea"
            />
          </el-form-item>
          <IdiomDialog
            :node-code="props.flowModel.code"
            :show-flag="idiomControl"
            @close-dialog="closeDialog"
            @get-idiom-content="IdiomContent"
            ref="idiomRef"
          />
          <Idiom
            :node-code="props.flowModel.code"
            @idiomContentText="IdiomContent"
          ></Idiom>
        </el-form>
      </template>
    </Title>
    <el-dialog
      custom-class="dialog"
      v-model="state.dialogShow"
      width="70%"
      destroy-on-close
      title="转市级审批，请选择附件（上限3条），不勾选默认不上传文件"
      @close="cancal"
    >
      <FileAttachments
        is-choice
        :is-show="false"
        ref="fileRef"
        :task-id="props.taskId"
        :default-value="props.allFiles"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancal">取消</el-button>
          <el-button type="primary" @click="fileSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, reactive, ref, watch, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox, FormRules } from 'element-plus'
import Title from '@/components/Title/Title.vue'
import IdiomDialog from '@/businessComponent/Idiom/IdiomDialog.vue'
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { cloneDeep } from 'lodash-es'
import { Session } from '@/utils/storage'
import DepartTreeSelect from '@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue'
import { useDepartment } from '@/hooks/useDepartment'
import { useCode } from '@/hooks/useCode'
import { useIdiom } from '@/hooks/useIdiom'
import Idiom from '@/businessComponent/Idiom/Idiom.vue'
import ClassSelect from '@/businessComponent/ClassSelect/ClassSelect.vue'
import { EmitProps } from '@/businessComponent/ClassSelect/type'
import { useLimitTime } from '@/hooks/useLimitTime'
import FileAttachments from '@/businessComponent/FileAttachments/FileAttachments.vue'
import { ReturnModel } from '@/api/model/caseModel'
import returnTable from './table.vue'
import returnApply from './returnApply.vue'

type FormRules = /*unresolved*/ any
const disposeService = new DisposeService()
const returnApplyRef = ref()
const props = withDefaults(
  defineProps<{
    flowModel: any
    taskId: string
    submit: boolean
    caseInfo: any
    attachments: any
    nodeCode: string
    allFiles: any
  }>(),
  {
    taskId: '',
  }
)
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom()
const { proxy } = <any>getCurrentInstance()!
const immediate = ref(false)
const { disabledDate, timeLimit } = useLimitTime()
const showValue = ref<string[]>([])
const emit = defineEmits(['done', 'changeSubmit', 'changeLoading'])
const returnApplyForm = ref()
const { currentDepartmentCode, departmentList } = useDepartment()
const { returnCheckTypes, approveTypes, timeLimitTypes, returnApproveTypes } =
  useCode()
const execute = ref('')
const departmentCode = ref('')
const filterDeptCode = ref<string[]>([])
const caseBackApproveDto: any = reactive({
  backId: '',
  nodeCode: props.nodeCode,
  result: '',
  description: '',
  disposeTime: '',
  deadline: '',
})
const dispatchForm = reactive({
  type: '',
  taskId: props.taskId,
  disposeTime: '10',
  disposeDepartmentCode: '',
  dispatchDepartmentCode: currentDepartmentCode,
  description: '',
  deadline: '',
  firstClass: '',
  secondClass: '',
  fourthClass: undefined as any,
  thirdClass: undefined as any,
})
const validatePass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (execute.value) {
      callback()
    } else {
      callback(new Error('承办单位不能为空!'))
    }
  })
}
const validateClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    console.log(
      caseBackApproveDto.result === '3' && currentDepartmentCode === '12319'
    )

    if (
      caseBackApproveDto.result === '3' &&
      currentDepartmentCode === '12319'
    ) {
      if (dispatchForm.firstClass || dispatchForm.secondClass) {
        // save();
        callback()
      } else {
        callback(new Error('请选择事项类别!'))
      }
    } else {
      callback()
    }
  })
}
const dispatchRules = reactive<FormRules>({
  description: [
    { required: true, message: '意见说明不能为空', trigger: 'blur' },
  ],
  result: [{ required: true, message: '请选择审批结果', trigger: 'blur' }],
  executeDepartCode: [
    {
      required: true,
      message: '承办单位不能为空',
      trigger: 'change',
      validator: validatePass,
    },
  ],
  deadline: [
    { required: true, message: '截止时间不能为空', trigger: 'blur,change' },
  ],
  // firstClass: [{ trigger: "blur,change",validator: validateClass, }],
})

const isAssist = ref(true)
let timeLimits: any = ref([])
const state = reactive({
  showValue: [] as any,
  dialogShow: false,
  attachments: [],
})
let applyDepartmentCode: any = ref('')
const fileRef = ref()
const mcaseHotBackDto = ref<any>({})

const changeCheck = (
  id: string,
  detail: ReturnModel,
  assist: boolean,
  applyDeptCode: string
) => {
  isAssist.value = assist
  caseBackApproveDto.backId = id
  applyDepartmentCode.value = applyDeptCode
  Object.keys(detail).forEach((key) => {
    mcaseHotBackDto.value[key] = detail[key]
  })
  delete mcaseHotBackDto.value.chargeReason2Name
  delete mcaseHotBackDto.value.chargeReasonName
  delete mcaseHotBackDto.value.nextSourceName
}

const fileSave = () => {
  state.attachments = fileRef.value.getChoiceFiles()
  state.dialogShow = false
  save()
}

const save = () => {
  // 退单审批
  const { departmentList } = Session.get('userInfo')

  dispatchForm.disposeTime = caseBackApproveDto.disposeTime
  delete caseBackApproveDto.disposeTime
  let params: any = {
    attachmentInfos: state.attachments,
    caseInfo: {
      ...props.caseInfo,
      reflectIndustryCode: dispatchForm.firstClass,
      reflectClassCode: dispatchForm.secondClass,
      reflectContentCode: dispatchForm.thirdClass,
    },
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    departmentVo: cloneDeep(departmentList[0]),
    caseBackApproveDto: cloneDeep(caseBackApproveDto),
    mcaseDispatchEntities: [],
    mcaseHotBackDto: cloneDeep(mcaseHotBackDto.value),
  }

  if (execute.value) {
    // 承办单位不为空
    dispatchForm.type = '1'
    dispatchForm.disposeDepartmentCode = execute.value
    dispatchForm.description = caseBackApproveDto.description
    params.mcaseDispatchEntities[0] = cloneDeep(dispatchForm)
  }
  // console.log(params);
  // emit('changeSubmit')

  emit('changeLoading', true)
  disposeService
    .backHotApprove(params)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? 'success' : 'error',
        message: res.message + '，即将返回列表页',
      })
      emit('done')
    })
    .catch(() => emit('done'))
}
const getIsEnableBack = () => {
  emit('changeLoading', true)
  disposeService
    .getIsEnableBack(props.taskId, currentDepartmentCode)
    .then((res) => {
      emit('changeSubmit')
      if (res.code == 200) {
        save()
      } else {
        emit('changeLoading', false)
        emit('changeSubmit')
        ElMessage.warning(res.message)
      }
    })
    .catch(() => {
      emit('changeLoading', false)
      emit('changeSubmit')
    })
}
const findCooperation = () => {
  emit('changeLoading', true)
  disposeService
    .findCooperation(props.taskId, execute.value)
    .then((res) => {
      if (res.data) {
        save();
      } else {
        ElMessageBox.confirm('该承办部门已经派过协办，请进行收单重派', '提示', {
          confirmButtonText: '确定',
        }).finally(() => {
          emit('changeLoading', false)
          emit('changeSubmit')
        })
      }
    })
    .catch(() => {
      emit('changeLoading', false)
      emit('changeSubmit')
    })
}
const submit = () => {
  if (caseBackApproveDto.backId) {
    returnApplyRef.value
      .checkForm()
      .then((res: boolean) => {
        if (res) {
          let detail = returnApplyRef.value.getFormData()
          Object.keys(detail).forEach((key) => {
            mcaseHotBackDto.value[key] = detail[key]
          })
          delete mcaseHotBackDto.value.chargeReason2Name
          delete mcaseHotBackDto.value.chargeReasonName
          delete mcaseHotBackDto.value.nextSourceName
          switch (caseBackApproveDto.result) {
            case '5': // 向12345退单需要勾选附件
              state.dialogShow = true
              break
            case '4': // 二级及以下
              state.attachments = cloneDeep(props.attachments)
              if (
                departmentList[0].departmentLevel == '1' &&
                currentDepartmentCode == '12319'
              ) {
                save()
              } else {
                getIsEnableBack()
              }
              break
            case '3': // 同意转重新派遣 验证事项类别是否为空
              state.attachments = cloneDeep(props.attachments)
              if (currentDepartmentCode === '12319') {
                if (dispatchForm.firstClass && dispatchForm.secondClass) {
                  findCooperation()
                } else {
                  ElMessage.warning('请选择事项类别')
                  emit('changeSubmit')
                }
              } else {
                findCooperation()
              }
              break
            default:
              state.attachments = cloneDeep(props.attachments)
              save()
          }
        } else {
          emit('changeSubmit')
        }
      })
      .catch(() => {
        emit('changeSubmit')
      })
  } else {
    ElMessage.warning('请选择一条申请信息进行操作')
    emit('changeSubmit')
  }
}
const executeDepartCode = ({ val, id }: any) => {
  execute.value = departmentCode.value = val as string
}

const getCheckedValue = ({ checkedValue, secondParams }: EmitProps) => {
  if (checkedValue.length > 0) {
    const [firstClass, secondClass] = checkedValue
    dispatchForm.firstClass = firstClass
    dispatchForm.secondClass = secondClass
    if (checkedValue[2]) {
      dispatchForm.thirdClass = checkedValue[2]
    }
    if (checkedValue[3]) {
      dispatchForm.fourthClass = checkedValue[3]
    }
  } else {
    dispatchForm.firstClass = ''
    dispatchForm.secondClass = ''
    dispatchForm.thirdClass = ''
    dispatchForm.fourthClass = ''
  }
  timeLimits.value = secondParams
    ? timeLimitTypes.value.filter((item) => item.codeValue === secondParams)
    : timeLimitTypes.value
}
const getSecondPrams = (secondParams: string) => {
  timeLimits.value = secondParams
    ? timeLimitTypes.value.filter((item) => item.codeValue === secondParams)
    : timeLimitTypes.value
}

const cancal = () => {
  emit('changeSubmit')
  state.dialogShow = false
}

const changeResult = async (val: any) => {
  if (val == 3) {
    const { getLimitTime } = useLimitTime()
    getLimitTime(props.taskId).then((time) => {
      timeLimit.value =
        caseBackApproveDto.deadline =
        dispatchForm.deadline =
          time
    })
    if (props.caseInfo.acceptDepartment) {
      // let deptCode = await getSynergyDepartment()
      filterDeptCode.value = [
        props.caseInfo.acceptDepartment,
        applyDepartmentCode?.value,
      ]
      immediate.value = true
    } else {
      filterDeptCode.value = [applyDepartmentCode?.value]
      immediate.value = true
    }
    state.showValue = [
      props.caseInfo.reflectIndustryCode,
      props.caseInfo.reflectClassCode,
    ]
  }
}

const init = () => {
  if (currentDepartmentCode === '12319') {
    dispatchRules.firstClass = [
      {
        required: true,
        message: '事项类别不能为空',
        trigger: 'blur,change',
        validator: validateClass,
      },
    ]
  }
}
init()
watch(
  () => props.caseInfo,
  (val) => {
    if (val.eventSourceCode) {
      if (String(val.eventSourceCode) !== '2') {
        // 其他来源不能退单转网格
        approveTypes.value = approveTypes.value.filter(
          (item) => item.codeValue !== '6'
        )
      }
      if (String(val.eventSourceCode) !== '1') {
        // 其他来源不能转市级审批
        approveTypes.value = approveTypes.value.filter(
          (item) => item.codeValue !== '5'
        )
      }
    }
    if (
      val.reportDepartmentCode &&
      val.reportDepartmentCode === currentDepartmentCode
    ) {
      returnApproveTypes.value = returnApproveTypes.value.filter(
        (item) => item.codeValue != '4'
      )
    }
  },
  {
    deep: true,
    immediate: true,
  }
)
watch(
  () => props.submit,
  (val) => {
    val &&
      returnApplyForm.value?.validate((valid: any) => {
        if (valid) {
          submit()
        } else {
          emit('changeSubmit')
        }
      })
  }
)
const IdiomContent = (idContent: string) => {
  caseBackApproveDto.description = idContent
}
</script>
<style lang="scss" scoped>
::v-deep(.el-table th),
.el-table tr {
  background-color: #e1eaf7;
  color: #414951;
  padding-top: 8px;
  padding-bottom: 8px;
}

::v-deep(.el-table .cell) {
  text-align: center;
  font-size: 14px;
}

::v-deep(.el-table, .el-table__expanded-cell) {
  background-color: transparent;
}

::v-deep(.el-table tbody th) {
  background-color: transparent;
  color: #7a8693;
}

::v-deep(.el-radio__label) {
  color: #414951;
  font-weight: bold;
}
</style>
