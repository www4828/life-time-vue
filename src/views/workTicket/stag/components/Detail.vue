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
        @sourceChange="sourceChange"
      />
      <DBForm :task-id="props.listPrams?.taskId!" ref="dbFormRef" v-if="isDB" />
      <FileAttachments
        :task-id="props.listPrams?.taskId!"
        :node-code="nodeCode"
        ref="fileAttachments"
      />
    </template>
    <template #history>
      <HistoryCase :phone="tel" :task-id="props.listPrams?.taskId!" />
    </template>
    <template #actions>
      <div class="dispatchWrapper" v-show="isReport">
        <div class="formWrapper">
          <el-form
            :model="formData"
            class="from"
            ref="dispatchForm"
            label-width="120px"
            :rules="dispatchRules"
          >
            <Title title="工单派遣" />
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
                    @getDepartCode="executeDepartCode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="事项类别" prop="firstClass">
                  <ClassSelect
                    :departmentCode="departmentCode"
                    :departmentLevel="currentDepartmentLevel"
                    :showValue="defaultValue"
                    @getCheckedValue="getCheckedValue"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6" v-if="isDB">
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
              <el-col :span="12" v-if="formData.firstClass == '147' ">
                <el-form-item label="公司名称" >
                  <SelectCompany @getCompany="(val:any)=>company=val" :taskId="props.listPrams?.taskId" />
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
    </template>
    <template #buttons>
      <div class="btnWrapper">
        <el-button
          type="primary"
          v-if="isReport"
          v-for="(button, index) in props.buttons"
          @click="eventClick(button, index)"
          >{{ button.name }}</el-button
        >
        <el-button
          type="primary"
          v-else
          @click="buttonClick(button)"
          v-for="button in props.buttons"
          >{{ button.name }}</el-button
        >
        <el-button type="info" @click="emit('back')">返回</el-button>
      </div>
    </template>
  </WorkLayout>
