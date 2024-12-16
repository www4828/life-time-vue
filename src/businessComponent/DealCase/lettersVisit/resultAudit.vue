<template>
  <div>
    <Title title="办理结果">
      <template #content>
        <DoneForm ref="doneForm" label="办理描述" :form="state.form" nodeCode="XC303-1" />
      </template>
    </Title>
    <ContactFirst :is-choice="state.canChoice" :taskId="props.flowModel.taskId" :is-only-look="false" type="先联"
      @get-result="getResult" ></ContactFirst>
    <Title title="办结报告" v-if="is12345">
      <template #content>
        <DoneReport ref="doneReport" :case-info="props.caseInfo" :taskId="props.taskId" :node-code="['XC303-2','XC303-3','XC303-4','XC303-5']" />
      </template>
    </Title>
    <Title title="结果审定">
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
            <el-col :span="7" v-if="state.isShow">
              <el-form-item label="" prop="nextDept">
                <el-select v-model="dispatchForm.nextDept" placeholder="科室" :style="{ marginLeft: '10px' }"
                  @change="getUserByDeptCode" clearable>
                  <el-option :label="item.departmentName" :value="item.departmentCode"
                    v-for="item in state.deptList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7" v-if="state.isShow">
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
    <el-dialog
      custom-class="dialog"
      v-model="state.dialogShow"
      width="70%"
      destroy-on-close
      title="12319结案审批需上传附件，请选择（上限3条）"
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
import { reactive, ref, watch, nextTick, computed } from 'vue'
import { ElMessage, FormRules } from 'element-plus'
import Title from '@/components/Title/Title.vue'
import { cloneDeep, isEmpty } from 'lodash-es'
import { Session } from '@/utils/storage'
import Idiom from '@/businessComponent/Idiom/Idiom.vue'
import { useDepartment } from '@/hooks/useDepartment'
import IdiomDialog from '@/businessComponent/Idiom/IdiomDialog.vue'
import DoneReport from '@/views/done/components/DoneReport.vue'
import DoneForm from "@/views/done/components/DoneForm.vue";
import { ContactModel } from '@/api/model/disposeModel'
import ContactFirst from '@/views/done/components/ContactFirst.vue'
import { useIdiom } from '@/hooks/useIdiom'
import { getPrevious } from '@/hooks/getPrevious'
import { LettersVisitService } from '@/api/service/LettersVisit/LettersVisitService'
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";

const lettersVisitService = new LettersVisitService()
const { username, name, currentDepartmentCodeName, currentDepartmentCode } = useDepartment()
const props = withDefaults(
  defineProps<{
    flowModel: any
    taskId: string
    submit: boolean
    caseInfo: any
    attachments: any
    allFiles: any
    specialTips: any
  }>(),
  {
    taskId: '',
  }
)
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom()
const emit = defineEmits(['changeLoading', 'changeSubmit', 'done','changeReault'])
const is12345 = computed(() => {
  return props.caseInfo.eventSourceCode === '1'
})
const fileRef = ref();

const state = reactive({
  typeList: [] as any,
  deptList: [] as any,
  userList: [] as any,
  roleId: '' as string,
  name: name,
  reflectType: '200',
  form: {} as any,
  isShow: true,
  canChoice: true,
  relations: [] as any,
  previous: {} as any, // 上一步信息
  ckeckedCode: '',
  dialogShow: false,
  attachments: []
})
const doneForm = ref()

