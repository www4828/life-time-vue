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
            :model="screeningForm.resultForm"
            class="from"
            label-width="120px"
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
          </el-form>
        </div>
      </div>
      <div class="dispatchWrapper" >
        <component
          v-if="baseCaseForm && props.listPrams.id"
          :is="currentComponents"
          :taskId="props.listPrams?.taskId"
          :flowModel="currentFlowModel"
          :submit="submit"
          :attachments="returnForm.attachmentInfos"
          :allFiles="returnForm.allFiles"
          @changeSubmit="submit = false"
          @changeLoading="(flag: boolean, txt?: string) => { reportLoading = flag; txt }"
          @done="done"
          :caseInfo="returnForm.caseInfo"
          :nodeCode="nodeCode"
          :specialFlags="returnForm.specialFlags"
        />
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
        title="向市级退单，请选择附件（上限3条），不勾选默认不上传文件"
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
        <!-- <el-button v-for="button in buttons" type="primary" v-on:click="button.fn!()">{{
          button.name
        }}</el-button> -->
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
      </div>
    </template>
  </WorkLayout>
</template>
<script lang="ts" setup>
import { useCode } from "@/hooks/useCode";
import { useLock } from "@/hooks/useLock";
import { debounce, cloneDeep } from "lodash-es";
import Title from "@/components/Title/Title.vue";
import { useLimitTime } from "@/hooks/useLimitTime";
import { useDepartment } from "@/hooks/useDepartment";
import { ref, reactive, nextTick, computed, h, markRaw, watch } from "vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import Process from "@/businessComponent/Process/Process.vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import ContactDialog from "@/businessComponent/ContactDialog/index-v2.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import { DispatchService } from "@/api/service/WorkTicket/DispatchService";
import BaseCaseForm from "@/businessComponent/BaseCaseForm/BaseCaseForm.vue";
import { FileAttachmentModel, NodeCodeKey } from "@/api/model/fileAttachmentModel";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import { layer } from "@layui/layer-vue";
import ReturnApply12345 from "@/businessComponent/DealCase/returnNew/returnApply.vue";
import ReturnApply from "@/businessComponent/DealCase/returnApply.vue";
import FeedBack from "@/businessComponent/DealCase/feedBack.vue";
import CaseDispatch from "@/businessComponent/DealCase/caseDispatch.vue";

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
  eventSource: string;
}
type FormType = "先联" | "甄别";
const props = defineProps<{
  listPrams: ListPrams;
  buttons: ButtonInfoModel[];
}>();
const emit = defineEmits(["back", "dispatch"]);
const {
  currentDepartmentLevel,
  currentDepartmentCode,
  departmentList,
  name,
} = useDepartment();

const componentList: any = {
  FeedBack: markRaw(FeedBack), // 紧急/次紧急反馈
  CaseDispatch: markRaw(CaseDispatch),
  ReturnApply:  markRaw(ReturnApply)
};

const currentComponents = ref();
const disposeService = new DisposeService();
const baseCaseForm = ref();
const reportLoading = ref(false);
const submit = ref(false);
const isShow = ref(true);
const dialogControl = ref(false);
const fileRef = ref();
const { operateButton } = useCode();
const { unlockCase } = useLock();
const fileAttachments = ref();
const nodeName = ref("");
const nodeCode = ref<NodeCodeKey>("C001");
const currentFlowModel = ref({
  id: "",
  code: "",
  name: "",
}); // 环节id，进程id
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


const returnForm = reactive<any>({
  allFiles: [],
  caseInfo: {} as CaseFormModel,
  attachmentInfos: [] as Array<FileAttachmentModel>,
    specialFlags:[]
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

const getValue = async (result: string[]) => {
  returnForm.caseInfo = baseCaseForm.value.getCaseInfo();
  const [
    reportPhone,
    contactPhone,
    reportPerson
  ] = result;

  screeningForm.lineForm.contactPhone = contactPhone;
  screeningForm.lineForm.reportPhone = reportPhone;
  screeningForm.lineForm.reportPerson = reportPerson;
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


const done = () => {
  submit.value = false;
  back();
};

const confirm = () => {
  returnForm.attachmentInfos = fileRef.value.getChoiceFiles();
  dialogControl.value = false;
  submit.value = true;
};

const save = debounce(() => {
  returnForm.caseInfo = baseCaseForm.value.getCaseInfo();
  returnForm.attachmentInfos = fileAttachments.value.getFiles();
  returnForm.allFiles = fileAttachments.value.getAllFiles();
  if(isDispatch){
    baseCaseForm.value.checkForm().then((status: boolean) => {
      if (status) {
        returnForm.specialFlags = baseCaseForm.value.getSpecialTips()
        console.log(baseCaseForm.value.getSpecialTips(),baseCaseForm.value.getCaseInfo());
        
        submit.value = true;
      }
    });
  }else{
    if (returnForm.attachmentInfos.length >= 1) {
    // 大于三张附件的时候申请退市级
      dialogControl.value = true;
    } else {
      submit.value = true;
    }
  }
}, 500);

// 切换组件
const setCurrentComponents = (flowModel: any) => {
  
  currentFlowModel.value = flowModel;
  nodeName.value = flowModel.name;
  nodeCode.value = flowModel.code;
  let component: any = operateButton.value.find(
    (item) => item.codeValue == flowModel.code
  )?.fourthParam;
  nextTick(() => {
    fileAttachments.value.clearNotIDsFile();
    if(props.listPrams.eventSource === '1'){
      if(component === 'ReturnApply'){
        currentComponents.value = markRaw(ReturnApply12345);
      }else{
        currentComponents.value = eval(componentList[component]);
      }
    }else{
      currentComponents.value = eval(componentList[component]);
    }
    
  });
};

watch(
  () => props.listPrams,
  () => {
    if(props.listPrams){
      setCurrentComponents(props.listPrams)
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
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
