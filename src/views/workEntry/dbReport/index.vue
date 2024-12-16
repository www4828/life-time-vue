<template>
  <WorkLayout
    class="index"
    node-name="工单录入"
    v-loading="reportLoading"
    element-loading-text="正在提交数据请稍后!"
  >
    <template #baseInfo>
      <BaseCaseForm
        ref="baseCaseForm"
        :is-detail="false"
        @isShowPersonalForm="isShowPersonalForm"
        @saveVoiceFile="saveVoiceFile"
      ></BaseCaseForm>
      <FileAttachments nodeCode="C001" ref="fileAttachments" />
    </template>
    <template #history>
      <HistoryCase :phone="(route.query.phone as string) || ''" task-id="" />
    </template>
    <template #actions>
      <div class="dispatchWrapper">
        <PersonalizedForm
          :reflectCode="`${formData.firstClass},${formData.secondClass}`"
          @showForm="(val) => (showPerFormFlag = val)"
          ref="personalizedFormRef"
        />
        <DBForm ref="dbForm" is-default-show />
        <Title title="工单派遣" />
        <el-form
          :model="formData"
          ref="dispatchForm"
          label-width="110px"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="承办单位" prop="executeDepartCode">
                <DepartTreeSelect
                  is-immediate
                  :is-multiple="false"
                  :defaultList="defaultList"
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
              <el-form-item label="事项类别" prop="firstClass">
                <ClassSelect
                  ref="classSelect"
                  :departmentCode="departmentCode"
                  :departmentLevel="currentDepartmentLevel"
                  @getCheckedValue="getCheckedValue"
                  :showValue="defaultValue"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="反馈期限" prop="disposeTime">
                <el-select
                  v-model="formData.disposeTime"
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
              <el-form-item label="截止时间" prop="deadline">
                <el-date-picker
                  v-model="formData.deadline"
                  type="datetime"
                  :editable="false"
                  format="YYYY-MM-DD HH:mm"
                  :disabled-date="disabledDate"
                  value-format="YYYY-MM-DD HH:mm"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="协办单位">
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
        <!-- <RelatedQueryDialog
          :show-flag="relatedControl.flag"
          @closeDialog="relatedControl.flag = false"
        /> -->
      </div>
    </template>
    <template #buttons>
      <el-button
        type="primary"
        @click="personalizedFormRef.setDialogVisible(true)"
        :disabled="reportLoading"
        v-if="showPerFormFlag"
        >个性化表单</el-button
      >
      <el-button type="primary" @click="save" :disabled="reportLoading">确定</el-button>
    </template>
  </WorkLayout>
