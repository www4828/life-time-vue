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
        <CaseBaseInfo 
          :task-id="props.taskId" 
          @setCaseInfo="setCaseInfo" 
          @getDeadline="(val:string)=>form.dealwithtime=val" 
          ref="caseBaseInfoRef"
          :specialEdit="props.flowModel?.code === 'XC100' || (props.flowModel?.code === 'XC303' && specialEdit)"
        />
        <FileAttachments
          v-if="props.taskId"
          :task-id="props.taskId"
          ref="fileAttachments"
          :nodeCode="nodeCode"
        />
      </template>
      <template #actions>
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
          :specialTips='specialTips'
          @changeReault="changeReault"
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
        <el-button type="primary" @click="jumpToXFDetail(props.taskId)">详情</el-button>
        <el-button
          type="primary"
          v-show="contactNodeList.indexOf(currentFlowModel?.code) > -1"
          @click="openComponent2"
          >先行联系</el-button>
          <!-- @click="dialogState.hidden = true" -->
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
import { debounce } from "lodash-es";
import { ElMessage } from "element-plus";
import { useCode } from "@/hooks/useCode";
import { useLock } from "@/hooks/useLock";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import Process from "@/businessComponent/Process/ProcessXF.vue";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import ContactDialog from "@/businessComponent/ContactDialog/xf-v2.vue";
import CaseBaseInfo from "@/businessComponent/CaseInfo/CaseBaseInfoXF.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import PersonalizedForm from "@/businessComponent/PersonalizedForm/index.vue";
import { ref, reactive, markRaw, nextTick, watch, getCurrentInstance, h } from "vue";
import { FileAttachmentModel, NodeCodeKey } from "@/api/model/fileAttachmentModel";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import AcceptCensor from "@/businessComponent/DealCase/lettersVisit/acceptCensor.vue";
import AcceptReview from "@/businessComponent/DealCase/lettersVisit/acceptReview.vue";
import AcceptVerify from "@/businessComponent/DealCase/lettersVisit/acceptVerify.vue";
import DealCheck from "@/businessComponent/DealCase/lettersVisit/dealCheck.vue";
import DealReview from "@/businessComponent/DealCase/lettersVisit/dealReview.vue";
import DealVerify from "@/businessComponent/DealCase/lettersVisit/dealVerify.vue";
import ResultCensor from "@/businessComponent/DealCase/lettersVisit/resultCensor.vue";
import ResultReview from "@/businessComponent/DealCase/lettersVisit/resultReview.vue";
import ResultVerify from "@/businessComponent/DealCase/lettersVisit/resultVerify.vue";
import ResultAudit from "@/businessComponent/DealCase/lettersVisit/resultAudit.vue";
import FeedBack from "@/businessComponent/DealCase/feedBack.vue";
import {layer} from "@layui/layer-vue"

const { operateButton } = useCode();
const { jumpToDetail,jumpToXFDetail } = useCaseDetail();
const currentComponents: any = ref();
const nodeCode = ref<NodeCodeKey>("C001");
const contactNodeList = ['XC100','XC101','XC102','XC200','XC201','XC202','XC301','XC302','XC303','XC300']
// ,'XC201','XC202','XC301','XC302','XC303','XC300'
const caseService = new CaseService();
const disposeService = new DisposeService();

const componentList: any = {
  AcceptCensor: markRaw(AcceptCensor), // 受理审查
  AcceptReview: markRaw(AcceptReview), // 受理复核
  AcceptVerify: markRaw(AcceptVerify), // 受理审核
  DealCheck: markRaw(DealCheck), // 办理核实
  DealReview: markRaw(DealReview), // 办理复核
  DealVerify: markRaw(DealVerify), // 办理审核
  ResultCensor: markRaw(ResultCensor), // 结果审查
  ResultReview: markRaw(ResultReview), // 结果复核
  ResultVerify: markRaw(ResultVerify), // 结果审核
  ResultAudit: markRaw(ResultAudit), // 结果审定
  FeedBack: markRaw(FeedBack), // 紧急/次紧急反馈
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
const caseBaseInfoRef = ref()
const { proxy } = <any>getCurrentInstance()!;
const text = ref("正在提交数据请稍后!");
const submit = ref(false);
const loading = ref(false);
const { unlockCase } = useLock();
const form: any = reactive({}); // 详情
const fileAttachments = ref(); // 附件组件
let attachments: any = reactive([]); //附件列表
let allFiles: any = reactive([]);
let specialTips: any = reactive([])
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
let specialEdit = ref(true)

const id = ref();
const openComponent2 = () => {
  if(id.value){
    layer.open({
      title: '先联',
      id: id.value,
      maxmin: true,
      shade: false,
      anim:'6',
      closeBtn: false,
      content: h(ContactDialog, { 
        taskId: props.taskId,
        lineForm: form,
        nodeCode: props.flowModel.code,
        formType:"先联", 
        onClose(){
          closeContant()
        }, 
        onSave(res:any) {
          getFiles(res)
        }
      }),
      close:()=>{
        id.value = ''
        proxy.mittBus.emit("updateConcatInfo");
      }
    })
  }else{
    id.value = layer.open({
      title: '先联',
      maxmin: true,
      shade: false,
      closeBtn: false,
      content: h(ContactDialog, { 
        taskId: props.taskId,
        lineForm: form,
        nodeCode: props.flowModel.code,
        formType:"先联", 
        onClose(){
          closeContant()
        }, 
        onSave(res:any) {
          getFiles(res)
        }
      }),
      close:()=>{
        id.value = null
        proxy.mittBus.emit("updateConcatInfo");
      }
    })
  }
}


const closeContant = () => {
  layer && layer.close(id.value)
  id.value = ''
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
const changeReault = (flag:boolean)=>{
  specialEdit.value = flag
}

// 点击确认
const save = debounce(async () => {
  attachments = fileAttachments.value.getFiles();
  allFiles = fileAttachments.value.getAllFiles();
  specialTips = caseBaseInfoRef.value.getSpecialTips()
  // console.log(specialTips);
  
  submit.value = true;
}, 500);

watch(
  () => props.flowModel,
  () => {
    props.flowModel && setCurrentComponents(props.flowModel);
    
    console.log(props.flowModel.code === 'XC100' || (props.flowModel.code === 'XC303' && specialEdit.value));
    
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
