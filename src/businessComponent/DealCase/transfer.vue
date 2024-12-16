<template>
  <div>
    <Title title="向下派遣">
      <template #content>
        <el-form
          :model="dispatchForm"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="承办单位" prop="executeDepartCode">
                <DepartTreeSelect
                  is-immediate
                  :is-multiple="false"
                  :params="{
                    childNode: false,
                    currentNode: false,
                    optionList: [],
                    removeList: [],
                  }"
                  ref="executeDepartment"
                  @getDepartCode="executeDepartCode"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="事项类别" prop="firstClass" class="long">
                <ClassSelect
                  ref="classSelect"
                  :departmentCode="departmentCode"
                  :departmentLevel="currentDepartmentLevel"
                  @getCheckedValue="getCheckedValue"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="props.caseInfo.eventSourceCode == '0' || props.caseInfo.eventSourceCode == '2' ">
                <el-form-item label="处置时限" prop="disposeTime">
                  <el-select v-model="dispatchForm.disposeTime" clearable placeholder="请选择" @change="changeDisposeTime">
                    <el-option
                      v-for="item in timeLimitTypes"
                      :label="item.codeName"
                      :value="item.codeValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            <el-col :span="6">
              <el-form-item label="截止时间" prop="deadline">
                <span>{{ dispatchForm.deadline }}</span>
                <!-- <el-date-picker
                  v-model="dispatchForm.deadline"
                  type="datetime"
                  :editable="false"
                  format="YYYY-MM-DD HH:mm"
                  :disabled-date="disabledDate"
                  value-format="YYYY-MM-DD HH:mm"
                /> -->
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="协办单位" prop="chargeReason">
                <DepartTreeSelect
                  ref="assDepartment"
                  :is-immediate="false"
                  is-multiple
                  :params="{
                    childNode: false,
                    currentNode: false,
                    optionList: [],
                    removeList: [execute],
                  }"
                  @getDepartCode="assistantDepartCode"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="assDept.show">
              <el-form-item label="协办事项类别" prop="secondClass">
                <ClassSelect
                  ref="classSelect"
                  :departmentCode="assDept.assDeptCode"
                  :departmentLevel="assDept.assDeptlevel"
                  @getCheckedValue="getCheckedValueAss"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="意见说明" prop="description">
            <el-input
              @dblclick="showDialog"
              v-model="dispatchForm.description"
              autofocus
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <IdiomDialog
            :node-code="props.flowModel.code"
            :show-flag="idiomControl"
            @close-dialog="closeDialog"
            @get-idiom-content="IdiomContent"
            ref="idiomRef"
          />
          <Idiom :node-code="props.flowModel.code" @idiomContentText="IdiomContent"></Idiom>
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch, nextTick } from "vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { DispatchService } from "@/api/service/WorkTicket/DispatchService";
import { useDepartment } from "@/hooks/useDepartment";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { useLimitTime } from "@/hooks/useLimitTime";
import { useIdiom } from "@/hooks/useIdiom";
import { getDealLineFn } from "@/hooks/getLimitTime";
import {
  CaseModel,
  DispatchFormModel,
  CaseFormModel,
  DepartmentModel,
} from "@/api/model/caseModel";
import { useCode } from "@/hooks/useCode";
import dayjs from "dayjs";
interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
  nodes: Array<DepartmentModel>
}
type FormRules = /*unresolved*/ any

const disposeService = new DisposeService();
const dispatchService = new DispatchService();
const { currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
    warnForm: any
  }>(),
  {
    taskId: "",
  }
);
const { timeLimitTypes } = useCode();
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const emit = defineEmits(["changeLoading", "changeSubmit", "done", "showGroupVisit"]);
const execute = ref("");
const { timeLimit, disabledDate } = useLimitTime();
const assistant = ref<Array<DepartmentModel>>([]);
const returnApplyForm = ref();
const departmentCode = ref(currentDepartmentCode);
const dispatchForm = reactive({
  type: "",
  taskId: props.taskId,
  disposeTime: props.caseInfo.eventSourceCode == '1' ? "-1" : '',
  disposeDepartmentCode: "",
  dispatchDepartmentCode: currentDepartmentCode,
  description: "",
  deadline: "",
  firstClass: "",
  secondClass: "",
  fourthClass: undefined as any,
  thirdClass: undefined as any,
  firstClassName: '',
  secondClassName: '',
  thirdClassName: undefined as any,
  fourthClassName: undefined as any,
});