</template>
<script lang="ts" setup>
import {
  CaseModel,
  DispatchFormModel,
  DepartmentModel,
  CaseFormModel,
} from "@/api/model/caseModel";
import { debounce } from "lodash-es";
import { useRoute } from "vue-router";
import { useCode } from "@/hooks/useCode";
import DBForm from "./components/dbForm.vue";
import type { FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { useLimitTime } from "@/hooks/useLimitTime";
import { getLimitTime } from "@/hooks/getLimitTime";
import { useDepartment } from "@/hooks/useDepartment";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import { SupervisionModel } from "@/api/model/supervisionModel";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { ref, reactive, getCurrentInstance, nextTick, onUnmounted } from "vue";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { FileAttachmentModel } from "@/api/model/fileAttachmentModel";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import BaseCaseForm from "@/businessComponent/BaseCaseForm/BaseCaseForm.vue";
import PersonalizedForm from "@/businessComponent/PersonalizedForm/index.vue";
import { RelatedInfo } from "@/views/workEntry/dbReport/components/dbForm.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";

interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
  nodes: Array<DepartmentModel>;
}
const dbForm = ref();
const route = useRoute();
const baseCaseForm = ref();
const classSelect = ref();
const personalizedFormRef = ref();
const { timeLimitTypes } = useCode();
const defaultValue = ref<string[]>([]);
const defaultList = ref("");
const showPerFormFlag = ref(false); // 个性化表单按钮
const { disabledDate, timeLimit } = useLimitTime(true);
const { departmentList, currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const departmentCode = ref(currentDepartmentCode);
const reportLoading = ref(false);
const personalForm = ref(false);
const fileAttachments = ref();
const form = reactive<CaseModel>({
  caseInfo: {} as CaseFormModel,
  specialFlags: [],
  dispatchInfos: [],
  attachmentInfos: [],
  isAuto: "",
  department: departmentList[0] as DepartmentModel,
  supervision: {} as SupervisionModel,
});
const classInfo = reactive({
  firstClass: "",
  secondClass: "",
});
const dispatchForm = ref<InstanceType<typeof ElForm>>();
const executeDepartment = ref();
const assDepartment = ref();
const relatedControl = reactive({
  flag: false,
});
const formData = reactive<DispatchFormModel>({
  type: "",
  taskId: "",
  disposeTime: "16",
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
const voiceFile = ref<FileAttachmentModel[]>([]);
const specialTips = ref<string[]>([]);
const caseService = new CaseService();
const execute = ref("");
const assistant = ref<Array<DepartmentModel>>([]);

const validateSecondClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!assDept.firstClass) {
      callback(new Error("不能为空!"));
    } else {
      callback();
    }
  });
};
const validateFirstClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!formData.firstClass && rule.required) {
      callback(new Error("不能为空!"));
    } else {
      callback();
    }
  });
};
const validateMainDepartment = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (execute.value === "") {
      callback(new Error("承办单位不能为空"));
    } else {
      callback();
    }
  });
};
const dispatchRules = reactive<FormRules>({
  description: [{ required: false, message: "派遣描述不能为空", trigger: "blur" }],
  firstClass: [
    {
      required: false,
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
});

const { proxy } = <any>getCurrentInstance();
const saveVoiceFile = (file: FileAttachmentModel) => {
  voiceFile.value = [file];
};
onUnmounted(() => {
  proxy.mittBus.off("getRelatedInfo");
});
proxy.mittBus.on("getRelatedInfo", (relateInfo: RelatedInfo) => {
  if(relateInfo.relationField === 'relationTaskIdFirst'){
    classInfo.firstClass = relateInfo.caseInfo.reflectIndustryCode as string;
    classInfo.secondClass = relateInfo.caseInfo.reflectClassCode as string;
    defaultList.value = relateInfo.caseInfo.executeDepartment;
    // formData.description = `当前督办单关联的历史工单有：${relateInfo.taskIds.join(
    //   "、"
    // )}。请及时跟进处理。`;
  }
  if(formData.description.indexOf('。') > -1){
    formData.description = formData.description.split('。')[0] + '、' + relateInfo.taskIds.join("、") + '。请及时跟进处理。'
  }else{
    formData.description = `当前督办单关联的历史工单有：${relateInfo.taskIds.join(
    "、"
    )}。请及时跟进处理。`;
  }
});
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
const clear = () => {
  dispatchForm.value!.resetFields();
  baseCaseForm.value.clearForm();
  fileAttachments.value.clearFiles();
  form.attachmentInfos = [];
  form.department = departmentList[0];
  form.dispatchInfos = [];
  form.isAuto = "";
  form.specialFlags = [];
  formData.type = "";
  formData.taskId = "";
  formData.disposeTime = "16";
  formData.disposeDepartmentCode = "";
  formData.dispatchDepartmentCode = currentDepartmentCode;
  formData.description = "";
  formData.deadline = "";
  formData.firstClass = "";
  formData.secondClass = "";
  formData.thirdClass = undefined;
  formData.fourthClass = undefined;
  formData.firstClassName = "";
  formData.secondClassName = "";
  formData.thirdClassName = undefined;
  formData.fourthClassName = undefined;
  execute.value = "";
  assistant.value = [];
  specialTips.value = [];
  dispatchRules.description = [
    { required: false, message: "派遣描述不能为空", trigger: "blur" },
  ];
  dispatchRules.deadline = [
    { required: false, message: "截止时间不能为空", trigger: "change" },
  ];
  dispatchRules.firstClass = [
    {
      required: false,
      message: "事项类别不能为空",
      trigger: "change",
      validator: validateFirstClass,
    },
  ];
  executeDepartment.value!.resetValue();
  assDepartment.value!.resetValue();
  classSelect.value!.resetValue();
  dbForm.value.clearForm();
  showPerFormFlag.value = false;
  assDept.show = false;
};
const saveForm = () => {
  reportLoading.value = true;
  caseService
    .save(form)
    .then((res) => {
      if (showPerFormFlag.value && res.code == 200) {
        proxy.mittBus.emit("submitForm", res.data.split("[")[1].split("]")[0]);
      }
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
    })
    .finally(() => {
      reportLoading.value = false;
      clear();
    });
};
const codes = ["5", "4"];
const save = debounce(() => {
  baseCaseForm.value.checkForm().then((status: boolean) => {
    if (status) {
      checkForm().then((status2) => {
        if (status2) {
          dbForm.value.checkForm().then((status3: boolean) => {
            if (status3) {
              form.specialFlags = baseCaseForm.value.getSpecialTips();
              form.supervision = dbForm.value.getFormData();
              form.caseInfo = {
                ...baseCaseForm.value.getFormData(),
                reflectIndustryCode: formData.firstClass,
                reflectClassCode: formData.secondClass,
                reflectContentCode: formData.thirdClass,
              };
              form.attachmentInfos = fileAttachments.value
                .getFiles()
                .concat(voiceFile.value);
              if (execute.value === "") {
                // 承办单位为空
                form.dispatchInfos = [];
              } else if (assistant.value.length === 0 && execute.value !== "") {
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

              if (codes.includes(form.caseInfo.businessType)) {
                // 是咨询 建议类需要提示用户是否自动销单
                ElMessageBox.confirm("当前工单是否自动销单?", "提示", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "info",
                })
                  .then(() => {
                    form.isAuto = "1";
                    saveForm();
                  })
                  .catch(() => {
                    saveForm();
                  });
              } else {
                saveForm();
              }
            }
          });
        }
      });
    }
  });
}, 500);

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
    assDept.thirdClass = undefined;
    assDept.fourthClass = undefined;
    assDept.firstClassName = "";
    assDept.secondClassName = "";
    assDept.thirdClassName = undefined;
    assDept.fourthClassName = undefined;
  }
};
const isShowPersonalForm = (control: boolean) => {
  personalForm.value = control;
};
const executeDepartCode = ({ val, id }: DepartmentCodeInfo) => {
  departmentCode.value = execute.value = val as string;
  formData.firstClass = formData.secondClass = "";
  classSelect.value!.resetValue();
  /* dispatchRules.description = [
    { required: true, message: "派遣描述不能为空", trigger: "blur" },
  ];
  dispatchRules.firstClass = [
    {
      required: true,
      message: "事项类别不能为空",
      trigger: "change",
      validator: validateFirstClass,
    },
  ];
  dispatchRules.deadline = [
    { required: true, message: "截止时间不能为空", trigger: "change" },
  ]; */
  nextTick(() => {
    if (classInfo.firstClass !== "" && classInfo.secondClass !== "") {
      formData.firstClass = classInfo.firstClass;
      formData.secondClass = classInfo.secondClass;
      defaultValue.value = [formData.firstClass, formData.secondClass];
    }
  });
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

const changeTime = async (code: string) => {
  const { firstParam, secondParam } = timeLimitTypes.value.find(
    (timeLimit) => timeLimit.codeValue === code
  )!;
  formData.deadline = await getLimitTime(firstParam, secondParam);
};
changeTime("16");
</script>

<style lang="scss" scoped>
.from {
  height: 100%;
  ::v-deep(.el-select) {
    width: 100%;
  }

  .processWrapper {
    padding: 10px;
  }
}
::v-deep(.el-cascader) {
  width: 100%;
}

.dispatchWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  .formWrapper {
    flex: 1;
  }
}
.personalForm {
  margin-bottom: 10px;
}
</style>
