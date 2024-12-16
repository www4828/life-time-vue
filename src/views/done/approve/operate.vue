<template>
  <div
    class="receive-case"
    v-loading="loading"
    element-loading-background="rgba(255,255,255,0.3)"
    element-loading-text="正在提交数据请稍后!"
  >
    <WorkLayout class="index" :node-name="nodeName">
      <template #baseInfo>
        <CaseBaseInfo 
          :task-id="props.flowModel.taskId" 
          @setCaseInfo="getSourceCode" 
          @isShowGroupVisits="val=>warnForm.warnId = warnInfo.warnId = val "
        />
        <DBForm is-detail :task-id="props.flowModel.taskId" />
        <FileAttachments
          :task-id="props.flowModel.taskId"
          :node-code="props.flowModel.code"
          ref="fileAttachments"
        />
      </template>
      <template #actions>
        <div class="dispatchWrapper">
          <ClosingReport
            :task-id="props.flowModel.taskId"
            :case-info="caseInfoReactive"
            :isShow="isShow"
            name="审批"
            @getDisposeInfo="getDisposeInfo"
            ref="closingReportRef"
          />
          <Title :title="nodeName">
            <template #content>
              <el-form
                :model="form.caseEndApproveDto"
                class="donefrom"
                ref="dispatchForm"
                :rules="disReportRules"
              >
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="审批结果" prop="result">
                      <el-select
                        v-model="form.caseEndApproveDto.result"
                        filterable
                        placeholder="请选择"
                      >
                        <el-option
                          v-for="item in audiResultsTypes"
                          :label="item.codeName"
                          :value="item.codeValue"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="审批操作员">{{
                      form.caseEndApproveDto.person
                    }}</el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="审批时间">{{
                      form.caseEndApproveDto.time
                    }}</el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="意见说明" prop="content">
                  <el-input
                    @dblclick="showDialog"
                    v-model="form.caseEndApproveDto.content"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    maxlength="500"
                    show-word-limit
                    type="textarea"
                  />
                </el-form-item>
              </el-form>
            </template>
          </Title>
          <Idiom
            :node-code="props.flowModel.code"
            @idiomContentText="IdiomContent"
          ></Idiom>
        </div>
        <IdiomDialog
          :node-code="props.flowModel.code"
          :show-flag="idiomControl"
          @close-dialog="closeDialog"
          ref="idiomRef"
        />
        <div class="wrapper" v-show="dialogControl.control">
          <Dialog
            :dialogControl="dialogControl"
            @closeDialog="dialogControl.control = false"
            @save="saveDialog"
            :is12345="isShow"
          />
        </div>
      </template>
      <template #history>
        <HistoryCase
          :phone="screeningForm.lineForm.reportPhone"
          :task-id="props.flowModel.taskId"
        />
      </template>
      <template #process>
        <Process :taskId="props.flowModel.taskId" />
      </template>
      <template #buttons>
        <el-link
          type="primary"
          @click="warnForm.showGroupVisits = true"
          v-if="warnInfo.warnId"
          :style="{'font-size': '18px'}"
        >
          批量操作工单：已勾选 
          <span :style="{'font-size': '22px','margin' :'0 5px'}">
            {{ ' ( ' + warnForm.selectedCount + ' ) ' }}
          </span>
        </el-link>
        <el-button
          type="primary"
          @click="personalizedFormRef.setDialogVisible(true)"
          v-if="showPerFormFlag"
          >个性化表单</el-button
        >
        <el-button type="primary" @click="jumpToDetail(props.flowModel.taskId)"
          >详情</el-button
        >
        <el-button type="primary" @click="openComponent2"
        >联系市民</el-button
        >
        <!-- @click="screeningForm.dialogVisible = true" -->
        <el-button type="primary" @click="save">
          {{ warnForm.selectedCount > 0 && warnForm.warnId ? '批量提交' : '确定' }}
        </el-button>
        <el-button type="info" @click="back">返回</el-button>
      </template>
    </WorkLayout>
    <ContactDialog
      v-if="screeningForm.dialogVisible"
      :dialogVisible="screeningForm.dialogVisible"
      :formType="screeningForm.formType!"
      :nodeCode="screeningForm.nodeCode"
      :task-id="screeningForm.taskId"
      :line-form="screeningForm.lineForm"
      @close="closeConcat"
      @save="getFiles"
    />
    <PersonalizedForm
      :reflectCode="`${caseInfoReactive.reflectIndustryCode},${caseInfoReactive.reflectClassCode}`"
      :departmentCode="caseInfoReactive.reportDepartmentCode"
      @showForm="(val) => (showPerFormFlag = val)"
      ref="personalizedFormRef"
      :taskId="props.flowModel.taskId"
    />
    
    <el-dialog
      custom-class="dialog"
      v-model="warnForm.showGroupVisits"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :modal="false"
      :show-close="false"
      top="100px"
    >
      <GroupVisits 
        showTable 
        ref="groupVisitsRef" 
        :warnInfo="warnInfo" 
        :caseInfo="caseInfoReactive"
        v-if="caseInfoReactive.taskId && props.flowModel.code"
        @selectionChange="val=>warnForm.selectedCount = val" 
        @finish="batchFinish"
        @getNumber="val=>warnCount=val"
        />
      <template #footer>
        <div class="dialog-footer-between">
          <div class="countdown-box"  v-if="warnCount.total">
            共操作
            <el-link type="primary" :underline="false" :style="{'font-size': '20px'}">
              &nbsp;{{ warnCount.total }}&nbsp;
            </el-link>条，已成功
            <el-link type="success" :underline="false" :style="{'font-size': '20px'}">
              &nbsp;{{ warnCount.success }}&nbsp;
            </el-link>
            条，失败
            <el-link type="danger" :underline="false" :style="{'font-size': '20px'}">
              &nbsp;{{ warnCount.fail }}&nbsp;
            </el-link>
            条，具体操作详情可查看列表  &nbsp;&nbsp;&nbsp;&nbsp;查询统计>>批量操作查询 
          </div>
          <!-- <div class="countdown-box">
            已全部操作完成，将于 
            <CountDown :time="countdown" format='ss' ref="countDownRef" :auto-start="false" @finish="back"/>
            秒后自动返回列表
          </div> -->
        </div>
        <div class="dialog-footer">
          <el-button @click="emit('back')" v-if="warnForm.isListen">返回列表</el-button>
          <el-button @click="clickGroupVisits" v-else >关闭</el-button>
          <el-button type="primary" @click="clickGroupVisits" v-if="!warnForm.isListen">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import dayjs from "dayjs";
