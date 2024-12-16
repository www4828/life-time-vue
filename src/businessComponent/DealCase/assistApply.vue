<template>
  <div>
    <Title title="申请协办">
      <template #content>
        <el-form
          :model="caseSynergyDto"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="协办单位" prop="assistantDepartCode">
                <DepartTreeSelect
                  v-if="execute.length > 0"
                  ref="assDepartment"
                  :is-immediate="true"
                  is-multiple
                  :params="{
                    childNode: false,
                    currentNode: false,
                    optionList: [],
                    removeList: execute,
                  }"
                  @getDepartCode="assistantDepartCode"
                  :departmentCode="departmentCode"
                />
              </el-form-item>
            </el-col>
              <el-col :span="12" v-if="assDept.show">
                <el-form-item label="事项类别" prop="firstClass">
                  <ClassSelect
                    ref="classSelect"
                    :departmentCode="assDept.assDeptCode"
                    :departmentLevel="assDept.assDeptlevel"
                    @getCheckedValue="getCheckedValueAss"
                  />
                </el-form-item>
              </el-col>
            <el-col :span="6">
              <el-form-item label="申请原因" prop="reason">
                <el-select v-model="caseSynergyDto.reason" placeholder="请选择">
                  <el-option label="情况复杂" value="情况复杂"></el-option>
                  <el-option label="业务需要" value="业务需要"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="反馈期限" prop="deadline">
                <el-select
                  v-model="caseSynergyDto.deadline"
                  placeholder="请选择"
                  @change="changeTime"
                >
                  <el-option
                    v-for="item in timeLimitTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="截止时间">
                <span>{{ caseSynergyDto.endtime }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="意见说明" prop="content">
            <el-input
              @dblclick="showDialog"
              v-model="caseSynergyDto.content"
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
import { toRefs, reactive, ref, watch, nextTick } from "vue";
import { ElMessage, FormRules } from "element-plus";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import Title from "@/components/Title/Title.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import { useCode } from "@/hooks/useCode";
import { useIdiom } from "@/hooks/useIdiom";
import { getLimitTime } from "@/hooks/getLimitTime";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";

interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
}

const disposeService = new DisposeService();
const { timeLimitTypes } = useCode();
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
  }>(),
  {
    taskId: "",
  }
);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const emit = defineEmits(["changeLoading", "changeSubmit", "done"]);
const { departmentList } = Session.get("userInfo");

let assDept:any = reactive({
  show: false,
  assDeptCode:'',
  assDeptlevel:''
})
const departmentCode = ref("");
let execute = ref<string[]>([]);
const assistant = ref<string[]>([]);
const returnApplyForm = ref();
const caseSynergyDto = reactive({
  content: "", // 意见说明
  deadline: "", // 反馈期限
  departmentCode: "", // 协办单位
  endtime: "", // 截止时间
  reason: "", // 申请原因
  taskId: props.taskId,
  firstClass:'',
  secondClass: '',
  thirdClass: '',
  fourthClass: '',
  firstClassName: '',
  secondClassName: '',
  thirdClassName: '',
  fourthClassName: ''
});
const validatePass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (assistant.value.length === 0) {
      callback(new Error("协办单位不能为空!"));
    } else {
      callback();
    }
  });
};
const validateSecondClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!caseSynergyDto.firstClass) {
      callback(new Error("不能为空!"));
    } else {
      callback();
    }
  });
};
const dispatchRules = reactive<FormRules>({
  content: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  reason: [{ required: true, message: "申请原因不能为空", trigger: "blur" }],
  deadline: [{ required: true, message: "申请原因不能为空", trigger: "blur" }],
  firstClass: [{ required: true, message: "不能为空", trigger: "blur",validator: validateSecondClass, }],
  assistantDepartCode: [
    {
      required: true,
      message: "协办单位不能为空",
      trigger: "change",
      validator: validatePass,
    },
  ],
});
const getCheckedValueAss = ({labels, checkedValue, secondParams }: EmitProps) => {
  if(labels.length>0){
    const [firstClass, secondClass] = checkedValue;
    caseSynergyDto.firstClass = firstClass;
    caseSynergyDto.secondClass = secondClass;
    caseSynergyDto.firstClassName = labels[0]
    caseSynergyDto.secondClassName = labels[1]
    if (checkedValue[2]) {
      caseSynergyDto.thirdClass = checkedValue[2];
      caseSynergyDto.thirdClassName = labels[2]
    }
    if (checkedValue[3]) {
      caseSynergyDto.fourthClass = checkedValue[3];
      caseSynergyDto.fourthClassName = labels[3]
    }
  }else{
    caseSynergyDto.firstClass = '';
    caseSynergyDto.firstClassName = ''
    caseSynergyDto.secondClass = '';
    caseSynergyDto.secondClassName = ''
    caseSynergyDto.thirdClass = '';
    caseSynergyDto.thirdClassName = ''
    caseSynergyDto.fourthClass = '';
    caseSynergyDto.fourthClassName = ''
  }
};
const save = () => {
  // 申请协办
  const { departmentList } = Session.get("userInfo");
  let params: any = {
    attachmentInfos: cloneDeep(props.attachments),
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    departmentVo: cloneDeep(departmentList[0]),
    caseSynergyDto: cloneDeep(caseSynergyDto),
  };
  // emit('changeSubmit')
  // console.log(params);
  emit("changeLoading", true);
  disposeService
    .postCaseSynergy(params)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? "success" : "error",
        message: res.message + "，即将返回列表页",
      });
      emit("done");
    })
    .catch(() => emit("done"));
};

const assistantDepartCode = ({ val, id, nodes }: any) => {
  assistant.value = val as string[];
  caseSynergyDto.departmentCode = assistant.value?.join(",");
  if(nodes?.filter((node:any)=>node.departmentGroup === "7013").length>0){
    assDept.assDeptCode = String(nodes?.filter((node:any)=>node.departmentGroup === "7013")[0].departmentCode)
    assDept.assDeptlevel = String(nodes?.filter((node:any)=>node.departmentGroup === "7013")[0].departmentLevel)
    assDept.show = true
  }else{
    assDept.show = false
    caseSynergyDto.firstClass = '';
    caseSynergyDto.firstClassName = ''
    caseSynergyDto.secondClass = '';
    caseSynergyDto.secondClassName = ''
    caseSynergyDto.thirdClass = '';
    caseSynergyDto.thirdClassName = ''
    caseSynergyDto.fourthClass = '';
    caseSynergyDto.fourthClassName = ''
    // emit('changeSubmit')
  }
};

const changeTime = async (val: string) => {
  const { firstParam, secondParam } = timeLimitTypes.value.find(
    (timeLimit) => timeLimit.codeValue === val
  )!;
  caseSynergyDto.endtime = (await getLimitTime(firstParam, secondParam)) as any;
};
const getSynergyDepartment = () => {
  disposeService
    .getSynergyDepartment(props.taskId)
    .then((res) => {
      execute.value = res.data
        ? [...res.data?.split(","), departmentList[0].departmentCode]
        : [departmentList[0].departmentCode];
    })
    .catch(() => (execute.value = departmentList[0].departmentCode));
};

const init = () => {
  departmentCode.value = departmentList[0].departmentParentCode;
  getSynergyDepartment();
};
init();
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
  caseSynergyDto.content = idContent;
};
</script>
