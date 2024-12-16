<template>
  <div>
    <ContactFirst :is-choice="false" :taskId="props.flowModel.taskId" :is-only-look="true" type="先联"/>
    <Title title="受理审查">
      <template #content>
        <el-form :model="dispatchForm" class="from" ref="returnApplyForm" :rules="dispatchRules">
          <el-row>
            <el-col :span="10">
              <el-form-item label="受理情况:" prop="slqk">
                <el-radio-group v-model="dispatchForm.slqk" @change="changeReault">
                  <el-radio label="1" :style="{ marginRight: '10px' }">准予受理</el-radio>
                  <el-radio label="0">不予受理</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="是否重要件:" prop="importLevel">
                <el-radio-group v-model="dispatchForm.importLevel">
                  <el-radio label="0" :style="{ marginRight: '10px' }">一般件</el-radio>
                  <el-radio label="1">重要件</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="初步审查人:">
                <span>{{ state.name }}</span>
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
                <el-select v-model="dispatchForm.nextUser" placeholder="人员" :style="{ marginLeft: '10px' }" @change="changeNextUser">
                  <el-option :label="item.name" :value="item.username" v-for="item in state.userList"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="dispatchForm.slqk == '0' && caseInfo.xfTaskId">
            <el-col :span="6">
              <el-form-item label="退单原因:" prop="chargeReason">
                <el-select v-model="dispatchForm.chargeReason" placeholder="请选择">
                  <el-option v-for="item in returnApplyTypes" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="退单责任人:" prop="chargePerson">
                <el-input v-model="dispatchForm.chargePerson"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申请时间:">
                <span>{{ dispatchForm.applyTime }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="退单申请人:">
                <span>{{ state.name }}</span>
              </el-form-item>
            </el-col>
            <el-form-item label="退单意见:" prop="tdsm">
            <el-input v-model="dispatchForm.tdsm" autofocus :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea" maxlength="500" show-word-limit />
          </el-form-item>
          </el-row>
          <el-row v-if="dispatchForm.slqk == '1'">
            <el-col :span="6">
              <el-form-item label="反馈期限:" prop="disposeTime">
                <el-select v-model="dispatchForm.disposeTime" placeholder="请选择" @change="changeTime">
                  <el-option v-for="item in timeLimitTypes" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4"></el-col>
            <el-col :span="6">
              <el-form-item label="截止时间:" prop="deadline">
                <!-- <span>{{ dispatchForm.deadline }}</span> -->
                <el-date-picker type="datetime" v-model="dispatchForm.deadline" :editable="false" format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm" :disabled-date="disabledDate" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch, computed } from "vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { cloneDeep, isEmpty } from "lodash-es";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { useDepartment } from "@/hooks/useDepartment";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { useIdiom } from "@/hooks/useIdiom";
import { LettersVisitService } from "@/api/service/LettersVisit/LettersVisitService";
import { useCode } from "@/hooks/useCode";
import dayjs from "dayjs";
import { getAcceptCensorList } from '@/hooks/getPrevious'
import { getLimitTime } from "@/hooks/getLimitTime";
import ContactFirst from '@/views/done/components/ContactFirst.vue'

const lettersVisitService = new LettersVisitService();
const { username, name, departmentList, currentDepartmentCode } = useDepartment();
const { returnApplyTypes, timeLimitTypes } = useCode();
const emit = defineEmits(["changeLoading", "changeSubmit", "done"]);
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
    specialTips: any
  }>(),
  {
    taskId: "",
  }
);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const returnApplyForm = ref();

const state = reactive({
  typeList: [] as any,
  deptList: [] as any,
  userList: [] as any,
  roleId: '' as string,
  name: name,
  reflectType: '200'
})

const dispatchForm = reactive({
  slqk: '1',
  importLevel: '0',
  scr: username,
  nextCode: "",
  taskId: props.taskId,
  nextDept: "",
  yjsm: "",
  nextUser: "",
  nextRole: '',
  chargeReason: '',
  chargePerson: '',
  applyTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"),
  applyPerson: username,
  deadline:'',
  disposeTime:'',
  tdsm:''
});

const dispatchRules = reactive<FormRules>({
  yjsm: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  tdsm: [{ required: true, message: "请输入退单意见", trigger: "blur" }],
  nextCode: [{ required: true, message: "不能为空", trigger: "change" }],
  nextDept: [{ required: true, message: "不能为空", trigger: "change" }],
  nextUser: [{ required: true, message: "不能为空", trigger: "change" }],
  disposeTime: [{ required: true, message: "请选择", trigger: "change" }],
  deadline: [{ required: true, message: "不能为空", trigger: "change" }],
  chargeReason: [{ required: true, message: "退单原因不能为空", trigger: "blur" }],
  chargePerson: [{ required: true, message: "退单责任人不能为空", trigger: "blur" }],
});

