<template>
  <div>
    <Title title="办理核实">
      <template #content>
        <el-form :model="dispatchForm" class="from" ref="returnApplyForm" :rules="dispatchRules">
          <el-row>
            <el-col :span="6">
              <el-form-item label="工单流向:" prop="sfsh">
                <el-radio-group v-model="dispatchForm.sfsh" @change="changeReault">
                  <el-radio label="1" :style="{ marginRight: '10px' }">下一步</el-radio>
                  <el-radio label="0">退回</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="经办人:">
                <span>{{ name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="经办科室:">
                <span>{{ currentDepartmentCodeName }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="意见说明:" prop="yjsm">
            <el-input @dblclick="showDialog" v-model="dispatchForm.yjsm" autofocus :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea" maxlength="500" show-word-limit />
          </el-form-item>
          <el-row>
            <el-col :span="10">
              <el-form-item label="下一步处理人:" prop="nextCode">
                <el-select v-model="dispatchForm.nextCode" placeholder="阶段" @change="changeType" clearable>
                  <el-option :label="item.name" :value="item.firstParam" v-for="item in state.typeList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="" prop="nextDept">
                <el-select v-model="dispatchForm.nextDept" placeholder="科室" :style="{ marginLeft: '10px' }"
                  @change="getUserByDeptCode" clearable>
                  <el-option :label="item.departmentName" :value="item.departmentCode"
                    v-for="item in state.deptList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="" prop="nextUser">
                <el-select v-model="dispatchForm.nextUser" placeholder="人员" :style="{ marginLeft: '10px' }" clearable> 
                  <el-option :label="item.name" :value="item.username" v-for="item in state.userList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <Idiom :node-code="props.flowModel.code" @idiomContentText="IdiomContent"></Idiom>
          <IdiomDialog :node-code="props.flowModel.code" :show-flag="idiomControl" @close-dialog="closeDialog"
            @get-idiom-content="IdiomContent" ref="idiomRef" />
        </el-form>
      </template>
    </Title>
    <Title title="处置办结" v-if="dispatchForm.sfsh == '1'">
      <template #content>
        <DoneForm ref="doneForm" label="处理描述" :form="state.caseDisposeDto" nodeCode="XC200-1" />
      </template>
    </Title>
    <ContactFirst is-choice :taskId="props.flowModel.taskId" :is-only-look="false" type="先联" @get-result="getResult"/>
    <Title title="办结报告" v-if="is12345 && dispatchForm.sfsh == '1'">
      <template #content>
        <DoneReport ref="doneReport" :case-info="props.caseInfo" :taskId="props.taskId" :node-code="['XC200-2','XC200-3','XC200-4','XC200-5']" />
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch, nextTick, computed } from 'vue'
import { ElMessage, FormRules } from 'element-plus'
import Title from '@/components/Title/Title.vue'
import { cloneDeep, isEmpty } from 'lodash-es'
import { Session } from '@/utils/storage'
import Idiom from '@/businessComponent/Idiom/Idiom.vue'
import { useDepartment } from '@/hooks/useDepartment'
import IdiomDialog from '@/businessComponent/Idiom/IdiomDialog.vue'
import DoneReport from '@/views/done/components/DoneReport.vue'
import { useIdiom } from '@/hooks/useIdiom'
import { useCode } from '@/hooks/useCode'
import { EmitProps } from '@/businessComponent/ClassSelect/type'
import { ContactModel } from '@/api/model/disposeModel'
import ContactFirst from '@/views/done/components/ContactFirst.vue'
import ClassSelect from '@/businessComponent/ClassSelect/ClassSelect.vue'
import { getPrevious } from '@/hooks/getPrevious'
import { LettersVisitService } from '@/api/service/LettersVisit/LettersVisitService'
import DoneForm from "@/views/done/components/DoneForm.vue";
import dayjs from 'dayjs'

const lettersVisitService = new LettersVisitService()
const { resultTypes } = useCode()
const {
  username,
  name,
  currentDepartmentCodeName,
  currentDepartmentCode,
  currentDepartmentLevel,
} = useDepartment()
const props = withDefaults(
  defineProps<{
    flowModel: any
    taskId: string
    submit: boolean
    caseInfo: any
    attachments: any
    allFiles: any;
  }>(),
  {
    taskId: '',
  }
)
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom()
const { idiomControl:idiomControl2, closeDialog:closeDialog2, idiomRef:idiomRef2, showDialog:showDialog2 } = useIdiom()

const emit = defineEmits(['changeLoading', 'changeSubmit', 'done'])
const is12345 = computed(() => {
  return props.caseInfo.eventSourceCode === '1'
})

const state = reactive({
  typeList: [] as any,
  deptList: [] as any,
  userList: [] as any,
  roleId: '' as string,
  name: name,
  reflectType: '200',
  caseDisposeDto: {
    content: '',
    description: '',
    person: name,
    result: '',
    taskId: props.taskId,
    time: '',
    type: '',
    id: '',
    firstClass: '',
    secondClass: '',
    thirdClass: '',
    fourthClass: '',
    status: '1',
    departmentCode: currentDepartmentCode,
    recordId: '',
  } as any,
  defaultVale: [] as any,
  relations: [] as any,
  ckeckedCode: '',
  dialogShow: false,
  attachments: [],
  previous: {} as any // 上一步信息
})

const returnApplyForm = ref()
const doneForm = ref()
const doneReport = ref()
const fileRef = ref()
const dispatchForm = reactive({
  sfsh: '1',
  czr: username,
  type: '0',
  taskId: props.taskId,
  yjsm: '',
  nextCode: '',
  nextDept: '',
  nextUser: '',
  nextRole: '',
})

const dispatchRules = reactive<FormRules>({
  yjsm: [{ required: true, message: '意见说明不能为空', trigger: 'blur' }],
  nextCode: [{ required: true, message: '不能为空', trigger: 'change' }],
  nextDept: [{ required: true, message: '不能为空', trigger: 'change' }],
  nextUser: [{ required: true, message: "不能为空", trigger: "change" }],
})

interface Result {
  row: ContactModel
  sourceData: ContactModel[]
}
const getResult = (result: Result) => {
  const { row } = result
  const sourceData = cloneDeep(result.sourceData)
  if (!isEmpty(row)) {
    sourceData.forEach((source) => {
      if (source.id === row.id) {
        source.status = 2
      } else {
        source.status = 1
      }
    })
  }else{
    sourceData.forEach(source=>source.status = 1)
  }
  state.relations = sourceData
}

const changeReault = (val: any) => {
  state.reflectType = val == '1' ? '200' : '400'
  dispatchForm.nextCode = ''
  dispatchForm.nextRole = ''
  dispatchForm.nextDept = ''
  dispatchForm.nextUser = ''
  state.deptList = state.userList = []
  getReflectType()
}
const getReflectType = () => {
  state.typeList = []
  lettersVisitService.getReflectType(props.flowModel.code, state.reflectType).then(r => {
    state.typeList = r.data
    if (dispatchForm.sfsh == '0') {
      getPrevious(props.taskId).then(res => {
        state.previous = cloneDeep(res)
        dispatchForm.nextCode = state.typeList.find(
          (i: any) => i.secondParam === state.previous.currentNode
        ).firstParam
        changeType(dispatchForm.nextCode)
      })
    } else {
      state.previous = {}
    }
  })
}
const changeType = (type: string) => {
  dispatchForm.nextDept = ''
  dispatchForm.nextUser = ''
  state.deptList = state.userList = []
  dispatchForm.nextRole = state.typeList.find((i: any) => i.firstParam === type)?.thirdParam
  state.ckeckedCode = state.typeList.find((i: any) => i.firstParam === type)?.secondParam
  dispatchForm.nextRole && getDeptByRoleId(dispatchForm.nextRole)
}

const getDeptByRoleId = (roleId: string) => {
  state.deptList = []
  dispatchForm.nextUser = ''
  if(roleId){
    lettersVisitService
      .getDeptByRoleId(roleId, props.caseInfo.acceptDepartment)
      .then((res) => {
        state.deptList = res.data
        if (
          dispatchForm.sfsh == '0' &&
          state.previous.currentDepartment &&
          state.deptList.filter((item: any) => item.departmentCode === state.previous.currentDepartment).length > 0
        ) {
          dispatchForm.nextDept = state.previous.currentDepartment
          getUserByDeptCode(dispatchForm.nextDept)
        } else if (dispatchForm.sfsh == '1' &&
          state.deptList.filter((item: any) => item.departmentCode === currentDepartmentCode).length > 0
        ) {
          dispatchForm.nextDept = currentDepartmentCode
          getUserByDeptCode(dispatchForm.nextDept)
        }else{
          dispatchForm.nextUser = ''
        }
      })
  }else{
    state.deptList = []
  }
}
const getUserByDeptCode = (deptCode: string) => {
  dispatchForm.nextUser = ''
  state.userList = []
  if(deptCode){
    lettersVisitService
      .getUserByDeptCode(dispatchForm.nextRole, deptCode)
      .then((res) => {
        state.userList = res.data
        if (
          dispatchForm.sfsh == '0' &&
          state.previous.createUser &&
          state.userList.filter((item: any) => item.username === state.previous.createUser).length > 0
        ) {
          dispatchForm.nextUser = state.previous.createUser
        }else{
          dispatchForm.nextUser = ''
        }
      })
  }
}

const save = () => {
  const { departmentList } = Session.get('userInfo')
  const params: any = {
    attachmentInfos: cloneDeep(props.attachments),
    caseInfo: cloneDeep(props.caseInfo),
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    department: cloneDeep(departmentList[0]),
    xfbl: cloneDeep(dispatchForm),
    relations: [],
  }
  params.relations = state.relations
  if(dispatchForm.sfsh == '1'){
    params.caseDisposeDto = doneForm.value?.getFormData()
    // doneForm.value && (params.caseDisposeDto.taskId = props.taskId)
  }
  if (is12345.value) {
    let report = doneReport.value?.getFormData()
    if(report){
      params.report = {
        ...report,
        xcckTime: report.xcckTime ? (report.xcckTime.length === 16 ? report.xcckTime + ':00' : report.xcckTime) : '',
        replyTime: report.replyTime ? (report.replyTime.length === 16 ? report.replyTime + ':00' : report.replyTime) : '',
      }
    }
  }
  // console.log(params);
  // emit("changeSubmit");

  emit('changeLoading', true)
  lettersVisitService
    .postXfDeal(params)
    .then((res) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? 'success' : 'error',
      })
      emit('done')
    })
    .catch(() => {
      emit('done')
    })
}


