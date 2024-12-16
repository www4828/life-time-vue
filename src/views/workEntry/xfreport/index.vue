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
        @getAcceptDeptCode="getValue"
        @saveVoiceFile="saveVoiceFile"
        @getExternalNumber="getExternalNumber"
        @is-c-d="getCDStatus"
      ></BaseCaseForm>
      <FileAttachments nodeCode="XC001" ref="fileAttachments" />
    </template>
    <template #history>
      <HistoryCase :phone="(route.query.phone as string) || ''" task-id="" />
    </template>
    <template #actions>
      <Title title="受理审查" v-if="isCD">
        <template #content>
          <el-form
            :model="form.xfslsc!"
            class="from"
            ref="returnApplyForm"
            :rules="dispatchRules"
            :validate-on-rule-change="false"
          >
            <el-row>
              <el-col :span="10">
                <el-form-item label="受理情况" prop="slqk">
                  <el-radio-group v-model="form.xfslsc!.slqk" @change="changeReault">
                    <el-radio label="1" :style="{ marginRight: '10px' }"
                      >准予受理</el-radio
                    >
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="是否重要件" prop="importLevel">
                  <el-radio-group v-model="form.xfslsc!.importLevel">
                    <el-radio label="0" :style="{ marginRight: '10px' }">一般件</el-radio>
                    <el-radio label="1">重要件</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="初步审查人">
                  <span>{{ name }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="意见说明" prop="yjsm">
              <el-input
                @dblclick="showDialog"
                v-model="form.xfslsc!.yjsm"
                autofocus
                :autosize="{ minRows: 2, maxRows: 4 }"
                type="textarea"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <Idiom node-code="XC001" @idiomContentText="IdiomContent"></Idiom>
            <IdiomDialog
              node-code="XC001"
              :show-flag="idiomControl"
              @close-dialog="closeDialog"
              @get-idiom-content="IdiomContent"
              ref="idiomRef"
            />

            <el-row>
              <el-col :span="10">
                <el-form-item label="下一步处理人" prop="nextCode">
                  <el-select
                    v-model="form.xfslsc!.nextCode"
                    placeholder="阶段"
                    @change="changeType"
                    clearable
                  >
                    <el-option
                      :label="item.name"
                      :value="item.firstParam"
                      v-for="item in state.typeList"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="" prop="nextDept">
                  <el-select
                    v-model="form.xfslsc!.nextDept"
                    placeholder="科室"
                    :style="{ marginLeft: '10px' }"
                    @change="getUserByDeptCode"
                    clearable
                  >
                    <el-option
                      :label="item.departmentName"
                      :value="item.departmentCode"
                      v-for="item in state.deptList"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="" prop="nextUser">
                  <el-select
                    v-model="form.xfslsc!.nextUser"
                    placeholder="人员"
                    :style="{ marginLeft: '10px' }"
                  >
                    <el-option
                      :label="item.name"
                      :value="item.username"
                      v-for="item in state.userList"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="反馈期限" prop="disposeTime">
                  <el-select
                    v-model="form.xfslsc!.disposeTime"
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
              <el-col :span="4"></el-col>
              <el-col :span="6">
                <el-form-item label="截止时间" prop="deadline">
                  <el-date-picker
                    type="datetime"
                    v-model="form.xfslsc!.deadline"
                    :editable="false"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </Title>
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
import dayjs from "dayjs";
import { debounce } from "lodash-es";
import { useRoute } from "vue-router";
import { useCode } from "@/hooks/useCode";
import { useIdiom } from "@/hooks/useIdiom";
import type { FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { useLimitTime } from "@/hooks/useLimitTime";
import { getLimitTime } from "@/hooks/getLimitTime";
import { useDepartment } from "@/hooks/useDepartment";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { ref, reactive, getCurrentInstance } from "vue";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { CaseService } from "@/api/service/WorkTicket/CaseServiceXF";
import { FileAttachmentModel } from "@/api/model/fileAttachmentModel";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import BaseCaseForm from "@/businessComponent/BaseCaseForm/BaseCaseFormXF.vue";
import { LettersVisitService } from "@/api/service/LettersVisit/LettersVisitService";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import { CaseService as CaseServiceXF } from "@/api/service/WorkTicket/CaseServiceXF";

interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
}
const isCD = ref(false);
const route = useRoute();
const baseCaseForm = ref();
const classSelect = ref();
const personalizedFormRef = ref();
const caseServiceXF = new CaseServiceXF();
const returnApplyForm = ref<InstanceType<typeof ElForm>>();
const showPerFormFlag = ref(false); // 个性化表单按钮
const { timeLimit } = useLimitTime(true);
const { timeLimitTypes } = useCode();
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const { departmentList, currentDepartmentCode, name, parentDepartCode } = useDepartment();
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
  xfslsc: {
    slqk: "1",
    importLevel: "0",
    yjsm: "",
    nextCode: "",
    nextDept: "",
    nextUser: "",
    nextRole: "",
    disposeTime: "11",
    deadline: "",
  },
});