const changeReault = (val: any) => {
  state.reflectType = val == '1' ? '200' : ''
  dispatchForm.nextCode = ''
  dispatchForm.nextRole = ''
  dispatchForm.nextDept = ''
  dispatchForm.nextUser = ''
  state.deptList = state.userList = []
  getReflectType()
}
const changeNextUser = (val: any)=>{
  if(dispatchForm.slqk == '0' && !dispatchForm.chargePerson){
    dispatchForm.chargePerson = state.userList.find((item:any)=>item.username === val).name
  }
}

const changeTime = async (val: string) => {
  const { firstParam, secondParam } = timeLimitTypes.value.find(
    (timeLimit) => timeLimit.codeValue === val
  )!;
  
  let deadline = (await getLimitTime(firstParam, secondParam)) as any;
  if(dayjs(deadline).toDate() > dayjs(props.caseInfo.deadline).toDate()){
    // ElMessage.warning('截止时间大于原截止时间，请重新选择反馈期限')
    dispatchForm.deadline = props.caseInfo.deadline
  }else{
    dispatchForm.deadline = deadline
  }
};

const getReflectType = () => {
  lettersVisitService.getReflectType(props.flowModel.code, state.reflectType).then(res => {
    if (dispatchForm.slqk == '0') {
      state.typeList = res.data.filter((i: any) => i.firstParam != 'XF200')
    } else {
      state.typeList = res.data
    }
  })
}
const changeType = (type: string) => {
  dispatchForm.nextDept = ''
  dispatchForm.nextUser = ''
  state.deptList = state.userList = []
  dispatchForm.nextRole = state.typeList.find((i: any) => i.firstParam === type)?.thirdParam
  dispatchForm.nextRole && getDeptByRoleId(dispatchForm.nextRole)
}

const getDeptByRoleId = (roleId: string) => {
  state.deptList = []
  lettersVisitService.getDeptByRoleId(roleId, props.caseInfo.acceptDepartment).then(res => {
    state.deptList = res.data

    if (dispatchForm.slqk == '1' &&
      state.deptList.filter((item: any) => item.departmentCode === currentDepartmentCode).length > 0
    ) {
      dispatchForm.nextDept = currentDepartmentCode
      dispatchForm.nextDept && getUserByDeptCode(dispatchForm.nextDept)
    }
  })
}
const getUserByDeptCode = (deptCode: string) => {
  dispatchForm.nextUser = ''
  state.userList = []
  if (deptCode) {
    lettersVisitService.getUserByDeptCode(dispatchForm.nextRole, deptCode).then(res => {
      state.userList = res.data
    })
  }
}
const disabledDate = (date: Date)=>{
  return date > dayjs(props.caseInfo.deadline).toDate()
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
  if(dispatchForm.slqk == '0'  && props.caseInfo.xfTaskId){
    getIsEnableBack()
  }else{
    save()
  }
}

const save = () => {
  
  let params: any = {
    attachmentInfos: cloneDeep(props.attachments),
    caseInfo: cloneDeep(props.caseInfo),
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    department: cloneDeep(departmentList[0]),
    xfslsc: cloneDeep(dispatchForm),
    specialFlags: props.specialTips
  };
  // console.log(params);
  // emit('changeSubmit')
  
  emit("changeLoading", true);
  lettersVisitService
    .postXfAcceptCensor(params)
    .then((res) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
      emit("done");
    })
    .catch(() => {
      emit("done");
    });
};
const init = () => {
  getAcceptCensorList(props.taskId).then(res => {
    dispatchForm.importLevel = res.importLevel || '0'
  })
  getReflectType()
  changeTime(dispatchForm.disposeTime)
}
init()


watch(
  () => props.caseInfo,
  (val) => {
    dispatchForm.disposeTime = '11'
    if(props.caseInfo.deadline){
      changeTime('11')
    }
  },{
    deep:true,
    immediate: true
  }
);
watch(
  () => props.submit,
  (val) => {
    val &&
      returnApplyForm.value?.validate((valid: any) => {
        // emit("changeSubmit");
        if (valid) {
          submit();
        } else {
          emit("changeSubmit");
        }
      });
  }
);
const IdiomContent = (idContent: any) => {
  dispatchForm.yjsm = idContent;
};
</script>