import {
  DisposeFormModel,
  DisposeReportFormModel,
  ContactModel,
} from "@/api/model/disposeModel";
import { debounce, isEmpty } from "lodash-es";
import { useCode } from "@/hooks/useCode";
import { useLock } from "@/hooks/useLock";
import { useIdiom } from "@/hooks/useIdiom";
import Dialog from "../components/Dialog.vue";
import Title from "@/components/Title/Title.vue";
import { useDepartment } from "@/hooks/useDepartment";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import { ElMessage, FormRules, ElForm } from "element-plus";
import ClosingReport from "../components/ClosingReport.vue";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import Process from "@/businessComponent/Process/Process.vue";
import { ref, reactive, computed, getCurrentInstance, h } from "vue";
import { ApproveRequestModel } from "@/api/model/endApproveModel";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import ContactDialog from "@/businessComponent/ContactDialog/index-v2.vue";
import CaseBaseInfo from "@/businessComponent/CaseInfo/CaseBaseInfo.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import { EndApproveService } from "@/api/service/CaseEndApprove/EndApprove";
import { FileAttachmentModel, NodeCodeKey } from "@/api/model/fileAttachmentModel";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import PersonalizedForm from "@/businessComponent/PersonalizedForm/index.vue";
import { layer } from "@layui/layer-vue"
import GroupVisits from "@/businessComponent/GroupVisits/GroupVisits.vue";
import { nextTick } from "vue";
import { CountDown } from 'vant';
import 'vant/es/count-down/style'