const formData = reactive<DispatchFormModel>({
  type: "",
  taskId: "",
  disposeTime: "10",
  disposeDepartmentCode: "",
  dispatchDepartmentCode: currentDepartmentCode,
  description: "",
  deadline: dayjs().format("YYYY-MM-DD HH:mm"),
  firstClass: "",
  secondClass: "",
  fourthClass: undefined,
  thirdClass: undefined,
});
const lettersVisitService = new LettersVisitService();
const voiceFile = ref<FileAttachmentModel[]>([]);
const specialTips = ref<string[]>([]);
const caseService = new CaseService();
const execute = ref("");
const assistant = ref<string[]>([]);
const dispatchRules = reactive<FormRules>({
  yjsm: [{ required: false, message: "意见说明不能为空", trigger: "blur" }],
  nextCode: [{ required: false, message: "阶段不能为空", trigger: "change" }],
});
const { proxy } = <any>getCurrentInstance();
const saveVoiceFile = (file: FileAttachmentModel) => {
  voiceFile.value = [file];
};
const state = reactive({
  typeList: [] as any,
  deptList: [] as any,
  userList: [] as any,
  roleId: "",
  departmentCode: "",
  externalNumber: "",
});
const flag = ref(false);
const getValue = (departmentCode: string) => {
  state.departmentCode = departmentCode;
};
const getExternalNumber = (externalNumber: string) => {
  state.externalNumber = externalNumber;
};
const getCDStatus = (status: boolean) => {
  isCD.value = status;
};
const clear = () => {
  baseCaseForm.value.clearForm();
  fileAttachments.value.clearFiles();
  form.attachmentInfos = [];
  form.department = departmentList[0];
  form.dispatchInfos = [];
  form.isAuto = "";
  form.specialFlags = [];
  form.xfslsc!.yjsm = "";
  form.xfslsc!.nextCode = "";
  form.xfslsc!.nextDept = "";
  form.xfslsc!.nextUser = "";
  form.xfslsc!.nextRole = "";
  formData.type = "";
  formData.taskId = "";
  formData.disposeTime = "10";
  formData.disposeDepartmentCode = "";
  formData.dispatchDepartmentCode = currentDepartmentCode;
  formData.description = "";
  formData.deadline = "";
  formData.firstClass = "";
  formData.secondClass = "";
  formData.thirdClass = undefined;
  formData.fourthClass = undefined;
  execute.value = "";
  assistant.value = [];
  specialTips.value = [];
  flag.value = false;
  dispatchRules["yjsm"] = [
    { required: false, message: "意见说明不能为空", trigger: "blur" },
  ];
  dispatchRules["nextCode"] = [
    { required: false, message: "阶段不能为空", trigger: ["change", "blur"] },
  ];
  dispatchRules["nextDept"] = [
    { required: false, message: "部门不能为空", trigger: ["change", "blur"] },
  ];
  dispatchRules["nextUser"] = [
    { required: false, message: "人员不能为空", trigger: ["change", "blur"] },
  ];
  showPerFormFlag.value = false;
  changeTime(form.xfslsc!.disposeTime);
};
const getReflectType = () => {
  lettersVisitService.getReflectType("XC100", "200").then((res) => {
    if (form.xfslsc!.slqk === "0") {
      state.typeList = res.data.filter((i: any) => i.firstParam != "XF200");
    } else {
      state.typeList = res.data;
    }
  });
};
const changeReault = (val: any) => {
  form.xfslsc!.nextCode = "";
  form.xfslsc!.nextRole = "";
  form.xfslsc!.nextDept = "";
  form.xfslsc!.nextUser = "";
  state.deptList = state.userList = [];
  getReflectType();
};
changeReault("");
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    returnApplyForm.value!.validate((valid: boolean) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const postSave = (formData: CaseModel) => {
  caseService
    .save(formData)
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
const getStatus = () => {
  return caseServiceXF
    .getTaskInfo(state.externalNumber)
    .then((res) => {
      if (res.code === 200) {
        return true;
      } else {
        return false;
      }
    })
    .catch(() => {
      return false;
    });
};

const saveForm = async () => {
  const formData: CaseModel = {
    ...form,
  };
  if (isCD.value) {
    // 如果是拆单
    formData.caseInfo.splitTaskID = formData.caseInfo.externalNumber;
    const status = await getStatus();
    if (!status) {
      ElMessage.error("关联单号不存在，无法保存，请检查");
      return;
    }
  }
  if (flag.value) {
    checkForm().then((isPass) => {
      if (isPass) {
        reportLoading.value = true;
        postSave(formData);
      }
    });
  } else {
    delete formData.xfslsc;
    reportLoading.value = true;
    postSave(formData);
  }
};
const save = debounce(() => {
  baseCaseForm.value.checkForm().then((status: boolean) => {
    if (status) {
      form.specialFlags = baseCaseForm.value.getSpecialTips();
      form.caseInfo = baseCaseForm.value.getFormData();
      form.attachmentInfos = fileAttachments.value.getFiles().concat(voiceFile.value);

      saveForm();
    }
  });
}, 500);

const changeType = (type: string) => {
  form.xfslsc!.nextDept = "";
  form.xfslsc!.nextUser = "";
  state.deptList = state.userList = [];
  form.xfslsc!.nextRole = state.typeList.find(
    (i: any) => i.firstParam === type
  )?.thirdParam;
  form.xfslsc!.nextRole && getDeptByRoleId(form.xfslsc!.nextRole);
  if (type !== "") {
    dispatchRules["yjsm"] = [
      { required: true, message: "意见说明不能为空", trigger: "blur" },
    ];
    dispatchRules["nextCode"] = [
      { required: true, message: "阶段不能为空", trigger: ["change", "blur"] },
    ];
    dispatchRules["nextDept"] = [
      { required: true, message: "部门不能为空", trigger: ["change", "blur"] },
    ];
    dispatchRules["nextUser"] = [
      { required: true, message: "人员不能为空", trigger: ["change", "blur"] },
    ];
    flag.value = true;
  } else {
    dispatchRules["yjsm"] = [
      { required: false, message: "意见说明不能为空", trigger: "blur" },
    ];
    dispatchRules["nextCode"] = [
      { required: false, message: "阶段不能为空", trigger: ["change", "blur"] },
    ];
    dispatchRules["nextDept"] = [
      { required: false, message: "部门不能为空", trigger: ["change", "blur"] },
    ];
    dispatchRules["nextUser"] = [
      { required: false, message: "人员不能为空", trigger: ["change", "blur"] },
    ];
    returnApplyForm.value?.resetFields();
    flag.value = false;
  }
};

const getDeptByRoleId = (roleId: string) => {
  state.deptList = [];
  lettersVisitService
    .getDeptByRoleId(roleId, state.departmentCode || parentDepartCode)
    .then((res) => {
      state.deptList = res.data;

      if (
        form.xfslsc!.slqk == "1" &&
        state.deptList.filter(
          (item: any) => item.departmentCode === currentDepartmentCode
        ).length > 0
      ) {
        form.xfslsc!.nextDept = currentDepartmentCode;
        form.xfslsc!.nextDept && getUserByDeptCode(form.xfslsc!.nextDept);
      }
    });
};
const getUserByDeptCode = (deptCode: string) => {
  form.xfslsc!.nextUser = "";
  state.userList = [];
  if (deptCode) {
    lettersVisitService.getUserByDeptCode(form.xfslsc!.nextRole, deptCode).then((res) => {
      state.userList = res.data;
    });
  }
};

const isShowPersonalForm = (control: boolean) => {
  personalForm.value = control;
};

const changeTime = async (val: string) => {
  const { firstParam, secondParam } = timeLimitTypes.value.find(
    (timeLimit) => timeLimit.codeValue === val
  )!;

  form.xfslsc!.deadline = await getLimitTime(firstParam, secondParam);
};
changeTime(form.xfslsc!.disposeTime);
const IdiomContent = (idContent: string) => {
  form.xfslsc!.yjsm = idContent;
};
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
