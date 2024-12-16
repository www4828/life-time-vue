<template>
  <DetailLayout>
    <template #baseInfo>
      <CaseBaseInfo :task-id="taskId" @setCaseInfo="setCaseInfo" />
      <DBForm is-detail :task-id="taskId" />
      <FileAttachments :is-show="false" :task-id="taskId" isChoice disabled isDetail/>
    </template>
    <template #actions>
      <ProcessDetailReview
      :task-id="taskId"
      :reviewTaskId="reviewTaskId"
      v-if="form.caseType === '2' "
      />
      <ProcessDetail :task-id="taskId" v-else />
    </template>
    <template #buttons>
      <el-button type="info" @click="emit('back')" v-if="!isDetail">返回</el-button>
      <el-button
        type="primary"
        @click="personalizedFormRef.setDialogVisible(true)"
        v-if="showPerFormFlag"
        >个性化表单</el-button
      >
    </template>
    <template #history>
      <HistoryCase :phone="reportPhone" :task-id="taskId" />
    </template>
  </DetailLayout>
  <PersonalizedForm
    :reflectCode="`${form.reflectIndustryCode},${form.reflectClassCode}`"
    :departmentCode="form.reportDepartmentCode"
    @showForm="(val) => (showPerFormFlag = val)"
    ref="personalizedFormRef"
    :taskId="String(form.taskId)"
    disabled
  />
</template>
<script lang="ts" setup>
import { decrypt } from "@/utils";
import { useRoute } from "vue-router";
import { computed, ref, reactive } from "vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import DetailLayout from "@/components/Layout/DetailLayout.vue";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import CaseBaseInfo from "@/businessComponent/CaseInfo/CaseBaseInfo.vue";
import ProcessDetail from "@/businessComponent/Process/ProcessDetail.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import PersonalizedForm from "@/businessComponent/PersonalizedForm/index.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
// import ProcessDetailReview from "@/businessComponent/Process/ProcessDetailReview.vue";
import ProcessDetailReview from "@/businessComponent/Process/ProcessDetailTree.vue";

interface IList {
  id: string;
  taskId: string;
  processId: string;
  name: string;
}
const emit = defineEmits(["back"]);
const props = defineProps<{
  flowModel?: IList;
}>();
const route = useRoute();
const reportPhone = ref("");
const reviewTaskId = ref("");
const form = reactive({} as CaseInfoModel); // 详情
const showPerFormFlag = ref(false);
const personalizedFormRef = ref();
const isDetail = computed(() => {
  return route.path === "/caseDetail";
});
const taskId = computed(() => {
  if (props.flowModel?.taskId!) {
    return props.flowModel?.taskId!;
  }
  if (route.query.check_token) {
    return route.query.taskId as string;
  }
  return decrypt(route.query.taskId as string);
});
const setCaseInfo = (caseInfo: CaseInfoModel) => {
  reportPhone.value = caseInfo.reportPhone;
  reviewTaskId.value = caseInfo.reviewTaskId;
  // 案件详情
  Object.keys(caseInfo).forEach((key) => {
    form[key] = caseInfo[key];
  });
};
</script>
