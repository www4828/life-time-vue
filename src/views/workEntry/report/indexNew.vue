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
        @sourceChange="sourceChange"
      ></BaseCaseForm>
      <FileAttachments nodeCode="C001" ref="fileAttachments" />
    </template>
    <template #history>
      <HistoryCase :phone="(route.query.phone as string) || ''" task-id="" />
    </template>
    <template #actions>
      <div class="dispatchWrapper">
        <PersonalizedForm
          :reflectCode="`${classInfo.firstClass},${classInfo.secondClass}`"
          @showForm="(val) => (showPerFormFlag = val)"
          ref="personalizedFormRef"
        />
        <Title title="工单派遣" ></Title>
        <CaseDispatch ref='caseDispatch' @getClassInfo="(info:any)=>classInfo=info" />
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
import Title from "@/components/Title/Title.vue";
import { useDepartment } from "@/hooks/useDepartment";
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { FileAttachmentModel } from "@/api/model/fileAttachmentModel";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import BaseCaseForm from "@/businessComponent/BaseCaseForm/BaseCaseForm.vue";
import PersonalizedForm from "@/businessComponent/PersonalizedForm/index.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import CaseDispatch from '@/businessComponent/DealCase/caseDispatch.vue'

const route = useRoute();
const baseCaseForm = ref();
const personalizedFormRef = ref();
const showPerFormFlag = ref(false); // 个性化表单按钮
const { departmentList, currentDepartmentCode, currentDepartmentLevel } = useDepartment();

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
});
const classInfo = reactive({
  firstClass:'',
  secondClass: ''
})

const voiceFile = ref<FileAttachmentModel[]>([]);
const specialTips = ref<string[]>([]);
const caseService = new CaseService();
const caseDispatch = ref();

const { proxy } = <any>getCurrentInstance();
const saveVoiceFile = (file: FileAttachmentModel) => {
  voiceFile.value = [file];
};

const clear = () => {
  baseCaseForm.value.clearForm();
  fileAttachments.value.clearFiles();
  form.attachmentInfos = [];
  form.department = departmentList[0];
  form.dispatchInfos = [];
  form.isAuto = "";
  form.specialFlags = [];
  caseDispatch.value.clear()
  specialTips.value = [];
  showPerFormFlag.value = false
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
      caseDispatch.value.checkForm().then((status2:any) => {
        let {formData,execute,assistant,assDept} = caseDispatch.value.getInfo()
        
        if (status2) {
          form.specialFlags = baseCaseForm.value.getSpecialTips();
          form.caseInfo = {
            ...baseCaseForm.value.getFormData(),
            reflectIndustryCode: formData.firstClass,
            reflectClassCode: formData.secondClass,
            reflectContentCode: formData.thirdClass,
          };
          form.attachmentInfos = fileAttachments.value.getFiles().concat(voiceFile.value);
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
            assistant.value!.forEach((ass:any) => {
              assistants.push({
                type: "0",
                disposeTime: formData.disposeTime,
                disposeDepartmentCode: ass.departmentCode,
                dispatchDepartmentCode: currentDepartmentCode,
                description: formData.description,
                deadline: formData.deadline,
                firstClass: ass.departmentGroup === "7013" ? assDept.firstClass : formData.firstClass,
                secondClass: ass.departmentGroup === "7013" ? assDept.secondClass : formData.secondClass,
                thirdClass: ass.departmentGroup === "7013" ? assDept.thirdClass : formData.thirdClass,
                fourthClass: ass.departmentGroup === "7013" ? assDept.fourthClass : formData.fourthClass,
                firstClassName: ass.departmentGroup === "7013" ? assDept.firstClassName : formData.firstClassName,
                secondClassName: ass.departmentGroup === "7013" ? assDept.secondClassName : formData.secondClassName,
                thirdClassName: ass.departmentGroup === "7013" ? assDept.thirdClassName : formData.thirdClassName,
                fourthClassName: ass.departmentGroup === "7013" ? assDept.fourthClassName : formData.thirdClassName,
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
}, 500);

const isShowPersonalForm = (control: boolean) => {
  personalForm.value = control;
};

const sourceChange = async ({ firstParam, secondParam }: any) => {
  caseDispatch.value.sourceChange({ firstParam, secondParam })
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
