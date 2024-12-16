<template>
  <div>
    <Title title="处置办结">
      <template #content>
        <el-form
          :model="comForm.caseDisposeDto"
          class="from"
          ref="caseDisposeDtoForm"
          :rules="disposeRules"
          id="doneReport"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="处理结果" prop="result">
                <el-select v-model="comForm.caseDisposeDto.result" filterable>
                  <el-option
                    v-for="item in resultTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="处理人员" prop="person">
                <el-input v-model="comForm.caseDisposeDto.person"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="处理时间" prop="time">
                <el-date-picker
                  v-model="comForm.caseDisposeDto.time"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  :editable="false"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="事项类别" prop="firstClass">
                <ClassSelect
                  :departmentCode="currentDepartmentCode"
                  :departmentLevel="currentDepartmentLevel"
                  :showValue="defaultVale"
                  @getCheckedValue="getCheckedValue"
                />
              </el-form-item>
            </el-col>
            <el-col
              :span="6"
              v-if="
                comForm.caseDisposeDto.status !== '' &&
                comForm.caseDisposeDto.status !== '2'
              "
            >
              <el-form-item label="是否暂存">
                <el-select v-model="comForm.caseDisposeDto.status" @change="(val:any)=>emit('isShowGroupVisits',val)">
                  <el-option label="否" value="1" />
                  <el-option label="是" value="0" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="意见说明" prop="description">
            <el-input
              @dblclick="showDialog"
              v-model="comForm.caseDisposeDto.description"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <IdiomDialog
            :node-code="props.flowModel.code"
            :show-flag="idiomControl"
            @close-dialog="closeDialog"
            @get-idiom-content="IdiomContent"
            ref="idiomRef"
          />
          <Idiom
            :node-code="props.flowModel.code"
            @idiomContentText="IdiomContent"
          ></Idiom>
        </el-form>
      </template>
    </Title>
    <ContactFirst
      :is-choice="canChoice"
      :taskId="props.flowModel.taskId"
      :is-only-look="false"
      type="先联"
      @get-result="getResult"
      v-if="is12345"
    ></ContactFirst>
    <Title title="办结报告" v-show="is12345">
      <template #content>
        <DoneReport
          ref="doneReport"
          :case-info="props.caseInfo"
          :taskId="props.taskId"
          :node-code="[undefined, undefined, 'C202-1', undefined]"
        />
      </template>
    </Title>
    <el-dialog
      custom-class="dialog"
      v-model="state.dialogShow"
      width="70%"
      destroy-on-close
      title="复核单处置办结需需要上传联系市民的录音文件，请选择附件（上限3条），不勾选默认不上传文件"
      @close="cancal"
    >
      <FileAttachments
        is-choice
        :is-show="false"
        ref="fileRef"
        :task-id="props.taskId"
        :default-value="props.allFiles"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancal">取消</el-button>
          <el-button type="primary" @click="fileSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { useCode } from "@/hooks/useCode";
import { deepClone } from "@/utils/other";
import { isEmpty } from "lodash-es";
import { useIdiom } from "@/hooks/useIdiom";
import { CodeModel, CodeTreeModel } from "@/api/model/codeModel";
import { ElForm, ElMessage, FormRules } from "element-plus";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import Title from "@/components/Title/TitleCollapse.vue";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import ContactFirst from "@/views/done/components/ContactFirst.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { computed, reactive, ref, watch, nextTick } from "vue";
import {
  CaseDisposeModel,
  DepartmentModel,
  DisposeFormModel,
  ContactModel,
} from "@/api/model/disposeModel";

import DoneReport from "@/views/done/components/DoneReport.vue";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { useDepartment } from "@/hooks/useDepartment";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { DispatchService } from "@/api/service/WorkTicket/DispatchService";