const assDept:any = reactive({
  show: false,
  assDeptCode:'',
  assDeptlevel:'',
  firstClass:'',
  secondClass: '',
  thirdClass: undefined,
  fourthClass: undefined,
  firstClassName: '',
  secondClassName: '',
  thirdClassName: undefined,
  fourthClassName: undefined
})
const validatePass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (execute.value === "") {
      callback(new Error("承办单位不能为空!"));
    } else {
      callback();
    }
  });
};
const validateSecondClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!assDept.firstClassName) {
      callback(new Error("不能为空!"));
    } else {
      callback();
    }
  });
};
const validateDeadline = (rule: any, value: any, callback: any) => {
  let year = value.split('-')[0],y = Number(dayjs().format('YYYY'))

  if(year == y || year == y+1 ){
    callback();
  }else{
    callback(new Error("截止时间格式错误，请返回重试!"));
  }
};
const dispatchRules = reactive<FormRules>({
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  executeDepartCode: [
    {
      required: true,
      message: "承办单位不能为空",
      trigger: "change",
      validator: validatePass,
    },
  ],
  deadline: [{ required: true, trigger: "blur,change" , validator: validateDeadline}],
  secondClass: [{ required: true, message: "不能为空", trigger: "change",validator: validateSecondClass, }],
});
nextTick(async () => {
  getDealLine()
  // const { getLimitTime } = useLimitTime();
  // dispatchForm.deadline = timeLimit.value = await getLimitTime(props.taskId);
});

const save = () => {
  const { departmentList } = Session.get("userInfo");
  const params: any = {
    attachmentInfos: cloneDeep(props.attachments),
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
    department: cloneDeep(departmentList[0]),
    dispatchInfos: [],
    isAuto: "",
    specialFlags: [],
  };
  if (assistant.value.length === 0 && execute.value !== "") {
    // 没选择协办但是承办单位不为空
    dispatchForm.type = "1";
    dispatchForm.disposeDepartmentCode = execute.value;
    params.dispatchInfos[0] = dispatchForm;
  } else {
    //选择了承办部门并且也选择了协办部门
    const assistants: any = [];
    const thirdDePartments = {
      thirdClass: dispatchForm.thirdClass,
      fourthClass: dispatchForm.fourthClass,
      thirdClassName: dispatchForm.thirdClassName,
      fourthClassName: dispatchForm.fourthClassName,
    };
    assistant.value!.forEach((ass) => {
      assistants.push({
        type: "0",
        disposeTime: dispatchForm.disposeTime,
        disposeDepartmentCode: ass.departmentCode,
        dispatchDepartmentCode: currentDepartmentCode,
        description: dispatchForm.description,
        deadline: dispatchForm.deadline,
        taskId: props.taskId,
        firstClass: ass.departmentGroup === "7013" ? assDept.firstClass : props.caseInfo.firstClass,
        secondClass: ass.departmentGroup === "7013" ? assDept.secondClass : props.caseInfo.secondClass,
        thirdClass: ass.departmentGroup === "7013" ? assDept.thirdClass : props.caseInfo.thirdClass,
        fourthClass: ass.departmentGroup === "7013" ? assDept.fourthClass : props.caseInfo.fourthClass,
        firstClassName: ass.departmentGroup === "7013" ? assDept.firstClassName : props.caseInfo.firstClassName,
        secondClassName: ass.departmentGroup === "7013" ? assDept.secondClassName : props.caseInfo.secondClassName,
        thirdClassName: ass.departmentGroup === "7013" ? assDept.thirdClassName : props.caseInfo.thirdClassName,
        fourthClassName: ass.departmentGroup === "7013" ? assDept.fourthClassName : props.caseInfo.thirdClassName,
      });
    });
    params.dispatchInfos = [
      {
        type: "1",
        disposeTime: dispatchForm.disposeTime,
        disposeDepartmentCode: execute.value,
        dispatchDepartmentCode: currentDepartmentCode,
        description: dispatchForm.description,
        deadline: dispatchForm.deadline,
        taskId: props.taskId,
        secondClass: dispatchForm.secondClass,
        firstClass: dispatchForm.firstClass,
        firstClassName: dispatchForm.firstClassName, 
        secondClassName: dispatchForm.secondClassName,
        ...thirdDePartments,
      },
      ...assistants,
    ];
  }
  // emit('changeSubmit')
  // console.log(params);
  if(props.warnForm.selectedCount > 0){
    dispatchBatch(params)
  }else{
    dispatchCase(params)
  }


  
};
const dispatchCase = (params : CaseModel)=>{
  emit("changeLoading", true);
  dispatchService
    .save(params,props.taskId)
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
}
const dispatchBatch = (params: CaseModel)=>{
  emit('showGroupVisit')
  params.warnId = props.warnForm.warnId
  params.flowModelList = props.warnForm.flowModelList
  dispatchService
    .saveBatch(params)
    .then((res) => {
      ElMessage({
        message: "批量提交" + (res.code == 200 ? '成功, 您可在当前页面等待处理结果' : '失败'),
        type: res.code == 200 ? "success" : "error",
      });
    })
    .catch(() => emit("done"));
}

