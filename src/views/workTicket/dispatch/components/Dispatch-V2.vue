<template>
  <div :style="{width: '100%', height: '100%'}">
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
          @isShowGroupVisits="val=>warnInfo.warnId = val "
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
              :model="formData"
              class="from"
              ref="dispatchForm"
              label-width="120px"
              :rules="dispatchRules"
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
              <Title title="工单派遣" />
              <el-row>
                <el-col :span="6">
                  <el-form-item label="承办单位" prop="executeDepartCode">
                    <DepartTreeSelect
                      :is-immediate="false"
                      :is-multiple="false"
                      ref="departTreeSelectRef"
                      :params="{
                        childNode: false,
                        currentNode: false,
                        optionList: [],
                        removeList: filterDeptCode,
                      }"
                      @getDepartCode="executeDepartCode"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="事项类别" prop="firstClass">
                    <ClassSelect
                      ref="classSelect"
                      :departmentCode="departmentCode"
                      :departmentLevel="currentDepartmentLevel"
                      @getCheckedValue="getCheckedValue"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6" v-if="sourceCode == '0' || sourceCode == '2' ">
                  <el-form-item label="处置时限" prop="disposeTime">
                    <el-select v-model="formData.disposeTime" placeholder="请选择" clearable @change="changeDisposeTime">
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
                    <span>{{ formData.deadline }}</span>
                    <!-- <el-input v-if="sourceCode == '1' " disabled v-model="formData.deadline"/> -->
                    <!-- <el-date-picker
                      v-else
                      v-model="formData.deadline"
                      type="datetime"
                      format="YYYY-MM-DD HH:mm"
                      :disabled-date="disabledDate"
                      value-format="YYYY-MM-DD HH:mm"
                      :editable="false"
                    /> -->
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
                        removeList: [execute, ...filterDeptCode],
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
                <el-col :span="12">
                  <el-form-item label="抄送部门">
                    <DepartTreeSelect
                      is-immediate
                      is-multiple
                      :params="{
                        childNode: false,
                        currentNode: false,
                        optionList: [],
                        removeList: [],
                      }"
                      @getDepartCode="getCCDepartment"
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
        <div class="dispatchWrapper" v-show="!isDispatch">
            <component
              :is="currentComponents"
              :taskId="props.listPrams?.taskId"
              :flowModel="props.listPrams"
              :submit="submit"
              :attachments="returnForm.attachmentInfos"
              :allFiles="returnForm.allFiles"
              :caseInfo="baseCaseForm.getCaseInfo()"
              :nodeCode="nodeCode"
              @changeSubmit="submit = false"
              @changeLoading="(flag: boolean) => { reportLoading = flag}"
              @done="done"
              ref="returnApplyRef"
              v-if="baseCaseForm && props.listPrams.id"
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
          <el-link
            type="primary"
            @click="showGroupVisits = true"
            v-if="warnInfo.warnId && (props.listPrams?.code === 'C101-1' || props.listPrams?.code === 'C1001') "
            :style="{'font-size': '18px'}"
          >
            批量操作工单：已勾选 
            <span :style="{'font-size': '22px','margin' :'0 5px'}">
              {{ ' ( ' + selectedCount + ' ) ' }}
            </span>
          </el-link>
          <el-button
            type="primary"
            v-if="isDispatch"
            @click="openComponent2"
            >甄别</el-button
            >
          <el-button v-for="button in buttons" type="primary" v-on:click="button.fn!()">
            {{ button.name }}
          </el-button>
          <el-button type="info" @click="back">返回</el-button>
        </div>
      </template>
    </WorkLayout>
    <el-dialog
      class="dialog"
      v-model="showGroupVisits"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :modal="false"
      :show-close="false"
    >
      <GroupVisits 
        showTable 
        ref="groupVisitsRef" 
        :warnInfo="warnInfo" 
        :caseInfo="baseCaseForm.getCaseInfo()"
        v-if="baseCaseForm && props.listPrams.id"
        @selectionChange="val=>selectedCount = val" 
        @finish="batchFinish"
        @getNumber="val=>warnCount=val"
      />
      <template #footer>
        <div class="dialog-footer-between">
          <div class="countdown-box"  v-if="warnCount.total">
            <!-- 已全部操作完成，将于 
            <CountDown :time="countdown" format='ss' ref="countDownRef" :auto-start="false" @finish="back"/>
            秒后自动返回列表 -->
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
        </div>
        <span class="dialog-footer">
          <el-button @click="emit('back')" v-if="isListen">返回列表</el-button>
          <el-button @click="clickGroupVisits" v-else >关闭</el-button>
          <!-- <el-button @click="groupVisitsRef.listenerHandle()" >测试链接</el-button> -->
          <el-button type="primary" @click="clickGroupVisits" v-if="!isListen">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import dayjs from "dayjs";