type FormRules = /*unresolved*/ any
interface Result {
  row: ContactModel;
  sourceData: ContactModel[];
}
const disposeService = new DisposeService();
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
    allFiles: any;
    warnForm: any
  }>(),
  {
    taskId: "",
  }
);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const emit = defineEmits(["changeSubmit", "changeLoading", "done", "changeClass","isShowGroupVisits","showGroupVisit"]);
const stageFlag = ref(false);
const doneReport = ref();
const dispatchService = new DispatchService();
const is12345 = computed(() => {
  return props.caseInfo.eventSourceCode === "1";
});
const upLevel2 = computed(() => {
  return Number(currentDepartmentLevel) > 3;
});
const {
  departmentList,
  name,
  currentDepartmentCode,
  currentDepartmentLevel,
} = useDepartment();
const canChoice = ref(false);
const searchParamsModel = reactive(new SearchParamsModel<DisposeFormModel>());
const searchModel = ref<SearchModel<DisposeFormModel>[]>([
  {
    key: "taskId",
    value: props.taskId,
    match: "eq",
  },
  {
    key: "status",
    value: "0,2",
    match: "inSql",
  },
  {
    key: "departmentCode",
    value: currentDepartmentCode,
    match: "eq",
  },
]);
const state = reactive({
  showValue: [] as any,
  dialogShow: false,
  attachments: [],
});
const defaultVale = ref<string[]>([]);
const fileRef = ref();
const comForm = reactive<CaseDisposeModel>({
  attachmentInfos: [],
  caseDisposeDto: {
    content: "",
    description: "",
    person: name,
    result: "",
    taskId: props.taskId,
    time: "",
    type: "",
    id: "",
    firstClass: "",
    secondClass: "",
    thirdClass: "",
    fourthClass: "",
    status: "1",
    departmentCode: currentDepartmentCode,
    recordId: "",
  },
  caseDisposeReportDto: {
    id: "",
    appealExplain: "",
    appealFinding: "",
    factExplain: "",
    factFinding: "",
    feedback: "",
    isSmmy: "",
    isXcck: "",
    replyPoint: "",
    replyTime: "",
    replyType: "",
    secondaryAgent: "",
    secondaryDepartment: "",
    secondaryPrincipal: "",
    signedUnit: "",
    taskId: props.taskId,
    xcckTime: "",
    secondaryPhone: "",
  },
  department: departmentList[0] as DepartmentModel,
  relations: [],
});
const loading = ref(false);
const caseDisposeDtoForm = ref<InstanceType<typeof ElForm>>();

