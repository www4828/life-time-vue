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
          :node-code="props.flowModel.code"
          :task-id="props.flowModel.taskId"
          ref="fileAttachments"
        />
      </template>
      <template #actions>
        <div class="dispatchWrapper">
          <ClosingReport
            :is-show="isShow"
            :case-info="caseInfoReactive"
            :taskId="props.flowModel.taskId"
            name="审核"
            @getDisposeInfo="getDisposeInfo"
            ref="closingReportRef"
          />
          <Title :title="nodeName">
            <template #content>
              <el-form
                :model="form.caseEndCheckDto"
                class="donefrom"
                ref="dispatchForm"
                :rules="disReportRules"
              >
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="审核结果" prop="result">
                      <el-select
                        v-model="form.caseEndCheckDto.result"
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
                    <el-form-item label="审核操作员">{{
                      form.caseEndCheckDto.person
                    }}</el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="审核时间">{{
                      form.caseEndCheckDto.time
                    }}</el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="意见说明" prop="content">
                  <el-input
                    @dblclick="showDialog"
                    v-model="form.caseEndCheckDto.content"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    maxlength="500"
                    show-word-limit
                    type="textarea"
                  />
                </el-form-item>
                <Idiom
                  :node-code="props.flowModel.code"
                  @idiomContentText="IdiomContent"
                ></Idiom>
              </el-form>
            </template>
          </Title>
          <IdiomDialog
            :node-code="props.flowModel.code"
            :show-flag="idiomControl"
            @close-dialog="closeDialog"
            ref="idiomRef"
          />
        </div>
      </template>
      <template #history>
        <HistoryCase :phone="tel" :task-id="props.flowModel.taskId" />
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
        <el-button type="primary" @click="save">
          {{ warnForm.selectedCount > 0 && warnForm.warnId ? '批量提交' : '确定' }}
        </el-button>
        <el-button type="info" @click="back">返回</el-button>
      </template>
    </WorkLayout>
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
          <!-- <div class="countdown-box" v-if="warnForm.finish">
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
import { ref, reactive, computed } from "vue";
import { debounce, isEmpty } from "lodash-es";
import { useCode } from "@/hooks/useCode";
import { useLock } from "@/hooks/useLock";
import { useIdiom } from "@/hooks/useIdiom";
import Title from "@/components/Title/Title.vue";
import { useDepartment } from "@/hooks/useDepartment";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import { ElMessage, FormRules, ElForm } from "element-plus";
import ClosingReport from "../components/ClosingReport.vue";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import { CheckRequestModel } from "@/api/model/endCheckModel";
import Process from "@/businessComponent/Process/Process.vue";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { EndCheckService } from "@/api/service/CaseEndCheck/EndCheck";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import CaseBaseInfo from "@/businessComponent/CaseInfo/CaseBaseInfo.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import { DisposeFormModel, DisposeReportFormModel } from "@/api/model/disposeModel";
import PersonalizedForm from "@/businessComponent/PersonalizedForm/index.vue";
import GroupVisits from "@/businessComponent/GroupVisits/GroupVisits.vue";
import { nextTick } from "vue";
import { CountDown } from 'vant';
import 'vant/es/count-down/style'

type FormRules = /*unresolved*/ any
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
  nodeCode: NodeCodeKey
}>();
const emit = defineEmits(["back"]);
const { unlockCase, unlockAll } = useLock();
const isShow = ref(false);
const { jumpToDetail } = useCaseDetail();
const dispatchForm = ref<InstanceType<typeof ElForm>>();
const { idiomControl, closeDialog, showDialog, idiomRef } = useIdiom();
const nodeName = "结案审核";
const fileAttachments = ref();
const tel = ref("");
const closingReportRef = ref();
const loading = ref(false);
let caseInfoReactive = reactive({}) as CaseInfoModel;
const checkService = new EndCheckService();
const { departmentList, name } = useDepartment();
const { audiResultsTypes } = useCode();
const personalizedFormRef = ref();
const showPerFormFlag = ref(false);
const executeType = ref();
const form = reactive<CheckRequestModel>({
  attachmentInfos: [],
  caseEndCheckDto: {
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
    code: props.flowModel.code
  },
  caseDisposeReportDto: {} as DisposeReportFormModel,
  caseDispose: {} as DisposeFormModel,
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
const disReportRules = reactive<FormRules>({
  result: [{ required: true, message: "审核结果不能为空", trigger: "change" }],
  content: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
});
const getSourceCode = (caseInfo: CaseInfoModel) => {
  Object.keys(caseInfo).forEach((key) => {
    caseInfoReactive[key] = caseInfo[key];
  });
  tel.value = caseInfo.reportPhone;
  isShow.value = caseInfo.eventSourceCode === "1";
};
const getDisposeInfo = ({ id, recordId, executeType: type }: DisposeFormModel) => {
  form.caseEndCheckDto.disposeId = id;
  form.caseEndCheckDto.recordId = recordId;
  executeType.value = type;
};
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    dispatchForm.value!.validate((valid: boolean) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const saveForm = () => {
  checkForm().then((status) => {
    if (status) {
      form.attachmentInfos = fileAttachments.value.getFiles();
      form.caseDisposeReportDto = closingReportRef.value.getFormData();
      form.caseEndCheckDto.disposeReportId = form.caseDisposeReportDto!.id!;
      form.caseDispose = closingReportRef.value.getDoneFormData();
      form.caseDispose.executeType = executeType.value
      if (!isShow.value) {
        form.caseDisposeReportDto = undefined;
      }
      if (!isEmpty(closingReportRef.value.getDoneFormData().flowId)) {
        form.flowModel.processId = closingReportRef.value.getDoneFormData().flowId;
      }
      if (form.caseEndCheckDto.recordId === "") {
        ElMessage.error("请至少选择一个办结报告！");
        return;
      }
      if(warnForm.selectedCount > 0){
        checkBatch()
      }else{
        checkSave()
      }
    }
  });
};

const checkSave = ()=>{
  loading.value = true;
  checkService
    .save(form)
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
}
const checkBatch = ()=>{
  loading.value = true;
  form.flowModelList = warnForm.flowModelList
  form.warnId = warnForm.warnId
  warnForm.isListen = true
  groupVisitsRef.value.listenerHandle();
  checkService
    .saveBatch(form)
    .then((res) => {
      loading.value = false;
      warnForm.recordId = res.data;
      ElMessage({
        message: "批量提交" + (res.code == 200 ? '成功, 您可在当前页面等待处理结果' : '失败'),
        type: res.code == 200 ? "success" : "error",
      });
      if(res.code == 200 ){
        warnForm.showGroupVisits = true;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
const IdiomContent = (content: string) => {
  form.caseEndCheckDto.content = content;
};
const save = debounce(() => {
  if (isShow.value) {
    if (form.caseEndCheckDto.result === "1") {
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
    if (form.caseEndCheckDto.result === "1") {
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
</style>
