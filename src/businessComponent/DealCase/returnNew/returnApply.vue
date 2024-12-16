<template>
  <div>
    <Title title="申请退单">
      <template #content>
        <el-form :model="formData" class="from" ref="returnApplyForm" :rules="dispatchRules">
          <el-row>
            <el-col :span="6">
              <el-form-item label="退单理由" prop="chargeReason">
                <el-select v-model="formData.chargeReason" placeholder="请选择" @change="changeHandle">
                  <el-option v-for="item in backReason" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="formData.chargeReason === '33' ? 12 : 6" v-if="data.list.length > 0">
              <el-form-item label="退单理由(二级)" prop="chargeReason2">
                <el-select v-model="formData.chargeReason2" placeholder="请选择">
                  <el-option v-for="item in data.list" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="退单走向" prop="nextSource">
                <el-select v-model="formData.nextSource" placeholder="请选择">
                  <el-option v-for="item in backSource" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="建议市级单位" v-if="formData.nextSource === '1'" prop="nextDepartment">
                <el-select v-model="formData.nextDepartment" placeholder="请选择" filterable clearable>
                  <el-option v-for="item in data.nextDeptList" :label="item.DEPARTMENT" :value="item.DEPT_ID" />
                </el-select>
              </el-form-item>
            </el-col>
            <template v-if="formData.chargeReason2 === '39'">
              <el-col :span="6">
                <el-form-item label="联系人" prop="concatPerson">
                  <el-input v-model="formData.concatPerson" placeholder="联系人" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="联系电话" prop="concatNum">
                  <el-input v-model="formData.concatNum" placeholder="联系电话" />
                </el-form-item>
              </el-col>
            </template>
            <el-col :span="6" v-if="formData.chargeReason2 === '41'">
              <el-form-item label="缺失要素" prop="missingElements">
                <el-select v-model="formData.missingElements" placeholder="请选择">
                  <el-option v-for="item in missingElements" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <template v-if="formData.chargeReason2 === '43'">
              <el-col :span="6">
                <el-form-item label="重复单号1" prop='repeatWpid'>
                  <el-input v-model="formData.repeatWpidList[0]" placeholder="重复单号1" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="重复单号2">
                  <el-input v-model="formData.repeatWpidList[1]" placeholder="重复单号2" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="重复单号3">
                  <el-input v-model="formData.repeatWpidList[2]" placeholder="重复单号3" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="重复单号4">
                  <el-input v-model="formData.repeatWpidList[3]" placeholder="重复单号4" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="重复单号5">
                  <el-input v-model="formData.repeatWpidList[4]" placeholder="重复单号5" />
                </el-form-item>
              </el-col>
            </template>
            <el-col :span="24" v-if="formData.chargeReason === '34'">
              <el-form-item label="相关文件" prop="mcaseFileDto">
                <el-table border :data="data.tableData" style="width: 100%">
                  <el-table-column prop="fileName" label="文件名称" align="center" min-width="15%">
                    <template #default="scope">
                      <el-input v-model="data.tableData[scope.$index].fileName" style="width: 100%"
                        placeholder="文件名称" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="documentNo" label="文号" align="center" min-width="15%">
                    <template #default="scope">
                      <el-input v-model="data.tableData[scope.$index].documentNo" style="width: 100%"
                        placeholder="文号" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="documentContent" label="具体条款内容" align="center" min-width="30%">
                    <template #default="scope">
                      <el-input v-model="data.tableData[scope.$index].documentContent" style="width: 100%"
                        placeholder="具体条款内容" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="replenish" label="说明补充" align="center" min-width="20%">
                    <template #default="scope">
                      <el-input v-model="data.tableData[scope.$index].replenish" style="width: 100%" placeholder="说明补充"
                        maxlength="50" show-word-limit />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" align="center" min-width="8%" class-name="setting">
                    <template #default="scope">
                      <el-button type="primary" :icon="Plus" circle size="small" @click="addDocument"
                        v-if="scope.$index === data.tableData.length - 1 && data.tableData.length < 5" />
                      <!-- <el-button type="danger" :icon="Minus" circle /> -->
                      <el-button type="danger" :icon="Delete" circle size="small" @click="deleteDocument(scope)"
                        v-if="data.tableData.length > 1" />
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="具体内容" prop="detailContent"
            v-if="formData.chargeReason === '38' || formData.chargeReason2 === '44'">
            <el-input @dblclick="showDialog" v-model="formData.detailContent" autofocus
              :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="查看情况" prop="viewCondition" v-else-if="formData.chargeReason === '35'">
            <el-input @dblclick="showDialog" v-model="formData.viewCondition" autofocus
              :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="实际诉求" prop="practicalDemands" v-else-if="
            formData.chargeReason === '36' && formData.chargeReason2 === '42'
          ">
            <el-input @dblclick="showDialog" v-model="formData.practicalDemands" autofocus
              :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="说明补充" prop="replenish" v-else>
            <el-input @dblclick="showDialog" v-model="formData.replenish" autofocus
              :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" maxlength="500" show-word-limit />
          </el-form-item>
          <Idiom v-if="props.flowModel.code" :node-code="props.flowModel.code" @idiomContentText="IdiomContent"></Idiom>
          <IdiomDialog v-if="props.flowModel.code" :node-code="props.flowModel.code" :show-flag="idiomControl"
            @close-dialog="closeDialog" @get-idiom-content="IdiomContent" ref="idiomRef" />
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage, FormRules } from 'element-plus'
import Title from '@/components/Title/Title.vue'
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { cloneDeep } from 'lodash-es'
import { Session } from '@/utils/storage'
import dayjs from 'dayjs'
import { useCode } from '@/hooks/useCode'
import Idiom from '@/businessComponent/Idiom/Idiom.vue'
import { useDepartment } from '@/hooks/useDepartment'
import IdiomDialog from '@/businessComponent/Idiom/IdiomDialog.vue'
import { useIdiom } from '@/hooks/useIdiom'
import { CodeTreeModel } from '@/api/model/codeModel'
import { Plus, Minus, Delete } from '@element-plus/icons-vue'
import { ReturnModel } from '@/api/model/caseModel'