type FormRules = /*unresolved*/ any
type FormType = "先联" | "甄别" | "联系市民";
interface IList {
  id: string;
  taskId: string;
  processId: string;
  name: string;
  code: NodeCodeKey;
}
const props = defineProps<{
  flowModel: IList;
  buttons: ButtonInfoModel[];
  nodeCode: NodeCodeKey;
}>();
const { unlockCase, unlockAll } = useLock();
const { jumpToDetail } = useCaseDetail();
const { audiResultsTypes } = useCode();
const { proxy } = <any>getCurrentInstance()!;
const { idiomControl, closeDialog, showDialog, idiomRef } = useIdiom();
const { departmentList, name, currentDepartmentCode } = useDepartment();
const isZB = ref(false);
const dispatchForm = ref<InstanceType<typeof ElForm>>();
let caseInfoReactive = reactive({}) as CaseInfoModel;
const nodeName = "结案审批";
const isShow = ref(false);
const emit = defineEmits(["back"]);
const approveService = new EndApproveService();
const fileAttachments = ref();
const closingReportRef = ref();
const loading = ref(false);
const personalizedFormRef = ref();
const showPerFormFlag = ref(false);
const screeningForm = reactive({
  dialogVisible: false,
  formType: "联系市民" as FormType,
  nodeCode: props.flowModel?.code!,
  taskId: props.flowModel?.taskId,
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
const dialogControl = reactive({
  control: false,
  taskId: props.flowModel.taskId,
  caseDisposeReportDto: {},
  files: [],
  contacts: []
});
const form = reactive<ApproveRequestModel>({
  attachmentInfos: [],
  caseEndApproveDto: {
    result: "",
    person: name,
    time: dayjs().format("YYYY-MM-DD HH:mm"),
    content: "",
    taskId: props.flowModel.taskId,
    recordId: "",
    disposeId: "",
    disposeReportId: "",
  },
  departmentVo: departmentList[0],
  flowModel: {
    lineId: props.flowModel.id,
    processId: props.flowModel.processId,
    code: props.flowModel.code,
  },
  caseDisposeReportDto: {} as DisposeReportFormModel,
  relations: [] as ContactModel[],
  caseDispose: {} as DisposeFormModel,
});
const disReportRules = reactive<FormRules>({
  result: [{ required: true, message: "审核结果不能为空", trigger: "change" }],
  content: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
});

const countDownRef = ref()
const groupVisitsRef = ref()
const countdown = ref(1000 * 60)
const warnCount:any = ref({})
const warnForm = reactive({
  selectedCount: 0,
  isListen: false,
  showGroupVisits: false,
  warnId: '',
  flowModelList: [] as any,
  finish: false,
  recordId: '' 
})
const warnInfo = reactive({
  taskId: props.flowModel.taskId,
  warnId: '',
  nodeCode: props.nodeCode
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
        taskId: screeningForm.taskId,
        lineForm: screeningForm.lineForm,
        nodeCode: screeningForm.nodeCode,
        formType:"先联", 
        onClose(){
          closeConcat()
        }, 
        onSave(res:any) {
          getFiles(res)
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
        taskId: screeningForm.taskId,
        lineForm: screeningForm.lineForm,
        nodeCode: screeningForm.nodeCode,
        formType: screeningForm.formType, 
        onClose(){
          closeConcat()
        }, 
        onSave(res:any) {
          getFiles(res)
        }
      }),
      close:()=>{
        id.value = null
      }
    })
  }
}

const isNeedUploadFileBeforeSave = computed(() => {
  // 主办并且当前部门是12319并且是结案完成的
  return (
    currentDepartmentCode === "12319" &&
    isZB.value &&
    form.caseEndApproveDto.result === "1" &&
    (isShow.value ||
      (caseInfoReactive.eventSourceCode === "2" &&
        fileAttachments.value.getAllFiles().length > 0))
  );
});