</template>
<script lang="ts" setup>
import { useCode } from "@/hooks/useCode";
import type { FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { useLimitTime } from "@/hooks/useLimitTime";
import { getLimitTime } from "@/hooks/getLimitTime";
import { useDepartment } from "@/hooks/useDepartment";
import { ref, reactive, computed, nextTick } from "vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import BaseCaseForm from "@/businessComponent/BaseCaseForm/BaseCaseForm.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import SelectCompany from '@/businessComponent/SelectCompany/SelectCompany.vue'

import {
  CaseModel,
  DispatchFormModel,
  DepartmentModel,
  CaseFormModel,
} from "@/api/model/caseModel";

interface ListPrams {
  id: string;
  taskId: string;
  name: string;
}
interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
  nodes: Array<DepartmentModel>;
}
const emit = defineEmits(["changeName", "back"]);
const props = defineProps<{
  listPrams?: ListPrams;
  buttons: ButtonInfoModel[];
}>();
const caseService = new CaseService();
const dbFormRef = ref();
const baseCaseForm = ref();
const tel = ref("");
const { disabledDate, timeLimit } = useLimitTime();
const isReport = computed(() => {
  return props.listPrams?.name === "派遣";
});
const nodeCode = computed(() => {
  if (isReport.value) {
    //  派遣C101
    return "C101";
  } else {
    // 销单C401
    return "C401";
  }
});
const company = ref('')
const isDB = ref(false);
const reportLoading = ref(false);
const { timeLimitTypes } = useCode();
const { departmentList, currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const departmentCode = ref(currentDepartmentCode);
const fileAttachments = ref();
const dispatchForm = ref<InstanceType<typeof ElForm>>();
const execute = ref("");
const defaultValue = ref<string[]>([]);
const assistant = ref<Array<DepartmentModel>>([]);
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
const form = reactive<CaseModel>({
  caseInfo: {} as CaseFormModel,
  specialFlags: [],
  dispatchInfos: [],
  attachmentInfos: [],
  isAuto: "",
  department: departmentList[0] as DepartmentModel,
  supervision: undefined,
});
const setValue = () => {
  form.caseInfo = {
    ...baseCaseForm.value.getFormData(),
    reflectIndustryCode: formData.firstClass,
    reflectClassCode: formData.secondClass,
    reflectContentCode: formData.thirdClass,
  };
  form.attachmentInfos = fileAttachments.value.getFiles();
  form.specialFlags = baseCaseForm.value.getSpecialTips();
  if (isDB.value) {
    form.supervision = dbFormRef.value.getFormData();
  }
};
const reportCase = () => {
  setValue();
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
        taskId: props.listPrams?.taskId!,
        type: "0",
        disposeTime: formData.disposeTime,
        disposeDepartmentCode: ass.departmentCode,
        dispatchDepartmentCode: currentDepartmentCode,
        description: formData.description,
        deadline: formData.deadline,
        firstClass:
          ass.departmentGroup === "7013" ? assDept.firstClass : formData.firstClass,
        secondClass:
          ass.departmentGroup === "7013" ? assDept.secondClass : formData.secondClass,
        thirdClass:
          ass.departmentGroup === "7013" ? assDept.thirdClass : formData.thirdClass,
        fourthClass:
          ass.departmentGroup === "7013" ? assDept.fourthClass : formData.fourthClass,
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
        taskId: props.listPrams?.taskId!,
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
  dispatchCase();
};
const eventClick = (button: ButtonInfoModel, index: number) => {
  if (button.name === "确定") {
    checkForm().then((status) => {
      if (status) {
        if (!isDB.value) {
          reportCase();
        } else {
          dbFormRef.value.checkForm().then((dbFormStatus: boolean) => {
            if (dbFormStatus) {
              reportCase();
            }
          });
        }
      }
    });
  } else {
    ElMessageBox.confirm("当前工单是否销单?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    })
      .then(() => {
        setValue();
        destroyCase();
      })
      .catch(() => {
        // emit("changeName", "stag");
      });
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
    reflectIndustryName,
    reflectClassName,
    caseType,
  ] = result;
  formData.firstClass = firstClass;
  formData.secondClass = secondClass;
  defaultValue.value = [firstClass, secondClass];
  isDB.value = caseType === "1";
  tel.value = reportPhone;
  const { getLimitTime } = useLimitTime();
  if (isDB.value) {
    changeTime("16");
  } else {
    formData.deadline = timeLimit.value = await getLimitTime(taskId);
  }
};
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
    if (!formData.firstClassName) {
      callback(new Error("不能为空!"));
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
  deadline: [{ required: true, message: "截止时间不能为空", trigger: "change,blur" }],
  secondClass: [
    {
      required: true,
      message: "不能为空",
      trigger: "change",
      validator: validateSecondClass,
    },
  ],
});

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
    assDept.firstClassName = "";
    assDept.secondClassName = "";
    assDept.thirdClass = "";
    assDept.thirdClassName = "";
    assDept.fourthClass = "";
    assDept.fourthClassName = "";
  }
};
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

const buttonClick = (button: ButtonInfoModel) => {
  if (button.name === "确定") {
    setValue();
    destroyCase();
  } else {
    emit("changeName", "dispatch");
  }
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
const dispatchCase = () => {
  reportLoading.value = true;
  caseService
    .dispatchCase(form)
    .then((res) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
    })
    .finally(() => {
      reportLoading.value = false;
      emit("back");
    });
};
const destroyCase = () => {
  reportLoading.value = true;
  caseService
    .destroyCase(form)
    .then((res) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
    })
    .finally(() => {
      reportLoading.value = false;
      emit("back");
    });
};
const sourceChange = async ({ firstParam, secondParam }: any) => {
  formData.deadline = timeLimit.value = await getLimitTime(firstParam, secondParam);
};
const changeTime = async (code: string) => {
  const { firstParam, secondParam } = timeLimitTypes.value.find(
    (timeLimit) => timeLimit.codeValue === code
  )!;
  formData.deadline = await getLimitTime(firstParam, secondParam);
};
</script>

<style lang="scss" scoped>
.dispatchWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  .formWrapper {
    flex: 1;
  }
}
</style>