const { missingElements, backReason, backSource } = useCode()
const disposeService = new DisposeService()
const { currentDepartmentCode } = useDepartment()
const props = withDefaults(
  defineProps<{
    flowModel: any
    taskId: string
    submit: boolean
    caseInfo: any
    attachments: any
    nodeCode: string
    applyDetail?: any
  }>(),
  {
    taskId: '',
  }
)
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom()
const emit = defineEmits(['changeLoading', 'changeSubmit', 'done'])
const returnApplyForm = ref()
const formData: ReturnModel = reactive({
  applyPerson: '',
  applyTime: '',
  approver: '',
  chargePerson: '',
  chargeReason: '',
  chargeReason2: '',
  concatNum: '',
  concatPerson: '',
  description: '',
  detailContent: '',
  missingElements: '',
  nextDepartment: '',
  nextSource: '',
  nodeCode: props.nodeCode,
  practicalDemands: '',
  repeatWpid: '',
  replenish: '',
  viewCondition: '',
  mcaseFileDto: '1111',
  repeatWpidList: [],
})

const dispatchRules = reactive<FormRules>({
  description: [
    { required: true, message: '意见说明不能为空', trigger: 'blur' },
  ],
  chargeReason: [
    { required: true, message: '退单原因不能为空', trigger: 'blur' },
  ],
  chargeReason2: [
    { required: true, message: '退单责任人不能为空', trigger: 'blur' },
  ],
  concatPerson: [
    { required: true, message: '联系人不能为空', trigger: 'blur' },
  ],
  concatNum: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
  nextSource: [{ required: true, message: '请选择退单走向', trigger: 'blur' }],
  viewCondition: [
    { required: true, message: '查看情况不能为空', trigger: 'blur' },
  ],
  // replenish: [{ required: true, message: '补充说明不能为空', trigger: 'blur' }],
  detailContent: [
    { required: true, message: '具体内容不能为空', trigger: 'blur' },
  ],
  practicalDemands: [
    { required: true, message: '实际诉求不能为空', trigger: 'blur' },
  ],
  missingElements: [
    { required: true, message: '缺失要素不能为空', trigger: 'blur' },
  ],
  mcaseFileDto: [
    {
      required: true,
      validator(rule, value, callback, source, options) {
        if (
          data.tableData.some((item) => item.fileName && item.documentNo && item.documentContent)
        ) {
          callback()
        } else {
          callback(new Error('相关文件不能为空!'))
        }
      },
    },
  ],
  repeatWpid: [
    {
      required: true,
      validator(rule, value, callback, source, options) {
        if (formData.repeatWpidList[0]) {
          callback()
        } else {
          callback(new Error('请填写至少一个重复单号!'))
        }
      },
    },
  ],
  nextDepartment: [
    { required: true, message: '请选择', trigger: 'blur' },
  ],
  // nextDepartment: [
  //   {
  //     required: false,
  //     validator(rule, value, callback, source, options) {
  //       if (formData.nextSource === '1' && !value ) {
  //         callback(new Error('退单走向选择“其它承办单位”时为必填'))
  //       } else {
  //         callback()
  //       }
  //     },
  //   },
  // ],
})
const data = reactive({
  list: [] as CodeTreeModel[],
  tableData: [
    {
      fileName: '',
      documentNo: '',
      documentContent: '',
      replenish: '',
      taskId: props.taskId,
    },
  ],
  nextDeptList: [{
    DEPARTMENT: '',
    DEPT_ID: ''
  }]
})