const { resultTypes } = useCode();
const validateFirstClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!comForm.caseDisposeDto.firstClass) {
      callback(new Error("事项类别不能为空!"));
    } else {
      callback();
    }
  });
};
const disposeRules = reactive<FormRules>({
  result: [{ required: true, message: "处理结果不能为空", trigger: "change" }],
  person: [{ required: true, message: "处理人员不能为空", trigger: "blur" }],
  time: [{ required: true, message: "处理时间不能为空", trigger: "change" }],
  firstClass: [
    {
      required: true,
      message: "事项类别不能为空",
      trigger: "change",
      validator: validateFirstClass,
    },
  ],
  content: [{ required: true, message: "处理内容不能为空", trigger: "change" }],
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
});
const getResult = (result: Result) => {
  const { row, sourceData } = result;
  if (!isEmpty(row)) {
    sourceData.forEach((source) => {
      if (source.id === row.id) {
        source.status = 2;
      } else {
        source.status = 1;
      }
    });
    comForm.relations = sourceData;
  }
};
const getCheckedValue = ({ checkedValue, secondParams }: EmitProps) => {
  const [firstClass, secondClass, thirdClass] = checkedValue;
  comForm.caseDisposeDto.firstClass = firstClass;
  comForm.caseDisposeDto.secondClass = secondClass;
  comForm.caseDisposeDto.thirdClass = thirdClass;
  emit('changeClass',[firstClass,secondClass])
};
const getReportList = () => {
  searchParamsModel.pageParams.pageIndex = -1;
  searchParamsModel.searchParams = searchModel.value;
  disposeService.getCaseDisposeList(searchParamsModel).then((res) => {
    if (res.code === 200) {
      if (res.data.results.length > 0) {
        stageFlag.value = true;
        const data = res.data.results[0];
        Object.keys(comForm.caseDisposeDto).forEach((key) => {
          comForm.caseDisposeDto[key] = data[key];
        });
        defaultVale.value = [
          comForm.caseDisposeDto.firstClass,
          comForm.caseDisposeDto.secondClass,
          comForm.caseDisposeDto.thirdClass,
        ];
        comForm.caseDisposeDto.departmentCode = currentDepartmentCode;
        comForm.caseDisposeDto.fourthClass = "";
        comForm.caseDisposeDto.time = "";
        comForm.caseDisposeDto.taskId = props.taskId;
        if (is12345.value) {
          doneReport.value.getDoneReport12345(comForm.caseDisposeDto.recordId!);
        }
      } else if (is12345.value && res.data.results.length === 0 && upLevel2.value) {
        doneReport.value.getDepartmentList();
      }
    }
  });
};
const getIsEnyType = () => {
  dispatchService
    .getCaseDesTypeByTaskId(props.taskId, currentDepartmentCode)
    .then((res) => {
      if (res.code == 200) {
        if (is12345.value && res.data.flowType === 1) {
          canChoice.value = true;
        }
      }
    });
};
nextTick(() => {
  getReportList();
  getIsEnyType();
});
const saveForm = () => {
  let postData: any = {
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    attachmentInfos: state.attachments,
    caseDisposeDto: deepClone(comForm.caseDisposeDto),
    caseDisposeReportDto: is12345.value ? doneReport.value.getFormData() : undefined,
    department: comForm.department,
    relations: comForm.relations,
  };

  if (comForm.caseDisposeDto.status === "0") {
    emit("changeLoading", true);
    disposeService
      .saveStaging(postData)
      .then((res) => {
        loading.value = false;
        ElMessage({
          message: res.message,
          type: res.code == 200 ? "success" : "error",
        });
        emit("done");
      })
      .catch(() => emit("done"));
  } else {
    if (
      props.attachments.length === 0 &&
      props.caseInfo.isGB === "1" &&
      Number(currentDepartmentLevel) >= 2
    ) {
      // 如果没有附件并且是国办单并且是二级处置部门
      ElMessage.error("国办单需要上传单位领导签字盖章的附件，请检查！");
      emit("changeSubmit");
    } else if (
      is12345.value &&
      (doneReport.value.getFactTypes() as CodeModel[]).some(
        ({ name }) => name === doneReport.value.getFormData().factExplain.trim()
      )
    ) {
      // 事实认定、诉求认定选择的词语和输入的描述，不能相同
      ElMessage.error("事实认定描述不能等于事实认定选择的词语，请检查！");
      emit("changeSubmit");
    } else if (
      is12345.value &&
      (doneReport.value.getAppealTypes() as CodeTreeModel[]).some(
        ({ codeName }) => codeName === doneReport.value.getFormData().appealExplain.trim()
      )
    ) {
      // 事实认定、诉求认定选择的词语和输入的描述，不能相同
      ElMessage.error("诉求认定描述不能等于诉求认定选择的词语，请检查！");
      emit("changeSubmit");
    } else {
      if(props.warnForm.selectedCount > 0){
        disposeBatch(postData)
      }else{
        dispose(postData)
      }
    }
  }
};
const dispose = (postData:CaseDisposeModel)=>{
  emit("changeLoading", true);
  disposeService
    .saveCaseDis(postData, props.taskId)
    .then((res) => {
      loading.value = false;
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
      emit("done");
    })
    .catch(() => emit("done"));
}
const disposeBatch = (postData:CaseDisposeModel)=>{
  emit('showGroupVisit')
  postData.warnId = props.warnForm.warnId
  postData.flowModelList = props.warnForm.flowModelList
  disposeService
    .saveCaseDisposeBatch(postData)
    .then((res) => {
      ElMessage({
        message: "批量提交" + (res.code == 200 ? '成功, 您可在当前页面等待处理结果' : '失败'),
        type: res.code == 200 ? "success" : "error",
      });
    })
    .catch(() => emit("done"));
}
const save = async () => {
  if (is12345.value) {
    doneReport.value.checkForm().then((status: boolean) => {
      if (status) {
        if (comForm.relations.length === 0 && is12345.value && canChoice.value) {
          ElMessage.error("请选择先联信息！");
          emit("changeSubmit");
          return;
        }
        saveForm();
      } else {
        ElMessage.error("请填写完所有必填项！");
        emit("changeSubmit");
      }
    });
  } else if (!is12345.value) {
    caseDisposeDtoForm.value?.validate((status: boolean) => {
      if (status) {
        saveForm();
      } else {
        ElMessage.error("请填写完所有必填项！");
        emit("changeSubmit");
      }
    });
  } else {
    emit("changeSubmit");
  }
};
const ckeckSubmit = () => {
  if (props.caseInfo?.caseType == "2") {
    if (props.allFiles.length == 0) {
      ElMessage.warning("复核单处置办结需需要上传联系市民的录音文件，请检查！");
      emit("changeSubmit");
    } else if (props.attachments.length > 0) {
      state.attachments = props.attachments;
      save();
    } else {
      state.dialogShow = true;
    }
  } else {
    state.attachments = props.attachments;
    save();
  }
};
const fileSave = () => {
  state.attachments = fileRef.value.getChoiceFiles();
  state.dialogShow = false;
  save();
};
const cancal = () => {
  emit("changeSubmit");
  state.dialogShow = false;
};
watch(
  () => props.submit,
  (val) => {
    val &&
      caseDisposeDtoForm.value?.validate((valid: any) => {
        if (valid) {
          ckeckSubmit();
        } else {
          emit("changeSubmit");
        }
      });
  },
  { deep: true }
);
const IdiomContent = (idContent: string) => {
  comForm.caseDisposeDto.description = idContent;
};
</script>
