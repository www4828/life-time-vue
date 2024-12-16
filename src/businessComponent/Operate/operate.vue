<template>
  <div
    class="receive-case"
    v-loading="loading"
    element-loading-background="rgba(255,255,255,0.3)"
    :element-loading-text="text"
  >
    <WorkLayout
      class="index"
      :node-name="currentFlowModel?.name"
      :active="activeTab"
      @tabClick="(index: number) => (activeTab = index)"
    >
      <template #baseInfo>
        <CaseBaseInfo :task-id="props.taskId" @setCaseInfo="setCaseInfo" />
        <DBForm is-detail :task-id="props.taskId" />
        <FileAttachments
          v-if="props.taskId"
          :task-id="props.taskId"
          ref="fileAttachments"
          :nodeCode="nodeCode"
        />
      </template>
      <template #actions>
        <!-- <div class="dispatchWrapper">
        </div> -->
        <component
          v-if="props.taskId && form.taskId"
          :is="currentComponents"
          :taskId="props.taskId"
          :flowModel="currentFlowModel"
          :submit="submit"
          :hidden="dialogState.hidden"
          :attachments="attachments"
          :allFiles="allFiles"
          @changeSubmit="submit = false"
          @changeLoading="(flag: boolean, txt?: string) => { loading = flag; txt && (text = txt) }"
          @done="done"
          :caseInfo="form"
          :nodeCode="props.nodeCode"
        />
      </template>
      <template #history>
        <HistoryCase :phone="form.reportPhone || ''" :task-id="props.taskId" />
      </template>
      <template #process>
        <Process v-if="props.taskId" :taskId="props.taskId" />
      </template>
      <template #buttons>
        <el-button
          type="primary"
          @click="personalizedFormRef.setDialogVisible(true)"
          v-if="showPerFormFlag"
          >个性化表单</el-button
        >
        <el-button type="primary" @click="jumpToDetail(props.taskId)">详情</el-button>
        <el-button
          type="primary"
          v-if="currentFlowModel?.code === 'C201' || currentFlowModel?.code === 'C202'"
          @click="dialogState.hidden = true"
          >先行联系</el-button
        >
        <template v-for="item in props.buttons" :key="item.id">
          <el-button
            v-if="item.id != currentFlowModel?.id"
            type="primary"
            @click="setCurrentComponents(item)"
            >{{ item.name }}</el-button
          >
        </template>
        <el-button type="primary" @click="save">确定</el-button>
        <el-button type="info" @click="back">返回</el-button>
      </template>
    </WorkLayout>
    <ContactDialog
      v-if="dialogState.hidden"
      :dialogVisible="dialogState.hidden"
      formType="先联"
      @close="closeContant"
      :taskId="props.taskId"
      :lineForm="form"
      :nodeCode="props.flowModel.code"
      @save="getFiles"
    />
    <PersonalizedForm
      :reflectCode="`${form.reflectIndustryCode},${form.reflectClassCode}`"
      :departmentCode="form.reportDepartmentCode"
      @showForm="(val) => (showPerFormFlag = val)"
      ref="personalizedFormRef"
      :taskId="props.taskId"
    />
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  reactive,
  markRaw,
  nextTick,
  watch,
  getCurrentInstance,
  computed,
} from "vue";
import { debounce } from "lodash-es";
import { ElMessage } from "element-plus";
import { useCode } from "@/hooks/useCode";
import { useLock } from "@/hooks/useLock";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import Urge from "@/businessComponent/DealCase/urge.vue";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import Process from "@/businessComponent/Process/Process.vue";
import Completion from "@/businessComponent/DealCase/done.vue";
import TakeBack from "@/businessComponent/DealCase/takeBack.vue";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import TransferVue from "@/businessComponent/DealCase/transfer.vue";
import BackUnlock from "@/businessComponent/DealCase/backUnlock.vue";
import DelayApply from "@/businessComponent/DealCase/delayApply.vue";
import DelayCheck from "@/businessComponent/DealCase/delayCheck.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import AssistApply from "@/businessComponent/DealCase/assistApply.vue";
import AssistCheck from "@/businessComponent/DealCase/assistCheck.vue";
import ReturnCheck from "@/businessComponent/DealCase/returnCheck.vue";
import ReturnApply from "@/businessComponent/DealCase/returnApply.vue";
import ReceiveCase from "@/businessComponent/DealCase/receiveCase.vue";
import ContactDialog from "@/businessComponent/ContactDialog/index.vue";
import CaseBaseInfo from "@/businessComponent/CaseInfo/CaseBaseInfo.vue";
import PowerStorage from "@/businessComponent/DealCase/powerStorage.vue";
import DelayApprove from "@/businessComponent/DealCase/delayApprove.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import AssistApprove from "@/businessComponent/DealCase/assistApprove.vue";
import PersonalizedForm from "@/businessComponent/PersonalizedForm/index.vue";
import PowerStageCheck from "@/businessComponent/DealCase/powerStageCheck.vue";
import PowerStageApprove from "@/businessComponent/DealCase/powerStageApprove.vue";
import KnottyCheck from "@/businessComponent/DealCase/knottyCheck.vue";
import KnottyFinish from "@/businessComponent/DealCase/knottyFinish.vue";
import KnottyTrace from "@/businessComponent/DealCase/knottyTrace.vue";
import ConsultationApproval from "@/businessComponent/DealCase/consultationApproval.vue";
import ConsultationCheck from "@/businessComponent/DealCase/consultationCheck.vue";
import { FileAttachmentModel, NodeCodeKey } from "@/api/model/fileAttachmentModel";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import ReturnApproveTop from "@/businessComponent/DealCase/returnApprove/levelTop.vue";
import AcceptCensor from "@/businessComponent/DealCase/lettersVisit/acceptCensor.vue";
import AcceptReview from "@/businessComponent/DealCase/lettersVisit/acceptReview.vue";