// const checkForm = () => {
//   return new Promise(resolve=>{
//     returnApplyForm.value?.validate((valid: any) => {
//       console.log(valid);

//       resolve(valid)
//     })
//   })
// }
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    returnApplyForm.value!.validate((valid: any) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const changeHandle = (val: string) => {
  formData.chargeReason2 = ''
  data.list = backReason.value.filter((i) => i.codeValue === val)[0].childs!
  formData.description =
    formData.detailContent =
    formData.replenish =
    formData.viewCondition =
    ''
  data.tableData = [
    {
      fileName: '',
      documentNo: '',
      documentContent: '',
      replenish: '',
      taskId: props.taskId,
    },
  ]
}
const addDocument = () => {
  data.tableData.push({
    fileName: '',
    documentNo: '',
    documentContent: '',
    replenish: '',
    taskId: props.taskId,
  })
}
const deleteDocument = (scope: any) => {
  data.tableData = data.tableData.filter(
    (item, index) => index !== scope.$index
  )
}
const setParams = () => {
  formData.description = formData.detailContent || formData.replenish || formData.viewCondition;
  formData.chargeReason2 === '43' &&
    formData.repeatWpidList.length > 0 &&
    (formData.repeatWpid = formData.repeatWpidList.join(','))

  if (props.applyDetail?.chargeReason != formData.chargeReason) {
    if (formData.chargeReason != '34') {
      data.tableData = []
    }
    if (formData.chargeReason2 !== '39') {
      formData.concatPerson = formData.concatNum = ''
    }
    if (formData.chargeReason2 !== '41') {
      formData.missingElements = ''
    }
    if (formData.chargeReason2 !== '43') {
      formData.repeatWpidList = []
    }
    if (!(formData.chargeReason === '33' || formData.chargeReason === '38')) {
      formData.detailContent = ''
    }
    if (formData.chargeReason != '35') {
      formData.viewCondition = ''
    }
    if (!(formData.chargeReason === '36' && formData.chargeReason2 === '42')) {
      formData.practicalDemands = ''
    }
  }

}

const save = () => {
  setParams()
  let caseBackApplyDto = cloneDeep(formData)
  delete caseBackApplyDto.repeatWpidList
  delete caseBackApplyDto.mcaseFileDto
  // 退单审请
  const { departmentList } = Session.get('userInfo')
  let params: any = {
    attachmentInfos: cloneDeep(props.attachments),
    caseInfo: cloneDeep(props.caseInfo),
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    departmentVo: cloneDeep(departmentList[0]),
    caseBackApplyDto,
    mcaseFileDto: data.tableData.filter(
      (item) => item.fileName && item.documentNo && item.documentContent
    ),
  }
  // emit("changeLoading", false);
  // console.log(params);

  emit('changeLoading', true)
  disposeService
    .returnHotApply(params)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? 'success' : 'error',
        message: res.message + '，即将返回列表页',
      })
      emit('done')
    })
    .catch(() => {
      emit('done')
    })
}

const submit = () => {
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

const getNextDepartment = () => {
  disposeService
    .getNextDepartment(props.caseInfo.externalNumber, props.caseInfo.acceptDepartment)
    .then((res) => {
      data.nextDeptList = res.data
    })
}

const init = () => {
  const { name } = Session.get('userInfo')
  formData.applyPerson = name
  formData.applyTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
  getNextDepartment()
}
init();
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
watch(
  () => props.applyDetail,
  (val) => {
    if (props.applyDetail?.taskId) {
      data.list = backReason.value.filter((i) => i.codeValue === val.chargeReason)[0]?.childs!
      Object.keys(formData).forEach(key => {
        formData[key] = String(val[key])
      })
      formData.repeatWpidList = val.repeatWpid?.split(',');
      formData.fileDto = data.tableData = val.fileDto || [{
        fileName: '',
        documentNo: '',
        documentContent: '',
        replenish: '',
        taskId: props.taskId,
      }]
    }
  }, {
  immediate: true,
  deep: true
}
)
const IdiomContent = (idContent: string) => {
  formData.description = formData.detailContent = formData.replenish = formData.viewCondition = idContent
}
defineExpose({
  getFormData() {
    setParams()
    const form = cloneDeep(formData)
    form.fileDto = data.tableData
    delete form.mcaseFileDto
    delete form.repeatWpidList
    return form
  },
  checkForm
})
</script>
