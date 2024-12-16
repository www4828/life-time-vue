<template>
  <PowerStageCom
    ref="powerStageCom"
    :task-id="props.taskId"
    :node-code="props.flowModel.code"
    name="审核"
    :businessType="props.caseInfo.businessType"
  />
</template>
<script setup lang="ts">
import { watch, ref } from "vue";
import { ElMessage } from "element-plus";
import { useDepartment } from "@/hooks/useDepartment";
import PowerStageCom from "./components/PowerStageCom.vue";
import { CaseArchiveCheckModel } from "@/api/model/powerStorageModel";
import { PowerStorageService } from "@/api/service/PowerStorage/PowerStorageService";
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
const { departmentList } = useDepartment();
const powerStageCom = ref();
const powerStorageService = new PowerStorageService();
const emit = defineEmits(["changeSubmit", "changeLoading", "done"]);
const save = () => {
  const form: CaseArchiveCheckModel = {
    attachmentInfos: props.attachments,
    caseArchiveEntity: powerStageCom.value.getPowerStageForm(),
    caseDisposeReportDto: {
      ...powerStageCom.value.getCaseDisposeReportRef().getFormData(),
      taskId: props.taskId,
    },
    caseDispose: powerStageCom.value.getCaseDisposeForm(),
    departmentVo: departmentList[0],
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    caseArchiveCheckEntity: {
      ...powerStageCom.value.getFormData(),
      disposeReportId: powerStageCom.value.getCaseDisposeReportRef().getFormData().id,
      disposeId: powerStageCom.value.getCaseDisposeForm().id,
    },
  };
  emit("changeLoading", true);
  powerStorageService
    .powerStageCheck(form)
    .then((res) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
      emit("done");
    })
    .catch(() => emit("done"));
};
const checkForm = () => {
  powerStageCom.value.powerStageRef().validate((valid: any) => {
    if (valid) {
      powerStageCom.value.caseDisposeRef().validate((isPass: any) => {
        if (isPass) {
          powerStageCom.value
            .getCaseDisposeReportRef()
            .checkForm()
            .then((isPss2: boolean) => {
              if (isPss2) {
                powerStageCom.value.getCheckRef().validate((isPass3: any) => {
                  if (isPass3) {
                    save();
                  } else {
                    emit("changeSubmit");
                  }
                });
              } else {
                emit("changeSubmit");
              }
            });
        } else {
          emit("changeSubmit");
        }
      });
    } else {
      emit("changeSubmit");
    }
  });
};
watch(
  () => props.submit,
  (val) => {
    if (val) {
      checkForm();
    }
  },
  { deep: true }
);
</script>
