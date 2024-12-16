<template>
  <WorkLayout
    class="index"
    :node-name="props.listPrams!.name"
    v-loading="reportLoading"
    element-loading-text="正在提交数据请稍后!"
  >
    <template #baseInfo>
      <BaseCaseForm
        ref="baseCaseForm"
        @getValue="getValue"
        is-detail
        :task-id="props.listPrams?.taskId!"
      />
      <DBForm :task-id="props.listPrams?.taskId!" />
      <FileAttachments
        :nodeCode="props.listPrams?.code"
        :task-id="props.listPrams?.taskId"
        ref="fileAttachments"
      />
    </template>
    <template #history>
      <HistoryCase
        :phone="screeningForm.lineForm.reportPhone"
        :task-id="props.listPrams?.taskId!"
      />
    </template>
    <template #process>
      <Process :taskId="props.listPrams?.taskId!" />
    </template>
    <template #actions>
      <div class="dispatchWrapper" v-show="isDispatch">
        <div class="formWrapper">
          <el-form
            :model="formData"
            class="from"
            ref="dispatchForm"
            label-width="120px"
            :rules="dispatchRules"
          >
            <Title title="工单甄别" v-show="isShow" />
            <el-row v-show="isShow">
              <el-col :span="6">
                <el-form-item label="甄别状态">
                  <el-input v-model="screeningForm.resultForm.result" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="甄别方式">
                  <el-input v-model="screeningForm.resultForm.typeName" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="甄别时间">
                  <el-input v-model="screeningForm.resultForm.time" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="未联原因">
                  <el-input v-model="screeningForm.resultForm.reasonName" disabled />
                </el-form-item>
              </el-col>
            </el-row>
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
        </div>
      </div>
      <div class="dispatchWrapper" v-show="!isDispatch">
        <Title title="申请退单">
          <template #content>
            <el-form
              :model="returnForm"
              class="from"
              ref="returnApplyForm"
              :rules="returnFormRules"
            >
              <el-row>
                <el-col :span="6">
                  <el-form-item label="退单原因" prop="caseBackApplyDto.chargeReason">
                    <el-select
                      v-model="returnForm.caseBackApplyDto.chargeReason"
                      placeholder="请选择"
                    >
                      <el-option
                        v-for="item in returnApplyTypes"
                        :label="item.codeName"
                        :value="item.codeValue"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="退单责任人" prop="caseBackApplyDto.chargePerson">
                    <el-input
                      v-model="returnForm.caseBackApplyDto.chargePerson"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="申请时间">
                    <span>{{ returnForm.caseBackApplyDto.applyTime }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="退单申请人">
                    <span>{{ returnForm.caseBackApplyDto.applyPerson }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="意见说明" prop="caseBackApplyDto.description">
                <el-input
                  v-model="returnForm.caseBackApplyDto.description"
                  autofocus
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  type="textarea"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </template>
        </Title>
      </div>
      <ContactDialog
        v-if="screeningForm.dialogVisible"
        :dialogVisible="screeningForm.dialogVisible"
        :formType="screeningForm.formType!"
        :nodeCode="screeningForm.nodeCode"
        :task-id="props.listPrams?.taskId"
        :line-form="screeningForm.lineForm"
        @close="screeningForm.dialogVisible = false"
        @save="saveVoice"
      />
      <el-dialog
        v-model="dialogControl"
        custom-class="dialog"
        title="附件确认信息"
        width="70%"
        destroy-on-close
      >
        <FileAttachments
          is-choice
          :is-show="false"
          ref="fileRef"
          :default-value="returnForm.attachmentInfos"
          :task-id="props.listPrams?.taskId"
        />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogControl = false">取消</el-button>
            <el-button type="primary" @click="confirm">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
    <template #buttons>
      <div class="buttons">
        <el-button
          type="primary"
          v-if="isDispatch"
          @click="openComponent2"
          >甄别</el-button
          >
          <!-- @click="screeningForm.dialogVisible = true" -->
        <el-button v-for="button in buttons" type="primary" v-on:click="button.fn!()">{{
          button.name
        }}</el-button>
        <el-button type="info" @click="back">返回</el-button>
      </div>
    </template>
  </WorkLayout>
</template>
<script lang="ts" setup>
import dayjs from "dayjs";
import { useCode } from "@/hooks/useCode";
import { useLock } from "@/hooks/useLock";
import type { FormRules } from "element-plus";
import { debounce, cloneDeep } from "lodash-es";
import Title from "@/components/Title/Title.vue";
import { useNodeCode } from "@/hooks/useNodeCode";
import { useLimitTime } from "@/hooks/useLimitTime";
import { useDepartment } from "@/hooks/useDepartment";
import { ref, reactive, nextTick, computed, h } from "vue";
import { CaseBackApplyModel } from "@/api/model/returnModel";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import Process from "@/businessComponent/Process/Process.vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import ContactDialog from "@/businessComponent/ContactDialog/index-v2.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { DispatchService } from "@/api/service/WorkTicket/DispatchService";
import BaseCaseForm from "@/businessComponent/BaseCaseForm/BaseCaseForm.vue";
import { ReturnApplyService } from "@/api/service/ReturnApply/ReturnApplyService";
import { FileAttachmentModel, NodeCodeKey } from "@/api/model/fileAttachmentModel";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import { layer } from "@layui/layer-vue"
import {
  CaseModel,
  DispatchFormModel,
  CaseFormModel,
  DepartmentModel,
} from "@/api/model/caseModel";

interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
  nodes: Array<DepartmentModel>;
}
interface ListPrams {
  id: string;
  taskId: string;
  processId: string;
  code: NodeCodeKey;
  name: string;
  formPath: string;
}
type FormType = "先联" | "甄别";
const props = defineProps<{
  listPrams?: ListPrams;
  buttons: ButtonInfoModel[];
}>();
const emit = defineEmits(["back", "dispatch"]);
const {
  currentDepartmentLevel,
  currentDepartmentCode,
  departmentList,
  name,
} = useDepartment();
const { returnApplyTypes } = useCode();
const dispatchService = new DispatchService();
const disposeService = new DisposeService();
const returnApplyService = new ReturnApplyService();
const classSelect = ref();
const baseCaseForm = ref();
const departTreeSelectRef = ref();
const reportLoading = ref(false);
const isShow = ref(true);
const execute = ref("");
const dialogControl = ref(false);
const fileRef = ref();
const filterDeptCode = ref<string[]>([]);
const assistant = ref<Array<DepartmentModel>>([]);
const dispatchForm = ref<InstanceType<typeof ElForm>>();
const returnApplyForm = ref<InstanceType<typeof ElForm>>();
const { nodeCode } = useNodeCode();
const departmentCode = ref(currentDepartmentCode);
const { timeLimit, disabledDate } = useLimitTime();
const { unlockCase } = useLock();
const fileAttachments = ref();
const sourceCode = ref("");
const screeningForm = reactive({
  dialogVisible: false,
  formType: "甄别" as FormType,
  nodeCode: "C101-1",
  taskId: props.listPrams?.taskId,
  lineForm: {
    contactPhone: "",
    reportPhone: "",
    reportPerson: "",
  },
  resultForm: {
    result: "",
    type: "",
    typeName: "",
    time: "",
    reason: "",
    reasonName: "",
  },
});
const isDispatch = computed(() => {
  return props.listPrams?.formPath === "dispatch";
});
let assDept: any = reactive({
  show: false,
  assDeptCode: "",
  assDeptlevel: "",
  firstClass: "",
  secondClass: "",
  thirdClass: undefined,
  fourthClass: undefined,
  firstClassName: "",
  secondClassName: "",
  thirdClassName: undefined,
  fourthClassName: undefined,
});
const returnFormRules = reactive<FormRules>({
  "caseBackApplyDto.description": [
    { required: true, message: "意见说明不能为空", trigger: "change" },
  ],
  "caseBackApplyDto.chargeReason": [
    { required: true, message: "退单原因不能为空", trigger: "blur" },
  ],
  "caseBackApplyDto.chargePerson": [
    { required: true, message: "退单责任人不能为空", trigger: "blur" },
  ],
});
const returnForm = reactive<CaseBackApplyModel>({
  caseInfo: {} as CaseFormModel,
  attachmentInfos: [],
  departmentVo: departmentList[0] as DepartmentModel,
  flowModel: {
    lineId: "",
    processId: "",
    code: "",
  },
  caseBackApplyDto: {
    applyPerson: name,
    applyTime: dayjs().format("YYYY-MM-DD HH:mm"),
    chargeReason: "",
    chargePerson: "",
    description: "",
    nodeCode,
  },
});
const form = reactive<CaseModel>({
  caseInfo: {} as CaseFormModel,
  specialFlags: [],
  dispatchInfos: [],
  attachmentInfos: [],
  isAuto: "",
  department: departmentList[0] as DepartmentModel,
  flowModel: {
    lineId: "",
    processId: "",
    code: "",
  },
});
const formData = reactive<DispatchFormModel>({
  type: "",
  taskId: props.listPrams?.taskId,
  disposeTime: "10",
  disposeDepartmentCode: "",
  dispatchDepartmentCode: currentDepartmentCode,
  description: "",
  deadline: "",
  firstClass: "",
  secondClass: "",
  fourthClass: undefined,
  thirdClass: undefined,
  firstClassName: "",
  secondClassName: "",
  thirdClassName: undefined,
  fourthClassName: undefined,
});

const id = ref();
const openComponent2 = () => {
  if(id.value){
    layer.open({
      title: screeningForm.formType,
      id: id.value,
      maxmin: true,
      shade: false,
      anim:'6',
      closeBtn: false,
      content: h(ContactDialog, { 
        taskId: props.listPrams?.taskId,
        lineForm: screeningForm.lineForm,
        nodeCode: screeningForm.nodeCode,
        formType:"先联", 
        onClose(){
          layer && layer.close(id.value)
          id.value = ''
        }, 
        onSave(res:any) {
          saveVoice(res)
        }
      }),
      close:()=>{
        id.value = ''
      }
    })
  }else{
    id.value = layer.open({
      title: screeningForm.formType,
      maxmin: true,
      shade: false,
      closeBtn: false,
      content: h(ContactDialog, { 
        taskId: props.listPrams?.taskId,
        lineForm: screeningForm.lineForm,
        nodeCode: screeningForm.nodeCode,
        formType: screeningForm.formType, 
        onClose(){
          layer && layer.close(id.value)
          id.value = ''
        }, 
        onSave(res:any) {
          saveVoice(res)
        }
      }),
      close:()=>{
        id.value = null
      }
    })
  }
}

const validatePass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (execute.value === "") {
      callback(new Error("承办单位不能为空!"));
    } else {
      callback();
    }
  });
};
const validateFirstClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!formData.firstClass) {
      callback(new Error("事项类别不能为空"));
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
const dispatchRules = reactive<FormRules>({
  executeDepartCode: [
    {
      required: true,
      message: "承办单位不能为空",
      trigger: "change",
      validator: validatePass,
    },
  ],
  description: [{ required: true, message: "派遣描述不能为空", trigger: "blur" }],
  firstClass: [
    {
      required: true,
      message: "事项类别不能为空",
      trigger: "change",
      validator: validateFirstClass,
    },
  ],
  secondClass: [
    {
      required: true,
      message: "不能为空",
      trigger: "change",
      validator: validateSecondClass,
    },
  ],
  deadline: [{ required: true, message: "截止时间不能为空", trigger: "change" }],
});
const executeDepartCode = ({ val, id }: DepartmentCodeInfo) => {
  departmentCode.value = execute.value = val as string;
};
const assistantDepartCode = ({ val, id, nodes }: DepartmentCodeInfo) => {
  assistant.value = nodes as Array<DepartmentModel>;
  if (nodes?.filter((node) => node.departmentGroup === "7013").length > 0) {
    assDept.assDeptCode = String(
      nodes?.filter((node) => node.departmentGroup === "7013")[0].departmentCode
    );
    assDept.assDeptlevel = String(
      nodes?.filter((node) => node.departmentGroup === "7013")[0].departmentLevel
    );
    assDept.show = true;
  } else {
    assDept.show = false;
  }
};
const getValue = async (result: string[]) => {
  const [
    firstClass,
    secondClass,
    reportPhone,
    contactPhone,
    reportPerson,
    eventSourceCode,
    acceptDepartment,
    taskId,
    firstClassName,
    secondClassName,
  ] = result;

  formData.firstClass = firstClass;
  formData.firstClassName = firstClassName;
  formData.secondClass = secondClass;
  formData.secondClassName = secondClassName;
  screeningForm.lineForm.contactPhone = contactPhone;
  screeningForm.lineForm.reportPhone = reportPhone;
  screeningForm.lineForm.reportPerson = reportPerson;
  // screeningForm.taskId = taskId;
  if (eventSourceCode === "1") {
    sourceCode.value = eventSourceCode;
  }
  if (acceptDepartment !== "") {
    filterDeptCode.value = [acceptDepartment];
  } else {
    departTreeSelectRef.value.getDepartmentInfo();
  }
  const { getLimitTime } = useLimitTime();
  formData.deadline = timeLimit.value = await getLimitTime(taskId);
};
const getCheckedValueAss = ({ labels, checkedValue, secondParams }: EmitProps) => {
  if (labels.length > 0) {
    const [firstClass, secondClass] = checkedValue;
    assDept.firstClass = firstClass;
    assDept.secondClass = secondClass;
    assDept.firstClassName = labels[0];
    assDept.secondClassName = labels[1];
    if (checkedValue[2]) {
      assDept.thirdClass = checkedValue[2];
      assDept.thirdClassName = labels[2];
    }
    if (checkedValue[3]) {
      assDept.fourthClass = checkedValue[3];
      assDept.fourthClassName = labels[3];
    }
  } else {
    assDept.firstClass = "";
    assDept.secondClass = "";
    assDept.firstClassName = "";
    assDept.secondClassName = "";
    assDept.thirdClass = "";
    assDept.thirdClassName = "";
    assDept.fourthClass = "";
    assDept.fourthClassName = "";
  }
};
const getCheckedValue = ({ labels, checkedValue, secondParams }: EmitProps) => {
  if (labels.length > 0) {
    const [firstClass, secondClass] = checkedValue;
    formData.firstClass = firstClass;
    formData.secondClass = secondClass;
    formData.firstClassName = labels[0];
    formData.secondClassName = labels[1];
    if (checkedValue[2]) {
      formData.thirdClass = checkedValue[2];
      formData.thirdClassName = labels[2];
    }
    if (checkedValue[3]) {
      formData.fourthClass = checkedValue[3];
      formData.fourthClassName = labels[3];
    }
  } else {
    formData.firstClass = "";
    formData.secondClass = "";
    formData.firstClassName = "";
    formData.secondClassName = "";
    formData.thirdClass = "";
    formData.thirdClassName = "";
    formData.fourthClass = "";
    formData.fourthClassName = "";
  }
};
const getTableData = () => {
  disposeService
    .list({
      pageParams: { pageSize: -1, pageIndex: 0 },
      searchParams: [
        {
          key: "taskId",
          value: props.listPrams?.taskId,
          match: "eq",
        },
      ],
    })
    .then((res) => {
      if (res.data?.results.length > 0) {
        Object.keys(screeningForm.resultForm).forEach((key) => {
          screeningForm.resultForm[key as keyof typeof screeningForm.resultForm] =
            res.data?.results[res.data?.results.length - 1][key];
        });
        screeningForm.resultForm.result = res.data?.results.some(
          (i: any) => i.result === "1"
        )
          ? `已联(${res.data.results.length})`
          : "未联";
      } else {
        isShow.value = false;
      }
    });
};
getTableData();
const saveVoice = (file: FileAttachmentModel) => {
  fileAttachments.value.pushFile(file);
};
const back = () => {
  unlockCase(props.listPrams?.taskId!).then((status) => {
    if (status) {
      emit("back");
    } else {
      ElMessage.error("解锁失败！");
    }
  });
};
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    dispatchForm.value!.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const checkForm2 = (): Promise<boolean> => {
  return new Promise((resolve) => {
    returnApplyForm.value!.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const returnBackToSenior = () => {
  dialogControl.value = false;
  reportLoading.value = true;
  returnForm.flowModel.code = props.listPrams?.code!;
  returnForm.flowModel.lineId = props.listPrams?.id!;
  returnForm.flowModel.processId = props.listPrams?.processId!;
  returnApplyService
    .returnCaseApply(returnForm)

    .then((res) => {
      ElMessage({
        message: res.data,
        type: res.code == 200 ? "success" : "error",
      });
    })
    .finally(() => {
      reportLoading.value = false;
      back();
    });
};
const returnCase = debounce(() => {
  checkForm2().then((status) => {
    if (status) {
      returnForm.caseInfo = baseCaseForm.value.getCaseInfo();
      returnForm.attachmentInfos = fileAttachments.value.getFiles();
      if (returnForm.attachmentInfos.length >= 3) {
        // 大于三张附件的时候申请退市级
        dialogControl.value = true;
      } else {
        returnBackToSenior();
      }
    }
  });
}, 500);
const confirm = () => {
  returnForm.attachmentInfos = fileRef.value.getChoiceFiles();
  const files = cloneDeep(returnForm.attachmentInfos).filter(
    ({ status }) => status === "2"
  );
  if (files.length < 3) {
    ElMessage({
      message: "请选择三张附件",
      type: "error",
    });
    return;
  }
  returnBackToSenior();
};
const dispatch = () => {
  reportLoading.value = true;
  dispatchService
    .save(form, props.buttons[0].taskId)
    .then((res) => {
      ElMessage({
        message: res.data,
        type: res.code == 200 ? "success" : "error",
      });
    })
    .finally(() => {
      reportLoading.value = false;
      back();
    });
};
const save = debounce(() => {
  baseCaseForm.value.checkForm().then((status: boolean) => {
    if (status) {
      checkForm().then((status2) => {
        if (status2) {
          form.specialFlags = baseCaseForm.value.getSpecialTips();
          form.caseInfo = {
            ...baseCaseForm.value.getFormData(),
            reflectIndustryCode: formData.firstClass,
            reflectClassCode: formData.secondClass,
            reflectContentCode: formData.thirdClass,
          };
          form.flowModel!.code = props.listPrams?.code!;
          form.flowModel!.lineId = props.listPrams?.id!;
          form.flowModel!.processId = props.listPrams?.processId!;
          form.attachmentInfos = fileAttachments.value.getFiles();
          if (assistant.value.length === 0 && execute.value !== "") {
            // 没选择协办但是承办单位不为空
            formData.type = "1";
            formData.disposeDepartmentCode = execute.value;
            form.dispatchInfos[0] = formData;
          } else {
            //选择了承办部门并且也选择了协办部门
            const thirdDePartments = {
              thirdClass: formData.thirdClass,
              fourthClass: formData.fourthClass,
              thirdClassName: formData.thirdClassName,
              fourthClassName: formData.fourthClassName,
            };
            const assistants: DispatchFormModel[] = [];
            assistant.value!.forEach((ass) => {
              assistants.push({
                type: "0",
                taskId: props.listPrams?.taskId,
                disposeTime: formData.disposeTime,
                disposeDepartmentCode: ass.departmentCode,
                dispatchDepartmentCode: currentDepartmentCode,
                description: formData.description,
                deadline: formData.deadline,
                firstClass:
                  ass.departmentGroup === "7013"
                    ? assDept.firstClass
                    : formData.firstClass,
                secondClass:
                  ass.departmentGroup === "7013"
                    ? assDept.secondClass
                    : formData.secondClass,
                thirdClass:
                  ass.departmentGroup === "7013"
                    ? assDept.thirdClass
                    : formData.thirdClass,
                fourthClass:
                  ass.departmentGroup === "7013"
                    ? assDept.fourthClass
                    : formData.fourthClass,
                firstClassName:
                  ass.departmentGroup === "7013"
                    ? assDept.firstClassName
                    : formData.firstClassName,
                secondClassName:
                  ass.departmentGroup === "7013"
                    ? assDept.secondClassName
                    : formData.secondClassName,
                thirdClassName:
                  ass.departmentGroup === "7013"
                    ? assDept.thirdClassName
                    : formData.thirdClassName,
                fourthClassName:
                  ass.departmentGroup === "7013"
                    ? assDept.fourthClassName
                    : formData.thirdClassName,
              });
            });
            form.dispatchInfos = [
              {
                type: "1",
                taskId: props.listPrams?.taskId,
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
            ];
          }
          // 核验派遣时，如果是派给 78号安质监总站的、并且反映区名为 浦东 和奉贤的，
          // 系统提示一下：请确认反映区名是否正确？是继续派遣，否可以修改反映区名。依此来提醒派遣员，针对临港的修改和定位，现在容易忘掉。
          const { district } = baseCaseForm.value.getFormData();
          if (execute.value === "78" && (district === "20" || district === "30")) {
            ElMessageBox.confirm("请确认反映区名是否正确？", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
            }).then(() => {
              dispatch();
            });
          } else {
            dispatch();
          }
        }
      });
    }
  });
}, 500);
const confirmButtonMap = {
  dispatch: save,
  back: returnCase,
};
const emitFn = (fromPath: string) => {
  fileAttachments.value.clearNotIDsFile();
  emit("dispatch", fromPath);
};
const buttons = computed(() => {
  const propsButtons = cloneDeep(props.buttons);
  propsButtons.forEach((button) => {
    if (props.listPrams!.name === button.name) {
      button.name = "确定";
      button.fn = confirmButtonMap[button.formPath! as "dispatch" | "back"];
      if (button.formPath === "back") {
        returnForm.flowModel.code = button.code!;
        returnForm.flowModel.lineId = button.id!;
        returnForm.flowModel.processId = button.processId!;
      } else {
        form.flowModel!.code = button.code!;
        form.flowModel!.lineId = button.id!;
        form.flowModel!.processId = button.processId!;
      }
      button.sort = 2;
    } else {
      button.fn = emitFn.bind(null, button.formPath!);
      button.sort = 1;
    }
  });
  propsButtons.sort((a, b) => Number(a.sort) - Number(b.sort));
  return propsButtons;
});
const getDispatchNote = () => {
  disposeService
    .getDispatchNote(props.buttons[0].taskId, currentDepartmentCode)
    .then((res) => {
      res.code == 200 && (formData.description = res.data.dispatchNote);
    });
};
getDispatchNote();
</script>

<style lang="scss" scoped>
.from {
  position: relative;
  height: 100%;
  ::v-deep(.el-select) {
    width: 100%;
  }
  .processWrapper {
    padding: 10px;
  }
  .caseMarks {
    position: absolute;
    z-index: 2;
    top: -45px;
    left: 50%;
    transform: translateX(-50%);
  }
}
.dispatchWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  .formWrapper {
    flex: 1;
  }
  .buttons {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
    margin-right: 10px;
  }
}
</style>