const { operateButton } = useCode();
const { jumpToDetail } = useCaseDetail();
const currentComponents: any = ref();
const nodeCode = ref<NodeCodeKey>("C001");
const caseService = new CaseService();
const disposeService = new DisposeService();
const componentList: any = {
  ReceiveCase: markRaw(ReceiveCase), // 接单
  Completion: markRaw(Completion), // 办结
  dispatch: markRaw(TransferVue), // 向下派遣
  ReturnApply: markRaw(ReturnApply), // 退单申请
  ReturnCheck: markRaw(ReturnCheck), // 退单审核
  // ReturnApprove: markRaw(ReturnApprove), // 退单审批
  ReturnApprove: markRaw(ReturnApproveTop), // 12319退单审批
  DelayApply: markRaw(DelayApply), // 延期审批
  DelayCheck: markRaw(DelayCheck), // 延期审核
  DelayApprove: markRaw(DelayApprove), // 延期审批
  AssistApply: markRaw(AssistApply), // 协办申请
  AssistCheck: markRaw(AssistCheck), // 协办审核
  AssistApprove: markRaw(AssistApprove), // 协办审批
  TaskBack: markRaw(TakeBack), // 收单
  Urge: markRaw(Urge), // 催单
  PowerStorage: markRaw(PowerStorage), // 申请存电
  BackUnlock: markRaw(BackUnlock), // 退单解锁
  PowerStageCheck: markRaw(PowerStageCheck), // 申请存电审核
  PowerStageApprove: markRaw(PowerStageApprove), // 申请存电审批
  KnottyCheck: markRaw(KnottyCheck), // 疑难审核
  KnottyFinish: markRaw(KnottyFinish), // 疑难完成
  KnottyTrace: markRaw(KnottyTrace), // 疑难跟踪
  ConsultationApproval: markRaw(ConsultationApproval), // 会商审批
  ConsultationCheck: markRaw(ConsultationCheck), // 会商审核
  // 信访
  AcceptCensor: markRaw(AcceptCensor), // 受理审查
  AcceptReview: markRaw(AcceptReview), // 受理复核
};
const emit = defineEmits(["back"]);
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    buttons: any;
    nodeCode: NodeCodeKey;
  }>(),
  {
    taskId: "",
  }
);
const showPerFormFlag = ref(false);
const personalizedFormRef = ref();
const { proxy } = <any>getCurrentInstance()!;
const text = ref("正在提交数据请稍后!");
const submit = ref(false);
const loading = ref(false);
const { unlockCase } = useLock();
const form: any = reactive({}); // 详情
const fileAttachments = ref(); // 附件组件
let attachments: any = reactive([]); //附件列表
let allFiles: any = reactive([]);
let nodeName = ref("");
let currentFlowModel = ref({
  id: "",
  code: "",
  name: "",
}); // 环节id，进程id
const dialogState = reactive({
  // 先行联系弹窗
  hidden: false,
});
let activeTab = ref(0);

const closeContant = () => {
  dialogState.hidden = false;
  proxy.mittBus.emit("updateConcatInfo");
};
const getFiles = (file: FileAttachmentModel) => {
  fileAttachments.value.pushFile(file);
};
const setCaseInfo = (data: any) => {
  // 案件详情
  Object.keys(data).forEach((key) => {
    form[key] = data[key];
  });
};
// 切换组件
const setCurrentComponents = (flowModel: any) => {
  currentFlowModel.value = flowModel;
  nodeName.value = flowModel.name;
  nodeCode.value = flowModel.code;
  nextTick(() => {
    fileAttachments.value.clearNotIDsFile();
  });
  let component: any = operateButton.value.find(
    (item) => item.codeValue == flowModel.code
  )?.fourthParam;

  nextTick(() => {
    currentComponents.value = eval(componentList[component]);
  });
};
const done = () => {
  loading.value = false;
  submit.value = false;
  back();
};
const back = () => {
  unlockCase(props.taskId!).then((status) => {
    if (status) {
      emit("back");
    } else {
      ElMessage.error("解锁失败！");
    }
  });
};
// 点击确认
const save = debounce(async () => {
  attachments = fileAttachments.value.getFiles();
  allFiles = fileAttachments.value.getAllFiles();
  submit.value = true;
}, 500);

watch(
  () => props.flowModel,
  () => {
    props.flowModel && setCurrentComponents(props.flowModel);
  },
  {
    deep: true,
    immediate: true,
  }
);
</script>
<style lang="scss" scoped>
.receive-case {
  width: 100%;
  height: 100%;
}

.from {
  // height: 100%;

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
</style>