const checkSubmit = () => {
  if (is12345.value && dispatchForm.sfsh == '1' && state.ckeckedCode != props.flowModel.code) {
    doneForm.value?.checkForm().then((val: any) => {
      doneReport.value.checkForm().then((status: boolean) => {
        if (val && status) {
          if (state.relations.length === 0) {
            ElMessage.error("请选择先联信息！");
            emit("changeSubmit");
            return;
          }
          
          if(props.caseInfo.caseType === '3' && props.allFiles?.filter((item:any)=>item.nodeCode === 'XC200' ).length === 0){
            ElMessage.error('国办单需要上传单位领导签字盖章的附件，请检查！')
            emit("changeSubmit");
          }else{
            save()
          }
        } else {
          emit("changeSubmit");
        }
      });

    })
  } else if (!is12345.value && dispatchForm.sfsh == '1' && state.ckeckedCode != props.flowModel.code) {
    doneForm.value?.checkForm().then((valid: any) => {
      if (valid) {
          if(props.caseInfo.caseType === '3' && props.allFiles?.filter((item:any)=>item.nodeCode === 'XC200' ).length === 0){
            ElMessage.error('国办单需要上传单位领导签字盖章的附件，请检查！')
            emit("changeSubmit");
          }else{
            save()
          }
      } else {
        emit('changeSubmit')
      }
    })
  } else {
    save();
  }


}
const setDefaultVale = ()=>{
  state.defaultVale = [props.caseInfo.reflectIndustryCode,props.caseInfo.reflectClassCode,props.caseInfo.reflectClassCode.slice(0,1) + '0' + props.caseInfo.reflectClassCode.slice(1,4)]
  state.caseDisposeDto.firstClass = props.caseInfo.reflectIndustryCode
  state.caseDisposeDto.secondClass = props.caseInfo.reflectClassCode
  state.caseDisposeDto.thirdClass = props.caseInfo.reflectClassCode.slice(0,1) + '0' + props.caseInfo.reflectClassCode.slice(1,4)
}
const getDoneReport = () => {
  lettersVisitService
    .getCaseDisposeList({
      "pageParams": {
        "pageIndex": 0,
        "pageSize": -1
      },
      "searchParams": [
        {
          "key": "taskId",
          "match": 'eq',
          "value": props.taskId
        },
        {
          key: 'status',
          match: 'eq',
          value: '1',
        },
        {
          key: 'createTime',
          match: 'orderByDesc',
          value: 'createTime',
        },
        // {
        //   key: 'createUser',
        //   match: 'eq',
        //   value: username,
        // }
      ]
    })
    .then((res) => {
      if (res.code === 200 && res.data.results.length > 0) {
        Object.keys(res.data.results[0]).forEach((key) => {
          state.caseDisposeDto[key] = res.data.results[0][key]
        })
        state.caseDisposeDto.person = name
        state.caseDisposeDto.time = dayjs(new Date()).format('YYYY-MM-DD HH:mm')
        state.defaultVale = [res.data.results[0].firstClass, res.data.results[0].secondClass, res.data.results[0].thirdClass]
        
      }else if(res.data.results.length === 0){
        nextTick(() => {
          setDefaultVale()
        })
      }
    });
};

const init = () => {
  getReflectType()
  getDoneReport()
  state.caseDisposeDto.time = dayjs(new Date()).format('YYYY-MM-DD HH:mm')
}
init()
watch(
  () => props.submit,
  (val) => {
    val &&
      returnApplyForm.value?.validate((valid: any) => {
        if (valid) {
          checkSubmit()
        } else {
          emit('changeSubmit')
        }
      })
  }
)
watch(
  () => props.caseInfo.eventSourceCode, () => {
    nextTick(() => {
      if (props.caseInfo.eventSourceCode == '1') {
        doneReport.value.getDoneReportList()
      }
    })
  },{
    immediate: true
  }
)
const IdiomContent = (idContent: any) => {
  dispatchForm.yjsm = idContent
}
const IdiomContentDone = (idContent: any) => {
  state.caseDisposeDto.description = idContent
}
</script>