import { useCode } from "@/hooks/useCode";
import { useLock } from "@/hooks/useLock";
import  { type FormRules } from "element-plus";
import { debounce, cloneDeep } from "lodash-es";
import Title from "@/components/Title/Title.vue";
import { useNodeCode } from "@/hooks/useNodeCode";
import { useLimitTime } from "@/hooks/useLimitTime";
import { getDealLineFn } from "@/hooks/getLimitTime";
import { useDepartment } from "@/hooks/useDepartment";
import { ref, reactive, nextTick, computed, h, markRaw } from "vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import Process from "@/businessComponent/Process/Process.vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import ContactDialog from "@/businessComponent/ContactDialog/index-v2.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { DispatchService } from "@/api/service/WorkTicket/DispatchService";
import BaseCaseForm from "@/businessComponent/BaseCaseForm/BaseCaseForm.vue";
import { FileAttachmentModel, NodeCodeKey } from "@/api/model/fileAttachmentModel";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import { layer } from "@layui/layer-vue";
import ReturnApply12345 from "@/businessComponent/DealCase/returnNew/returnApply.vue";
import ReturnApply from "@/businessComponent/DealCase/returnApply.vue";
import SelectCompany from '@/businessComponent/SelectCompany/SelectCompany.vue'
import GroupVisits from "@/businessComponent/GroupVisits/GroupVisits.vue";
import { CountDown } from 'vant';
import 'vant/es/count-down/style'

type FormRules = /*unresolved*/ any
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

const { timeLimitTypes } = useCode();
const groupVisitsRef = ref()
const currentComponents = ref();
const dispatchService = new DispatchService();
const disposeService = new DisposeService();
const classSelect = ref();
const baseCaseForm = ref();
const departTreeSelectRef = ref();
const reportLoading = ref(false);
const submit = ref(false);
const isShow = ref(true);
const execute = ref("");
const dialogControl = ref(false);
const showGroupVisits = ref(false);
const fileRef = ref();
const filterDeptCode = ref<string[]>([]);
const assistant = ref<Array<DepartmentModel>>([]);
const dispatchForm = ref<InstanceType<typeof ElForm>>();
const { nodeCode } = useNodeCode();
const departmentCode = ref(currentDepartmentCode);
const { timeLimit, disabledDate } = useLimitTime();
const { unlockCase, unlockAll } = useLock();
const fileAttachments = ref();
const sourceCode = ref("");
const reporttime:any = ref("");
const returnApplyRef = ref()
const company = ref('')
// const buttons = ref<ButtonInfoModel[]>([])
const countdown = ref(1000 * 60)
const flowModelList = ref<any[]>([])
const isListen = ref(false)
const finish = ref(false)
const countDownRef = ref()
const selectedCount = ref(0)
const warnCount:any = ref({})
const warnInfo = ref({
  taskId: props.listPrams?.taskId,
  warnId: '',
  nodeCode: nodeCode
});

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