const getFiles = (files: FileAttachmentModel) => {
  fileAttachments.value.pushFile(files);
};
const getSourceCode = (caseInfo: CaseInfoModel) => {
  Object.keys(caseInfo).forEach((key) => {
    caseInfoReactive[key] = caseInfo[key];
  });
  screeningForm.lineForm.contactPhone = caseInfo.contactPhone;
  screeningForm.lineForm.reportPhone = caseInfo.reportPhone;
  screeningForm.lineForm.reportPerson = caseInfo.reportPerson;
  isShow.value = caseInfo.eventSourceCode === "1";
};
const getDisposeInfo = ({ id, recordId, executeType }: DisposeFormModel) => {
  form.caseEndApproveDto.disposeId = id;
  form.caseEndApproveDto.recordId = recordId;
  isZB.value = executeType === "1";
};
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    dispatchForm.value!.validate((valid:boolean) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const back = () => {
  if(warnForm.warnId){
    unlockAll().then((status) => {
      if (status) {
        emit("back");
      } else {
        ElMessage.error("解锁失败！");
      }
    });
  }else{
    unlockCase(props.flowModel?.taskId!).then((status) => {
      if (status) {
        emit("back");
      } else {
        ElMessage.error("解锁失败！");
      }
    });
  }
};
const saveToData = () => {
  if(warnForm.selectedCount > 0){
    approveBatch()
  }else{
    approve()
  }
};
const approve = () => {
  loading.value = true;
  approveService
    .approve(form, props.buttons[0].taskId)
    .then((res) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
      if (res.code === 200) {
        back();
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
const approveBatch = () => {
  loading.value = true;
  form.flowModelList = warnForm.flowModelList
  form.warnId = warnForm.warnId
  warnForm.isListen = true
  groupVisitsRef.value.listenerHandle();
  approveService
    .approveBatch(form, props.buttons[0].taskId)
    .then((res) => {
      loading.value = false;
      warnForm.recordId = res.data;
      ElMessage({
        message: "批量提交" + (res.code == 200 ? '成功, 您可在当前页面等待处理结果' : '失败'),
        type: res.code == 200 ? "success" : "error",
      });
      if(res.code == 200){
        warnForm.showGroupVisits = true;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
const saveDialog = (result: any) => {
  dialogControl.control = false;
  form.attachmentInfos = result.files;
  form.relations = result.concatForm;
  saveToData();
};
const saveForm = () => {
  checkForm().then((status) => {
    if (status) {
      form.attachmentInfos = fileAttachments.value.getFiles();
      form.caseDisposeReportDto = closingReportRef.value.getFormData();
      form.caseEndApproveDto.disposeReportId = form.caseDisposeReportDto!.id!;
      form.caseDispose = closingReportRef.value.getDoneFormData();
      form.caseDispose.executeType = isZB.value ? '1' : '0'
      form.relations = closingReportRef.value.getRelations();
      if (!isEmpty(closingReportRef.value.getDoneFormData().flowId)) {
        form.flowModel.processId = closingReportRef.value.getDoneFormData().flowId;
      }
      if (!isShow.value) {
        form.caseDisposeReportDto = undefined;
      }
      if (form.caseEndApproveDto.recordId === "") {
        ElMessage.error("请至少选择一个办结报告！");
        return;
      }
      if (isNeedUploadFileBeforeSave.value) {
        dialogControl.caseDisposeReportDto = closingReportRef.value.getFormData();
        dialogControl.files = fileAttachments.value.getAllFiles();
        dialogControl.contacts = closingReportRef.value.getRelations();
        dialogControl.control = true;
      } else {
        saveToData();
      }
    }
  });
};
const IdiomContent = (content: string) => {
  form.caseEndApproveDto.content = content;
};
const closeConcat = () => {
  layer && layer.close(id.value)
  id.value = ''
  screeningForm.dialogVisible = false;
  proxy.mittBus.emit("updateConcatInfo");
};
const save = debounce(() => {
  if (isShow.value) {
    if (form.caseEndApproveDto.result === "1") {
      closingReportRef.value.checkDoneForm().then((status: boolean) => {
        if (status) {
          closingReportRef.value.checkForm().then((status2: boolean) => {
            if (status2) {
              saveForm();
            } else {
              ElMessage.error("请填写完所有必填项！");
            }
          });
        } else {
          ElMessage.error("请填写完所有必填项！");
        }
      });
    } else {
      saveForm();
    }
  } else {
    if (form.caseEndApproveDto.result === "1") {
      closingReportRef.value.checkDoneForm().then((status2: boolean) => {
      if (status2) {
        saveForm();
      } else {
        ElMessage.error("请填写完所有必填项！");
      }
    });
    } else {
      saveForm();
    }
    
  }
}, 500);

const clickGroupVisits = ()=>{
  let checkedData = groupVisitsRef.value.getCheckedData()
  warnForm.flowModelList = []
  warnForm.showGroupVisits = false
  checkedData.forEach((item:any)=>{
    warnForm.flowModelList.push({
      lineId: props.flowModel.id,
      processId: item.processId,
      taskId: item.taskId
    })
  })
}
const batchFinish = ()=>{
  warnForm.finish = true
  nextTick(()=>{
    countDownRef.value.start();
  })
}
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
.idiomContent {
  display: flex;
  padding-left: 100px;
  cursor: pointer;
  ::v-deep(.el-tag) {
    margin-right: 10px;
  }
}
</style>