const returnApplyForm = ref()
const doneReport = ref()
const dispatchForm = reactive({
  sfsh: '1',
  czr: username,
  type: '3',
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
  const { row, sourceData } = result
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
const changeType = (type: string) => {
  dispatchForm.nextDept = ''
  dispatchForm.nextUser = ''
  state.deptList = state.userList = []
  state.ckeckedCode = state.typeList.find((i: any) => i.firstParam === type)?.secondParam
  if(type==='XF304'){
    state.isShow = false
  }else{
    state.isShow = true
    dispatchForm.nextRole = state.typeList.find(
      (i: any) => i.firstParam === type
    )?.thirdParam
    dispatchForm.nextRole && getDeptByRoleId(dispatchForm.nextRole)
  }
}

const getDeptByRoleId = (roleId: string) => {
  state.deptList = []
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
      }
    })
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
    attachmentInfos: state.attachments.length > 0 ? cloneDeep(state.attachments) : props.attachments,
    caseInfo: cloneDeep(props.caseInfo),
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    department: cloneDeep(departmentList[0]),
    xfjg: cloneDeep(dispatchForm),
    specialFlags: props.specialTips
  }

  params.caseDisposeDto = doneForm.value.getFormData()
  params.relations = state.relations
  if (is12345.value) {
    let report = doneReport.value.getFormData()
    params.report = {
      ...report,
      xcckTime: report.xcckTime ? (report.xcckTime.length === 16 ? report.xcckTime + ':00' : report.xcckTime) : '',
      replyTime: report.replyTime ? (report.replyTime.length === 16 ? report.replyTime + ':00' : report.replyTime) : '',
    }
  }
  // console.log(params);
  // emit('changeSubmit')
  

  emit('changeLoading', true)
  lettersVisitService
    .postXfResult(params)
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
  if(dispatchForm.sfsh == '1' && state.ckeckedCode != props.flowModel.code){
    doneForm.value.checkForm().then((valid: any) => {
      if (valid) {
        submit()
      } else {
        emit('changeSubmit')
      }
    })
  }else{
    save()
  }
}
const changeReault = (val:any)=>{
  emit("changeReault", val == '1' );
  state.reflectType = val == '1' ? '200' : '400'
  dispatchForm.nextCode = ''
  dispatchForm.nextRole = ''
  dispatchForm.nextDept = ''
  dispatchForm.nextUser = ''
  state.deptList = state.userList = []
  getReflectType()
}
const getReflectType = () => {
  lettersVisitService
    .getReflectType(props.flowModel.code, state.reflectType)
    .then(r => {
      state.typeList = r.data
      if (dispatchForm.sfsh == '0') {
        getPrevious(props.taskId).then(res => {
          state.previous = cloneDeep(res)
          dispatchForm.nextCode = state.typeList.find(
            (i: any) => i.secondParam === state.previous.currentNode
          )?.firstParam
          
          changeType(dispatchForm.nextCode)
        })
      } else {
        if(!props.caseInfo.xfTaskId || props.caseInfo.splitFlag === '0' ){
          state.typeList.forEach((item:any)=>{
            item.firstParam === 'XF304'&& (item.name = '归档')
          })
        }
        state.previous = {}
      }
    })
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
        }
      ]
    })
    .then((res) => {
      if (res.code === 200) {
        Object.keys(res.data.results[0]).forEach((key) => {
              state.form[key] = res.data.results[0][key];
            });
      }
    });
};
const submit = ()=>{
  if (is12345.value){
    if (state.relations.filter((item:any)=>item.status == 2).length === 0){
      ElMessage.error("请选择先联信息！");
      emit("changeSubmit");
    }else{
      doneReport.value.checkForm().then((status: boolean) => {
        if (status) {
          if(props.allFiles.length > 0 ){
            state.dialogShow = true;
          }else{
            save()
          }
        } else {
          emit("changeSubmit");
        }
      });
    }
  }else{
    save()
  }
  // if (state.relations.filter((item:any)=>item.status == 2).length === 0 && is12345.value) {
  //   ElMessage.error("请选择先联信息！");
  //   emit("changeSubmit");
  //   return;
  // }else{
  //   save();
  // }
}
const init = ()=>{
  getDoneReport()
}
init()

const fileSave = () => {
  state.attachments = fileRef.value.getChoiceFiles();
  state.dialogShow = false;
  save();
};
const cancal = () => {
  emit("changeSubmit");
  state.dialogShow = false;
};
watch(
  ()=>props.caseInfo,()=>{
    if (props.caseInfo.taskId) getReflectType()
    nextTick(()=>{
      if (props.caseInfo.eventSourceCode == '1') {
        doneReport.value.getDoneReportList()
      }
    })
  },{
    deep: true,
    immediate: true
  }
)
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
const IdiomContent = (idContent: any) => {
  dispatchForm.yjsm = idContent
}
</script>