const returnForm = reactive<any>({
  allFiles: [],
  caseInfo: {} as CaseFormModel,
  attachmentInfos: [] as Array<FileAttachmentModel>
});
const form = reactive<CaseModel>({
  caseInfo: {} as CaseFormModel,
  specialFlags: [],
  dispatchInfos: [],
  attachmentInfos: [],
  isAuto: "",
  department: departmentList[0] as DepartmentModel,
  sendToDepts:'',
  flowModel: {
    lineId: "",
    processId: "",
    code: "",
  },
});
const formData = reactive<DispatchFormModel>({
  type: "",
  taskId: props.listPrams?.taskId,
  disposeTime: '-1',
  disposeDepartmentCode: "",
  dispatchDepartmentCode: currentDepartmentCode,
  description: "",
  deadline: "",
  firstClass: "",
  secondClass: "",
  fourthClass: undefined,
  thirdClass: undefined,
  firstClassName: "",
  secondClassName: "",
  thirdClassName: undefined,
  fourthClassName: undefined,
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
    if (!formData.firstClass) {
      callback(new Error("事项类别不能为空"));
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
const validateDeadline = (rule: any, value: any, callback: any) => {
  let year = value.split('-')[0],y = Number(dayjs().format('YYYY'))
  
  if(year == y || year == y+1 ){
    callback();
  }else{
    callback(new Error("截止时间格式错误，请返回重试!"));
  }
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
  secondClass: [
    {
      required: true,
      message: "不能为空",
      trigger: "change",
      validator: validateSecondClass,
    },
  ],
  deadline: [{ required: true, trigger: "change", validator: validateDeadline }]
});
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
const getValue = async (result: string[]) => {
  console.log('getValue',result);
  
  // returnForm.caseInfo = baseCaseForm.value.getCaseInfo();
  const [
    firstClass,
    secondClass,
    reportPhone,
    contactPhone,
    reportPerson,
    eventSourceCode,
    acceptDepartment,
    taskId,
    firstClassName,
    secondClassName,
    caseType,
    reportTime
  ] = result;

  formData.firstClass = firstClass;
  formData.firstClassName = firstClassName;
  formData.secondClass = secondClass;
  formData.secondClassName = secondClassName;
  screeningForm.lineForm.contactPhone = contactPhone;
  screeningForm.lineForm.reportPhone = reportPhone;
  screeningForm.lineForm.reportPerson = reportPerson;
  // screeningForm.taskId = taskId;
  
  sourceCode.value = eventSourceCode;
  reporttime.value = reportTime;
  
  if (eventSourceCode === "1") {
    currentComponents.value = markRaw(ReturnApply12345);
    
  }else{
    formData.disposeTime = ''
    currentComponents.value = markRaw(ReturnApply);
  }
  getDealLine()
  if (acceptDepartment !== "") {
    filterDeptCode.value = [acceptDepartment];
  } else {
    departTreeSelectRef.value.getDepartmentInfo();
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
  if(warnInfo.value.warnId){
    unlockAll().then((status) => {
      if (status) {
        emit("back");
      } else {
        ElMessage.error("解锁失败！");
      }
    });
  }else{
    unlockCase(props.listPrams?.taskId!).then((status) => {
      if (status) {
        emit("back");
      } else {
        ElMessage.error("解锁失败！");
      }
    });
  }
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

const done = () => {
  submit.value = false;
  back();
};

const returnCase = debounce(() => {
  returnForm.caseInfo = baseCaseForm.value.getCaseInfo();
  returnForm.attachmentInfos = fileAttachments.value.getFiles();
  returnForm.allFiles = fileAttachments.value.getAllFiles();
  if (returnForm.attachmentInfos.length >= 1) {
    // 大于三张附件的时候申请退市级
    dialogControl.value = true;
  } else {
    submit.value = true;
    // returnBackToSenior();
  }
}, 500);
const confirm = () => {
  returnForm.attachmentInfos = fileRef.value.getChoiceFiles();
  dialogControl.value = false;
  submit.value = true;
};
const dispatch = () => {
  if(selectedCount.value > 0){
    dispatchBatch()
  }else{
    dispatchCurrent()
  }
};
const dispatchCurrent = () => {
  reportLoading.value = true;
  dispatchService
    .save(form, props.buttons[0].taskId)
    .then((res) => {
      ElMessage({
        message: res.data,
        type: res.code == 200 ? "success" : "error",
      });
    })
    .finally(() => {
      reportLoading.value = false;
      back();
    });
};
const dispatchBatch = () => {
  reportLoading.value = true;
  form.flowModelList = flowModelList.value
  form.warnId = warnInfo.value.warnId
  showGroupVisits.value = true;
  isListen.value = true
  groupVisitsRef.value.listenerHandle();
  
  dispatchService
    .saveBatch(form)
    .then((res) => {
      ElMessage({
        message: "批量提交" + (res.code == 200 ? '成功, 您可在当前页面等待处理结果' : '失败'),
        type: res.code == 200 ? "success" : "error",
      });
    })
    .catch(()=>{
      showGroupVisits.value = false;
      isListen.value = false;
    })
    .finally(() => {
      reportLoading.value = false;
    });
};
const save = debounce(() => {
  baseCaseForm.value.checkForm().then((status: boolean) => {
    if (status) {
      checkForm().then((status2) => {
        if (status2) {
          form.specialFlags = baseCaseForm.value.getSpecialTips();
          form.caseInfo = {
            ...baseCaseForm.value.getFormData(),
            reflectIndustryCode: formData.firstClass,
            reflectClassCode: formData.secondClass,
            reflectContentCode: formData.thirdClass,
          };
          form.flowModel!.code = props.listPrams?.code!;
          form.flowModel!.lineId = props.listPrams?.id!;
          form.flowModel!.processId = props.listPrams?.processId!;        
          flowModelList.value.map(i=> i.lineId = props.listPrams?.id )
          form.attachmentInfos = fileAttachments.value.getFiles();
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
                type: "0",
                taskId: props.listPrams?.taskId,
                disposeTime: formData.disposeTime,
                disposeDepartmentCode: ass.departmentCode,
                dispatchDepartmentCode: currentDepartmentCode,
                description: formData.description,
                deadline: formData.deadline,
                firstClass:
                  ass.departmentGroup === "7013"
                    ? assDept.firstClass
                    : formData.firstClass,
                secondClass:
                  ass.departmentGroup === "7013"
                    ? assDept.secondClass
                    : formData.secondClass,
                thirdClass:
                  ass.departmentGroup === "7013"
                    ? assDept.thirdClass
                    : formData.thirdClass,
                fourthClass:
                  ass.departmentGroup === "7013"
                    ? assDept.fourthClass
                    : formData.fourthClass,
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
                taskId: props.listPrams?.taskId,
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
          // 核验派遣时，如果是派给 78号安质监总站的、并且反映区名为 浦东 和奉贤的，
          // 系统提示一下：请确认反映区名是否正确？是继续派遣，否可以修改反映区名。依此来提醒派遣员，针对临港的修改和定位，现在容易忘掉。
          const { district } = baseCaseForm.value.getFormData();
          if (execute.value === "78" && (district === "20" || district === "30")) {
            ElMessageBox.confirm("请确认反映区名是否正确？", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
            }).then(() => {
              dispatch();
            });
          } else {
            dispatch();
          }
        }
      });
    }
  });
}, 500);
const confirmButtonMap = {
  dispatch: save,
  back: returnCase,
};
const emitFn = (fromPath: string) => {
  fileAttachments.value.clearNotIDsFile();
  emit("dispatch", fromPath);
};
const buttons = computed(() => {
  const propsButtons = cloneDeep(props.buttons);
  propsButtons.forEach((button) => {
    if (props.listPrams!.name === button.name) {
      button.name = (selectedCount.value > 0 && props.listPrams!.code === 'C101-1') ? "批量提交" : '确定';
      button.fn = confirmButtonMap[button.formPath! as "dispatch" | "back"];
      if (button.formPath === "back") {
        // returnForm.flowModel.code = button.code!;
        // returnForm.flowModel.lineId = button.id!;
        // returnForm.flowModel.processId = button.processId!;
      } else {
        form.flowModel!.code = button.code!;
        form.flowModel!.lineId = button.id!;
        form.flowModel!.processId = button.processId!;
        flowModelList.value.map(i=> i.lineId = button.id )
      }
      button.sort = 2;
    } else {
      button.fn = emitFn.bind(null, button.formPath!);
      button.sort = 1;
    }
  });
  propsButtons.sort((a, b) => Number(a.sort) - Number(b.sort));
  console.log(propsButtons,props.listPrams);
  
  return propsButtons;
});
const getDispatchNote = () => {
  disposeService
    .getDispatchNote(props.buttons[0].taskId, currentDepartmentCode)
    .then((res) => {
      res.code == 200 && (formData.description = res.data.dispatchNote);
    });
};
getDispatchNote();

const getCCDepartment = ({ val }:{val:Array<string>})=>{
  form.sendToDepts = val.join(',')
}

const getDealLine = async ()=>{
  const { getLimitTime } = useLimitTime();
  formData.deadline = timeLimit.value = await getLimitTime(props.listPrams?.taskId);
}
const changeDisposeTime = async (val:string)=>{
  if(val){
    const { firstParam, secondParam } = timeLimitTypes.value.find(
      (timeLimit) => timeLimit.codeValue === val
    )!;
    formData.deadline = (await getDealLineFn( props.listPrams?.taskId,firstParam, secondParam)) as any;
  }else{
    formData.deadline = timeLimit.value
  }
}

const clickGroupVisits = ()=>{
  let checkedData = groupVisitsRef.value.getCheckedData()
  flowModelList.value = []
  showGroupVisits.value = false
  
  checkedData.forEach((item:any)=>{
    flowModelList.value.push({
      lineId: item.buttonInfo.find((i:any)=>i.code === props.listPrams.code)?.id,
      processId: item.processId,
      taskId: item.taskId
    })
  })
}
const batchFinish = ()=>{
  finish.value = true
  nextTick(()=>{
    countDownRef.value.start();
  })
}

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
