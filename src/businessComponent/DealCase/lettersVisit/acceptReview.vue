<template>
  <div>
    <Title title="审查结果">
      <template #content>
        <el-form :model="state.censorReault" class="from">
          <el-row>
            <el-col :span="6">
              <el-form-item label="审查结果:">
                <span>{{
                  state.censorReault.slqk == '1' ? '准予受理' : '不予受理'
                }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="审查人:">
                <span>{{ state.censorReault.scr }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="审查时间:">
                <span>{{ state.censorReault.createTime }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="state.censorReault.slqk == '0'"></el-col>
            <el-col :span="6">
              <el-form-item label="退单原因:" v-if="state.censorReault.slqk == '0' && props.caseInfo.xfTaskId">
                <span>{{ returnApplyTypes.find(item=>state.censorReault.chargeReason == item.codeValue)?.codeName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="state.censorReault.slqk == '0' && props.caseInfo.xfTaskId">
              <el-form-item label="退单责任人:">
                <span>{{ state.censorReault.chargePerson }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="state.censorReault.slqk == '0' && props.caseInfo.xfTaskId">
              <el-form-item label="退单申请时间:">
                <span>{{ state.censorReault.applyTime }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="state.censorReault.slqk == '0' && props.caseInfo.xfTaskId">
              <el-form-item label="退单申请人:">
                <span>{{ state.censorReault.scr }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="反馈期限:" v-if="state.censorReault.slqk == '1' && state.censorReault.disposeTime">
                <span>{{ timeLimitTypes.find(item=>state.censorReault.disposeTime == item.codeValue)?.codeName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="截止时间:" v-if="state.censorReault.slqk == '1' && state.censorReault.deadline">
                <span>{{ state.censorReault.deadline }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="退单说明:" v-if="state.censorReault.slqk == '0' && props.caseInfo.xfTaskId">
            <span :style="{ wordBreak: 'break-all' }">{{ state.censorReault.tdsm }}</span>
          </el-form-item>
          <el-form-item label="意见说明:">
            <span :style="{ wordBreak: 'break-all' }">{{ state.censorReault.yjsm }}</span>
          </el-form-item>
        </el-form>
      </template>
    </Title>
    <ContactFirst :is-choice="false" :taskId="props.flowModel.taskId" :is-only-look="true" type="先联"/>
    <Title title="受理复核">
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
          <Idiom :node-code="props.flowModel.code" @idiomContentText="IdiomContent"></Idiom>
          <IdiomDialog :node-code="props.flowModel.code" :show-flag="idiomControl" @close-dialog="closeDialog"
            @get-idiom-content="IdiomContent" ref="idiomRef" />
          <el-row>
            <el-col :span="10">
              <el-form-item label="下一步处理人:" prop="nextCode">
                <el-select v-model="dispatchForm.nextCode" placeholder="阶段" @change="changeType" clearable>
                  <el-option :label="item.name" :value="item.firstParam" v-for="item in state.typeList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7" v-if="dispatchForm.nextCode != 'XF103'">
              <el-form-item label="" prop="nextDept">
                <el-select v-model="dispatchForm.nextDept" placeholder="科室" :style="{ marginLeft: '10px' }"
                  @change="getUserByDeptCode" clearable>
                  <el-option :label="item.departmentName" :value="item.departmentCode"
                    v-for="item in state.deptList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7" v-if="dispatchForm.nextCode != 'XF103'">
              <el-form-item label="" prop="nextUser">
                <el-select v-model="dispatchForm.nextUser" placeholder="人员" :style="{ marginLeft: '10px' }" clearable>
                  <el-option :label="item.name" :value="item.username" v-for="item in state.userList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch, nextTick } from 'vue'
import { ElMessage, FormRules } from 'element-plus'
import Title from '@/components/Title/Title.vue'
import { cloneDeep } from 'lodash-es'
import { Session } from '@/utils/storage'
import Idiom from '@/businessComponent/Idiom/Idiom.vue'
import { useDepartment } from '@/hooks/useDepartment'
import IdiomDialog from '@/businessComponent/Idiom/IdiomDialog.vue'
import { useIdiom } from '@/hooks/useIdiom'
import { getPrevious, getAcceptCensorList } from '@/hooks/getPrevious'
import { LettersVisitService } from '@/api/service/LettersVisit/LettersVisitService'
import { useCode } from '@/hooks/useCode'
import ContactFirst from '@/views/done/components/ContactFirst.vue'

const lettersVisitService = new LettersVisitService()
const { returnApplyTypes, timeLimitTypes } = useCode();
const {
  currentDepartmentCode,
  name,
  currentDepartmentCodeName,
  departmentList,
  username,
} = useDepartment()
const props = withDefaults(
  defineProps<{
    flowModel: any
    taskId: string
    submit: boolean
    caseInfo: any
    attachments: any
  }>(),
  {
    taskId: '',
  }
)
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom()
const emit = defineEmits(['changeLoading', 'changeSubmit', 'done'])

const returnApplyForm = ref()
const state = reactive({
  typeList: [] as any,
  deptList: [] as any,
  userList: [] as any,
  roleId: '' as string,
  name: name,
  censorReault: {} as any,
  reflectType: '200',
  previous: {} as any
})

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
  lettersVisitService.getReflectType(props.flowModel.code, state.reflectType).then(r => {
    if (state.censorReault.slqk == '1' || (state.censorReault.slqk == '0' && props.caseInfo.caseType == '2')) {
      state.typeList = r.data.filter((i: any) => i.firstParam != 'XF103')
    } else {
      state.typeList = r.data.filter((i: any) => i.firstParam != 'XF200')
      if(!props.caseInfo.xfTaskId){
        state.typeList.forEach((item:any)=>{
          item.firstParam === 'XF103'&& (item.name = '归档')
        })
      }
    }
    if (dispatchForm.sfsh == '0') {
      getPrevious(props.taskId).then(res => {
        state.previous = cloneDeep(res)
        dispatchForm.nextCode = state.typeList.find(
          (i: any) => i.secondParam === state.previous.currentNode
        )?.firstParam
        
        dispatchForm.nextCode && changeType(dispatchForm.nextCode)
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
  if(dispatchForm.nextCode != 'XF103'){
    dispatchForm.nextRole = state.typeList.find(
      (i: any) => i.firstParam === type
    )?.thirdParam || ''
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
      }else if(dispatchForm.sfsh == '1' &&
        state.deptList.filter((item: any) => item.departmentCode === currentDepartmentCode).length > 0
      ){
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
    xfslcheck: cloneDeep(dispatchForm),
  }

  emit('changeLoading', true)
  lettersVisitService
    .postXfAcceptCheck(params)
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
const getIsEnableBack = ()=>{
  emit('changeLoading', true)
  lettersVisitService.getIsEnableBack(props.caseInfo.xfTaskId,departmentList[0].departmentParentCode).then(res=>{
    if (res.code == 200) {
      save();
    } else {
      emit("changeLoading", false);
      emit("changeSubmit");
      ElMessage.warning(res.message);
    }
  })
  .catch(() => {
    emit("changeLoading", false);
    emit("changeSubmit");
  });
}
const submit = ()=>{
  if(dispatchForm.nextCode === 'XF103' && props.caseInfo.xfTaskId){
    getIsEnableBack()
  }else{
    save()
  }
}

const init = () => {
  getAcceptCensorList(props.taskId).then(res=>{
    state.censorReault = res
    getReflectType()
  })
}
init()

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
const IdiomContent = (idContent: any) => {
  dispatchForm.yjsm = idContent
}
</script>