const executeDepartCode = ({ val, id }: DepartmentCodeInfo) => {
  departmentCode.value = execute.value = val as string;
};
const assistantDepartCode = ({ val, id, nodes }: DepartmentCodeInfo) => {
  assistant.value = nodes as Array<DepartmentModel>;
  if(nodes?.filter(node=>node.departmentGroup === "7013").length>0){
    assDept.assDeptCode = String(nodes?.filter(node=>node.departmentGroup === "7013")[0].departmentCode)
    assDept.assDeptlevel = String(nodes?.filter(node=>node.departmentGroup === "7013")[0].departmentLevel)
    assDept.show = true
  }else{
    assDept.show = false
  }
};

const getCheckedValue = ({ labels, checkedValue, secondParams }: EmitProps) => {
  if(labels.length>0){
    const [firstClass, secondClass] = checkedValue;
    dispatchForm.firstClass = firstClass;
    dispatchForm.secondClass = secondClass;
    dispatchForm.firstClassName = labels[0];
    dispatchForm.secondClassName = labels[1];
    if (checkedValue[2]) {
      dispatchForm.thirdClass = checkedValue[2];
      dispatchForm.thirdClassName = labels[2];
    }
    if (checkedValue[3]) {
      dispatchForm.fourthClass = checkedValue[3];
      dispatchForm.fourthClassName = labels[2];
    }
  }else{
    dispatchForm.firstClass = '';
    dispatchForm.secondClass = '';
    dispatchForm.firstClassName = ''
    dispatchForm.secondClassName = ''
    dispatchForm.thirdClass = ''
    dispatchForm.thirdClassName = ''
    dispatchForm.fourthClass = ''
    dispatchForm.fourthClassName = ''
  }
};
const getCheckedValueAss = ({labels, checkedValue, secondParams }: EmitProps) => {
  if(labels.length>0){
    const [firstClass, secondClass] = checkedValue;
    assDept.firstClass = firstClass;
    assDept.secondClass = secondClass;
    assDept.firstClassName = labels[0]
    assDept.secondClassName = labels[1]
    if (checkedValue[2]) {
      assDept.thirdClass = checkedValue[2];
      assDept.thirdClassName = labels[2]
    }
    if (checkedValue[3]) {
      assDept.fourthClass = checkedValue[3];
      assDept.fourthClassName = labels[3]
    }
  }else{
    assDept.firstClass = '';
    assDept.secondClass = '';
    assDept.firstClassName = ''
    assDept.secondClassName = ''
    assDept.thirdClass = ''
    assDept.thirdClassName = ''
    assDept.fourthClass = ''
    assDept.fourthClassName = ''
  }
};
const getDispatchNote = ()=>{
  disposeService.getDispatchNote(props.taskId,currentDepartmentCode).then(res=>{
    res.code == 200 && (dispatchForm.description = res.data.dispatchNote)
  })
}
getDispatchNote()
watch(
  () => props.submit,
  (val) => {
    val &&
      returnApplyForm.value?.validate((valid: any) => {
        if (valid) {
          save();
        } else {
          emit("changeSubmit");
        }
      });
  }
);
const IdiomContent = (idContent: string) => {
  dispatchForm.description = idContent;
};

const getDealLine = async ()=>{
  const { getLimitTime } = useLimitTime();
  dispatchForm.deadline = timeLimit.value = await getLimitTime(props.taskId);
}
const changeDisposeTime = async (val:string)=>{
  if(val){
    const { firstParam, secondParam } = timeLimitTypes.value.find(
      (timeLimit) => timeLimit.codeValue === val
    )!;
    dispatchForm.deadline = (await getDealLineFn(props.taskId,firstParam, secondParam)) as any;
  }else{
    dispatchForm.deadline = timeLimit.value
  }
}

</script>
