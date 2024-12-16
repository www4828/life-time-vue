<template>
  <Title title="存电信息">
    <template #content>
      <el-form
        :model="form.caseArchiveEntity"
        class="from"
        ref="formRef"
        :rules="powerStorageRules"
      >
        <el-row>
          <el-col :span="7">
            <el-form-item label="存电标记" prop="flag">
              <el-select
                v-model="form.caseArchiveEntity.flag"
                filterable
                @change="flagChange"
              >
                <el-option
                  v-for="item in powerTypes"
                  :label="item.codeName"
                  :value="item.codeValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="来电人" prop="person">
              <el-input v-model="form.caseArchiveEntity.person" />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="联系方式" prop="phone">
              <el-input v-model="form.caseArchiveEntity.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7">
            <el-form-item label="关联单号1">
              <el-input v-model="form.caseArchiveEntity.relationTaskIdFirst">
                <template #append>
                  <el-button
                    @click="
                      jumpToDetail(form.caseArchiveEntity.relationTaskIdFirst.trim())
                    "
                  >
                    详情</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="关联单号2">
              <el-input v-model="form.caseArchiveEntity.relationTaskIdSecond">
                <template #append>
                  <el-button
                    @click="
                      jumpToDetail(form.caseArchiveEntity.relationTaskIdSecond.trim())
                    "
                  >
                    详情</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="关联单号3">
              <el-input v-model="form.caseArchiveEntity.relationTaskIdThird">
                <template #append>
                  <el-button
                    @click="
                      jumpToDetail(form.caseArchiveEntity.relationTaskIdThird.trim())
                    "
                  >
                    详情</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="3" class="div-flex-center">
            <el-button type="primary" @click="relevanceByNo">关联单号查询</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7">
            <el-form-item label="关联单号4">
              <el-input v-model="form.caseArchiveEntity.relationTaskIdFourth">
                <template #append>
                  <el-button
                    @click="
                      jumpToDetail(form.caseArchiveEntity.relationTaskIdFourth.trim())
                    "
                  >
                    详情</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="关联单号5">
              <el-input v-model="form.caseArchiveEntity.relationTaskIdFifth">
                <template #append>
                  <el-button
                    @click="
                      jumpToDetail(form.caseArchiveEntity.relationTaskIdFifth.trim())
                    "
                  >
                    详情</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="关联单号6">
              <el-input v-model="form.caseArchiveEntity.relationTaskIdSixth">
                <template #append>
                  <el-button
                    @click="
                      jumpToDetail(form.caseArchiveEntity.relationTaskIdSixth.trim())
                    "
                  >
                    详情</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="存电描述" prop="description">
          <el-input
            v-model="form.caseArchiveEntity.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            maxlength="500"
            show-word-limit
            @dblclick="showDialog"
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
          style="margin-bottom: 10px"
        ></Idiom>
        <el-row>
          <el-col :span="6">
            <el-form-item label="有无实际现场" prop="isArrive">
              <el-select v-model="form.caseArchiveEntity.isArrive" filterable>
                <el-option label="有" value="1" />
                <el-option label="无" value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="单位经办人" prop="agent">
              <el-input v-model="form.caseArchiveEntity.agent" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="单位负责人" prop="principal">
              <el-input v-model="form.caseArchiveEntity.principal" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申请时间">
              <el-input v-model="form.caseArchiveEntity.appleTime" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <Title title="处置办结">
        <template #content>
          <el-form
            :model="form.caseDisposeDto"
            class="from"
            ref="caseDisposeDtoForm"
            id="doneReport"
            :rules="disposeRules"
          >
            <el-row>
              <el-col :span="6">
                <el-form-item label="处理结果" prop="result">
                  <el-select v-model="form.caseDisposeDto.result" filterable>
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
                  <el-input v-model="form.caseDisposeDto.person"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="处理时间" prop="time">
                  <el-date-picker
                    v-model="form.caseDisposeDto.time"
                    type="datetime"
                    :editable="false"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="事项类别" prop="firstClass">
                  <ClassSelect
                    :departmentCode="currentDepartmentCode"
                    :departmentLevel="currentDepartmentLevel"
                    :showValue="defaultVale"
                    @getCheckedValue="getCheckedReportValue"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="意见说明" prop="description">
              <el-input
                v-model="form.caseDisposeDto.description"
                :autosize="{ minRows: 2, maxRows: 4 }"
                type="textarea"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-form>
        </template>
      </Title>
      <Title title="办结报告">
        <template #content>
          <DoneReport
            ref="doneReport"
            :is-reasonable="powerStorage.canChoiceNum === 0"
            :case-info="caseInfo"
            :taskId="doneReportTaskId"
            :businessType="props.caseInfo.businessType"
          />
        </template>
      </Title>
      <el-dialog
        v-model="powerStorage.control"
        title="关联工单"
        custom-class="powerStorageDialog"
        width="80%"
        @close="dialogClose"
        destroy-on-close
      >
        <el-form>
          <el-row :gutter="10">
            <el-col :span="7">
              <el-form-item label="工单编号">
                <el-input v-model="searchModel[0].value" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="外系统编号">
                <el-input v-model="searchModel[1].value" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="联系人">
                <el-input v-model="searchModel[2].value" />
              </el-form-item>
            </el-col>
            <el-col :span="3" class="div-flex-center flex">
              <el-button type="primary" @click="query">查询</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="14">
              <el-form-item label="接报时间">
                <el-date-picker
                  v-model="reportTime"
                  type="daterange"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="联系电话">
                <el-input v-model="searchModel[5].value" />
              </el-form-item>
            </el-col>
            <el-col :span="3" class="div-flex-center flex">
              <el-button type="primary" @click="relevance">关联</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="7">
              <el-form-item label="事项类别">
                <ClassSelect
                  ref="classSelect"
                  :departmentCode="currentDepartmentCode"
                  :departmentLevel="currentDepartmentLevel"
                  @getCheckedValue="getCheckedValue"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="发生地址">
                <el-input v-model="searchModel[6].value" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="问题描述">
                <el-input v-model="searchModel[7].value" />
              </el-form-item>
            </el-col>
            <el-col :span="3" class="div-flex-center flex">
              <el-button type="primary" @click="powerStorage.control = false"
                >取消</el-button
              >
            </el-col>
          </el-row>
        </el-form>
        <Title title="存电信息">
          <template #content>
            <el-table
              :data="powerStorage.tableData"
              style="width: 100%; margin-bottom: 10px"
              @selection-change="handleSelectionChange"
              height="500"
              row-key="id"
              ref="checkTable"
            >
              <el-table-column reserve-selection type="selection" width="55" />
              <el-table-column prop="taskId" label="工单编号" />
              <el-table-column prop="externalNumber" label="外系统编号" />
              <el-table-column prop="reportTime" label="接报时间" />
              <el-table-column label="事项类别">
                <template #default="scope">
                  {{ scope.row.reflectIndustryName + "-" + scope.row.reflectClassName }}
                </template>
              </el-table-column>
              <el-table-column prop="address" label="发生地址" />
              <el-table-column
                prop="description"
                label="问题描述"
                show-overflow-tooltip
              />
              <el-table-column prop="executeDepartmentName" label="主责部门" />
            </el-table>
            <Pagination
              :currentPage="searchParamsModel.pageParams.pageIndex"
              :pageSize="searchParamsModel.pageParams.pageSize"
              :total="searchParamsModel.pageParams.total"
              :callBack="paginationChange"
              :page-sizes="[5, 10, 20, 30, 50]"
            />
          </template>
        </Title>
      </el-dialog>
    </template>
  </Title>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import { useCode } from "@/hooks/useCode";
import { reactive, ref, watch, nextTick, computed } from "vue";
import Title from "@/components/Title/Title.vue";
import { SearchModel } from "@/api/model/baseModel";
import { SearchParamsModel } from "@/api/interface";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import { useDepartment } from "@/hooks/useDepartment";
import DoneReport from "./components/DoneReport.vue";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import Pagination from "@/components/pagination/index.vue";
import { DisposeFormModel } from "@/api/model/disposeModel";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { CaseArchiveModel } from "@/api/model/powerStorageModel";
import { DisposeReportFormModel } from "@/api/model/disposeModel";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { ElMessage, FormRules, FormInstance, ElTable } from "element-plus";
import { PowerStorageService } from "@/api/service/PowerStorage/PowerStorageService";
import { useIdiom } from "@/hooks/useIdiom";
import { FileAttachmentModel } from "@/api/model/fileAttachmentModel";
interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const is12345 = computed(() => {
  return props.caseInfo.eventSourceCode === "1";
});
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: CaseInfoModel;
    attachments: FileAttachmentModel[];
  }>(),
  {
    taskId: "",
  }
);
const classSelect = ref();
const doneReport = ref();
const formRef = ref<FormInstance>();
const caseService = new CaseService();
const defaultVale = ref<string[]>([]);
const disposeService = new DisposeService();
const { jumpToDetail } = useCaseDetail();
const reportTime = ref<string[]>([
  dayjs().subtract(1, "year").format("YYYY-MM-DD"),
  dayjs().format("YYYY-MM-DD"),
]);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const { powerTypes, resultTypes } = useCode();
const caseDisposeDtoForm = ref<FormInstance>();
const doneReportTaskId = ref(props.taskId);
const powerStorageService = new PowerStorageService();
const checkTable = ref<InstanceType<typeof ElTable>>();
const powerStorage = reactive<{
  control: boolean;
  tableData: CaseInfoModel[];
  canChoiceNum: number;
  choiceTaskId: string[];
  checkedList: CaseInfoModel[];
}>({
  control: false,
  tableData: [],
  canChoiceNum: 6,
  choiceTaskId: [],
  checkedList: [],
});
const caseInfo = reactive<{ [index: string]: any }>({});
const {
  name,
  currentDepartmentCode,
  currentDepartmentLevel,
  departmentList,
} = useDepartment();
const emit = defineEmits(["changeSubmit", "changeLoading", "done"]);
const form = reactive<CaseArchiveModel>({
  attachmentInfos: [],
  caseArchiveEntity: {
    id: "",
    taskId: props.taskId,
    agent: name,
    appleTime: dayjs().format("YYYY-MM-DD HH:mm"),
    description: "",
    dispatchId: "",
    flag: "",
    isArrive: "",
    person: props.caseInfo.reportPerson,
    principal: "",
    phone: props.caseInfo.contactPhone || props.caseInfo.reportPhone,
    recordId: "",
    relationTaskIdFifth: "",
    relationTaskIdFirst: "",
    relationTaskIdFourth: "",
    relationTaskIdSecond: "",
    relationTaskIdSixth: "",
    relationTaskIdThird: "",
    departmentCode: currentDepartmentCode,
  },
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
  caseDisposeReportDto: {} as DisposeReportFormModel,
  department: departmentList[0],
  flowModel: {
    lineId: props.flowModel.id,
    processId: props.flowModel.processId,
    code: props.flowModel.code,
  },
});
const caseInfoSearchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const caseInfoSearchModel = ref<SearchModel<CaseInfoModel>[]>([
  {
    key: "taskId",
    value: "",
    match: "eq",
  },
]);
const backSearchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const backSearchModel = ref<SearchModel<CaseInfoModel>[]>([
  {
    key: "taskId",
    value: "",
    match: "eq",
  },
]);
const disposeSearchParamsModel = reactive(new SearchParamsModel<DisposeFormModel>());
const disposeSearchModel = ref<SearchModel<DisposeFormModel>[]>([
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
const reportSearchParamsModel = reactive(new SearchParamsModel<DisposeFormModel>());
const reportSearchModel = ref<SearchModel<DisposeFormModel>[]>([
  {
    key: "taskId",
    value: "",
    match: "eq",
  },
]);
const searchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const searchModel = ref<SearchModel<CaseInfoModel>[]>([
  {
    match: "like",
    key: "taskId",
    value: "",
  },
  {
    match: "like",
    key: "externalNumber",
    value: "",
  },
  {
    match: "like",
    key: "reportPerson",
    value: "",
  },
  {
    match: "gt",
    key: "reportTime",
    value: dayjs().subtract(1, "year").format("YYYY-MM-DD"),
  },
  {
    match: "lt",
    key: "reportTime",
    value: dayjs().format("YYYY-MM-DD"),
  },
  {
    match: "like",
    key: "contactPhone",
    value: "",
  },
  {
    match: "like",
    key: "address",
    value: "",
  },
  {
    match: "like",
    key: "description",
    value: "",
  },
  {
    match: "eq",
    key: "flowState",
    value: "Z400",
  },
  {
    match: "eq",
    key: "eventSourceCode",
    value: "1",
  },
  {
    match: "ne",
    key: "caseType",
    value: "2",
  },
]);
const validateFirstClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!form.caseDisposeDto.firstClass) {
      callback(new Error("事项类别不能为空!"));
    } else {
      callback();
    }
  });
};
const powerStorageRules = reactive<FormRules>({
  flag: [{ required: true, message: "存电标记不能为空", trigger: "change" }],
  person: [{ required: true, message: "来电人不能为空", trigger: "blur" }],
  phone: [{ required: true, message: "联系方式不能为空", trigger: "blur" }],
  description: [{ required: true, message: "存电描述不能为空", trigger: "blur" }],
  isArrive: [{ required: true, message: "有无实际现场不能为空", trigger: "change" }],
  agent: [{ required: true, message: "单位经办人不能为空", trigger: "blur" }],
  principal: [{ required: true, message: "单位负责人不能为空", trigger: "blur" }],
});
const disposeRules = reactive<FormRules>({
  result: [{ required: true, message: "处理结果不能为空", trigger: "change" }],
  person: [{ required: true, message: "处理人员不能为空", trigger: "blur" }],
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  firstClass: [
    {
      required: true,
      message: "事项类别不能为空",
      trigger: "change",
      validator: validateFirstClass,
    },
  ],
  time: [{ required: true, message: "处理时间不能为空", trigger: "change" }],
});
const flagChange = (val: string) => {
  const { fourthParam } = powerTypes.value.find(({ codeValue }) => codeValue === val)!;
  powerStorage.canChoiceNum = Number(fourthParam);
  form.caseArchiveEntity.relationTaskIdFirst = "";
  form.caseArchiveEntity.relationTaskIdSecond = "";
  form.caseArchiveEntity.relationTaskIdThird = "";
  form.caseArchiveEntity.relationTaskIdFourth = "";
  form.caseArchiveEntity.relationTaskIdFifth = "";
  form.caseArchiveEntity.relationTaskIdSixth = "";
  if (form.caseDisposeDto.id !== "") {
    Object.keys(form.caseDisposeDto).forEach((key) => {
      form.caseDisposeDto[key] = "";
    });
    nextTick(() => {
      doneReport.value.empty();
    });
  }
};
const getSearchList = () => {
  powerStorage.tableData = [];
  searchParamsModel.searchParams = searchModel.value;
  caseService.getSearchList(searchParamsModel).then((res) => {
    if (res.code === 200) {
      const { results, pageInfo } = res.data;
      searchParamsModel.pageParams.total = pageInfo.total;
      if (results.length > 0) {
        powerStorage.tableData = results;
      }
    }
  });
};
const handleSelectionChange = (result: CaseInfoModel[]) => {
  powerStorage.choiceTaskId = [];
  if (result.length > powerStorage.canChoiceNum) {
    ElMessage.error("最多选择" + powerStorage.canChoiceNum + "个存电信息！");
    checkTable.value!.toggleRowSelection(result[result.length - 1], false);
  } else {
    if (
      result.some(
        ({ externalNumber }, index) =>
          result.findIndex((U) => U.externalNumber === externalNumber) !== index
      )
    ) {
      ElMessage.error("不能选择相同的外系统编号！");
      return;
    }
    result.forEach((item) => {
      powerStorage.choiceTaskId.push(item.taskId + "");
    });
    powerStorage.checkedList = result;
  }
};
const dialogClose = () => {
  powerStorage.control = false;
  classSelect.value.resetValue();
};
const save = () => {
  caseDisposeDtoForm.value!.validate((isPass) => {
    if (isPass) {
      doneReport.value.checkForm().then((status: boolean) => {
        if (status) {
          form.caseDisposeReportDto = doneReport.value.getFormData();
          form.attachmentInfos = props.attachments;
          form.caseDisposeReportDto.taskId = props.taskId;
          if (form.caseArchiveEntity.id === "") {
            delete form.caseDisposeReportDto.id;
            delete form.caseDisposeDto.id;
          }

          emit("changeLoading", true);
          powerStorageService
            .save(form)
            .then((res) => {
              ElMessage({
                message: res.message,
                type: res.code == 200 ? "success" : "error",
              });
              emit("done");
            })
            .catch(() => emit("done"));
        }
      });
    } else {
      emit("changeSubmit");
    }
  });
};
const relevanceByNo = () => {
  Object.keys(caseInfo).forEach((key) => {
    caseInfo[key] = "";
  });
  searchModel.value[5].value = props.caseInfo.reportPhone;
  if (form.caseArchiveEntity.flag === "") {
    ElMessage.error("请先选择存电标记！");
    return;
  }
  if (form.caseArchiveEntity.flag === "2") {
    ElMessage.error("不合理诉求不用关联工单！");
    return;
  }
  powerStorage.control = true;
  getSearchList();
};
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  getSearchList();
};
const query = () => {
  const [startTime, endTime] = reportTime.value;
  searchModel.value[3].value = startTime;
  searchModel.value[4].value = endTime;
  getSearchList();
};
const relevance = () => {
  const taskIds = powerStorage.choiceTaskId;
  if (taskIds.length < powerStorage.canChoiceNum) {
    ElMessage.error("请选择" + powerStorage.canChoiceNum + "条关联工单！");
    return;
  }
  if (powerStorage.canChoiceNum === 1) {
    form.caseArchiveEntity.relationTaskIdSixth = taskIds[0] || "";
    reportSearchModel.value[0].value = taskIds[0];
  } else if (powerStorage.canChoiceNum === 0) {
  } else {
    form.caseArchiveEntity.relationTaskIdFirst = taskIds[0] || "";
    form.caseArchiveEntity.relationTaskIdSecond = taskIds[1] || "";
    form.caseArchiveEntity.relationTaskIdThird = taskIds[2] || "";
    form.caseArchiveEntity.relationTaskIdFourth = taskIds[3] || "";
    form.caseArchiveEntity.relationTaskIdFifth = taskIds[4] || "";
    form.caseArchiveEntity.relationTaskIdSixth = taskIds[5] || "";
    reportSearchModel.value[0].value = taskIds[4];
  }
  const lastCaseInfo: CaseInfoModel =
    powerStorage.checkedList[powerStorage.checkedList.length - 1];
  Object.keys(lastCaseInfo).forEach((key) => {
    caseInfo[key] = lastCaseInfo[key];
  });
  getReportList();
  powerStorage.control = false;
};
const getCheckedReportValue = ({ checkedValue, secondParams }: EmitProps) => {
  const [firstClass, secondClass, thirdClass] = checkedValue;
  form.caseDisposeDto.firstClass = firstClass;
  form.caseDisposeDto.secondClass = secondClass;
  form.caseDisposeDto.thirdClass = thirdClass;
  console.log("checkedValue", checkedValue, form.caseDisposeDto.firstClass);
};
const setData = (data: any) => {
  Object.keys(form.caseDisposeDto).forEach((key) => {
    form.caseDisposeDto[key] = data[key];
  });
  defaultVale.value = [
    form.caseDisposeDto.firstClass,
    form.caseDisposeDto.secondClass,
    form.caseDisposeDto.thirdClass,
  ];
  form.caseDisposeDto.departmentCode = currentDepartmentCode;
  form.caseDisposeDto.taskId = props.taskId;
  form.caseDisposeDto.fourthClass = "";
  nextTick(() => {
    doneReport.value.getDoneReport12345(form.caseDisposeDto.recordId!);
  });
};
const getReportList = () => {
  reportSearchParamsModel.searchParams = reportSearchModel.value;
  disposeService.getCaseDisposeList(reportSearchParamsModel).then((res) => {
    if (res.code === 200) {
      if (res.data.results.length > 0) {
        setData(res.data.results[0]);
      }
    }
  });
};
const getBackPowerStage = () => {
  backSearchModel.value[0].value = props.taskId;
  backSearchParamsModel.searchParams = backSearchModel.value;
  powerStorageService.searchList(backSearchParamsModel).then((res) => {
    if (res.code === 200) {
      const { results } = res.data;
      if (results.length > 0) {
        const data = results[0];
        Object.keys(form.caseArchiveEntity).forEach((key) => {
          form.caseArchiveEntity[key] = data[key];
        });
        const { fourthParam } = powerTypes.value.find(
          ({ codeValue }) => codeValue === data.flag
        )!;
        powerStorage.canChoiceNum = Number(fourthParam);
        if (powerStorage.canChoiceNum === 1) {
          // 关联存电
          caseInfoSearchModel.value[0].value = data.relationTaskIdSixth;
        } else if (powerStorage.canChoiceNum === 0) {
          // 重复存电
          caseInfoSearchModel.value[0].value = data.relationTaskIdFourth;
        } else {
          const taskIds = [
            data.relationTaskIdFirst,
            data.relationTaskIdSecond,
            data.relationTaskIdThird,
            data.relationTaskIdFourth,
            data.relationTaskIdFifth,
            data.relationTaskIdSixth,
          ].filter((t) => t && t !== "");
          caseInfoSearchModel.value[0].value = taskIds[taskIds.length - 1];
        }
        getBackReportList();
        if (caseInfoSearchModel.value[0].value !== "") {
          getCaseInfo();
        }
      }
    }
  });
};
const getCaseInfo = () => {
  caseInfoSearchParamsModel.searchParams = caseInfoSearchModel.value;
  caseService.getSearchList(caseInfoSearchParamsModel).then((res) => {
    if (res.code === 200) {
      const { results } = res.data;
      if (results.length > 0) {
        const data = results[0];
        Object.keys(data).forEach((key) => {
          caseInfo[key] = data[key];
        });
      }
    }
  });
};
const getBackReportList = () => {
  disposeSearchParamsModel.pageParams.pageIndex = -1;
  disposeSearchParamsModel.searchParams = disposeSearchModel.value;
  disposeService.getCaseDisposeList(disposeSearchParamsModel).then((res) => {
    if (res.code === 200) {
      if (res.data.results.length > 0) {
        const data = res.data.results[0];
        setData(data);
      }
    }
  });
};
nextTick(() => {
  getBackPowerStage();
  if (form.caseArchiveEntity.id === "") {
    form.caseArchiveEntity.person = props.caseInfo.reportPerson;
    searchModel.value[5].value = form.caseArchiveEntity.phone =
      props.caseInfo.reportPhone;
  }
});
const getCheckedValue = ({ checkedValue, secondParams }: EmitProps) => {
  const [firstClass, secondClass, thirdClass] = checkedValue;
  searchModel.value = [
    ...searchModel.value,
    {
      key: "reflectIndustryCode",
      value: firstClass,
      match: "eq",
    },
    {
      key: "reflectClassCode",
      value: secondClass,
      match: "eq",
    },
    {
      key: "reflectContentCode",
      value: thirdClass,
      match: "eq",
    },
  ];
};
watch(
  () => props.submit,
  (val) => {
    val &&
      formRef.value?.validate((valid: any) => {
        if (valid) {
          save();
        } else {
          emit("changeSubmit");
        }
      });
  },
  { deep: true }
);
const IdiomContent = (idContent: string) => {
  form.caseArchiveEntity.description = idContent;
};
</script>
<style scoped lang="scss">
.flex {
  display: flex;
}
</style>
