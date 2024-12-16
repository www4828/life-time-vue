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
          <el-col :span="8">
            <el-form-item label="存电标记" prop="flag">
              <el-select v-model="form.caseArchiveEntity.flag" filterable>
                <el-option
                  v-for="item in powerTypes"
                  :label="item.codeName"
                  :value="item.codeValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来电人" prop="person">
              <el-input v-model="form.caseArchiveEntity.person" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系方式" prop="phone">
              <el-input v-model="form.caseArchiveEntity.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
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
          <el-col :span="8">
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
          <el-col :span="8">
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
        </el-row>
        <el-row>
          <el-col :span="8">
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
          <el-col :span="8">
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
          <el-col :span="8">
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
          />
        </el-form-item>
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
      <ContactFirst
        :task-id="props.taskId"
        v-if="caseInfo.eventSourceCode == '1' "
        type="联系市民"
        isChoice
        @get-result="getResult"
        :is-only-look="props.name === '审核'"
      />
      <Title title="处置办结">
        <template #content>
          <el-form
            :model="form.caseDispose"
            class="from"
            ref="caseDisposeDtoForm"
            :rules="disposeRules"
          >
            <el-row>
              <el-col :span="6">
                <el-form-item label="处理结果" prop="result">
                  <el-select v-model="form.caseDispose.result" filterable>
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
                  <el-input v-model="form.caseDispose.person"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="处理时间" prop="time">
                  <el-date-picker
                    v-model="form.caseDispose.time"
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
                v-model="form.caseDispose.description"
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
            :is-reasonable="isReasonable"
            :taskId="doneReportTaskId"
            :case-info="caseInfo"
            :businessType="props.businessType"
          />
        </template>
      </Title>
      <Title :title="'存电' + props.name">
        <template #content>
          <el-form
            :model="form.caseArchiveCheckEntity"
            class="from"
            ref="caseArchiveCheckEntityForm"
            :rules="checkRules"
          >
            <el-row>
              <el-col :span="6">
                <el-form-item label="是否同意" prop="result">
                  <el-select
                    v-model="form.caseArchiveCheckEntity.result"
                    filterable
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="type in PowerStorageCheckTypes"
                      :label="type.codeName"
                      :value="type.codeValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :label="props.name + '操作员'">{{
                  form.caseArchiveCheckEntity.person
                }}</el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :label="props.name + '时间'">{{
                  form.caseArchiveCheckEntity.time
                }}</el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="意见说明" prop="content">
              <el-input
                @dblclick="showDialog"
                v-model="form.caseArchiveCheckEntity.content"
                :autosize="{ minRows: 2, maxRows: 4 }"
                maxlength="500"
                show-word-limit
                type="textarea"
              />
            </el-form-item>
            <IdiomDialog
              :node-code="props.nodeCode"
              :show-flag="idiomControl"
              @close-dialog="closeDialog"
              @get-idiom-content="IdiomContent"
              ref="idiomRef"
            />
            <Idiom :node-code="props.nodeCode" @idiomContentText="IdiomContent"></Idiom>
          </el-form>
        </template>
      </Title>
    </template>
  </Title>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import DoneReport from "./DoneReport.vue";
import { useCode } from "@/hooks/useCode";
import { useIdiom } from "@/hooks/useIdiom";
import { reactive, ref, nextTick } from "vue";
import Title from "@/components/Title/Title.vue";
import { SearchModel } from "@/api/model/baseModel";
import { SearchParamsModel } from "@/api/interface";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import { useDepartment } from "@/hooks/useDepartment";
import { FormRules, FormInstance } from "element-plus";
import { FlowModel } from "@/api/model/endCheckModel";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { DisposeReportFormModel } from "@/api/model/disposeModel";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { PowerStorageService } from "@/api/service/PowerStorage/PowerStorageService";
import { CaseArchiveCheckModel, CaseArchiveEntity } from "@/api/model/powerStorageModel";
import { ContactModel } from "@/api/model/disposeModel";
import { isEmpty } from "lodash-es";
import ContactFirst from "@/views/done/components/ContactFirst.vue";

interface Result {
  row: ContactModel;
  sourceData: ContactModel[];
}

const props = defineProps<{
  taskId: string;
  name: string;
  nodeCode: NodeCodeKey;
  businessType: string
}>();

const doneReport = ref();
const formRef = ref<FormInstance>();
const defaultVale = ref<string[]>([]);
const caseService = new CaseService();
const disposeService = new DisposeService();
const { jumpToDetail } = useCaseDetail();
const isReasonable = ref(false);
const caseInfo = reactive({}) as CaseInfoModel;
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const { powerTypes, resultTypes, PowerStorageCheckTypes } = useCode();
const caseDisposeDtoForm = ref<FormInstance>();
const doneReportTaskId = ref(props.taskId);
const caseArchiveCheckEntityForm = ref<FormInstance>();
const powerStorageService = new PowerStorageService();
const {
  name,
  currentDepartmentCode,
  currentDepartmentLevel,
  departmentList,
} = useDepartment();
const form = reactive<CaseArchiveCheckModel>({
  attachmentInfos: [],
  caseArchiveEntity: {} as CaseArchiveEntity,
  caseDispose: {
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
  departmentVo: departmentList[0],
  flowModel: {} as FlowModel,
  caseArchiveCheckEntity: {
    result: "",
    archiveId: "",
    content: "",
    person: name,
    recordId: "",
    time: dayjs().format("YYYY-MM-DD HH:mm"),
    taskId: props.taskId,
  },
});
const relations = ref<ContactModel[]>([]);
const caseInfoSearchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const caseInfoSearchModel = ref<SearchModel<CaseInfoModel>[]>([
  {
    key: "taskId",
    value: "",
    match: "eq",
  },
]);
const searchParamsModel = reactive(new SearchParamsModel<CaseArchiveEntity>());
const searchModel = ref<SearchModel<CaseArchiveEntity>[]>([
  {
    key: "taskId",
    value: props.taskId,
    match: "eq",
  },
  {
    key: "recordId",
    value: "",
    match: "eq",
  },
]);

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
  firstClass: [{ required: true, message: "事项类别不能为空", trigger: "change" }],
  time: [{ required: true, message: "处理时间不能为空", trigger: "change" }],
});
const checkRules = reactive<FormRules>({
  result: [{ required: true, message: "审核结果不能为空", trigger: "change" }],
  content: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
});
const getCheckedReportValue = ({ checkedValue, secondParams }: EmitProps) => {
  const [firstClass, secondClass, thirdClass] = checkedValue;
  form.caseDispose.firstClass = firstClass;
  form.caseDispose.secondClass = secondClass;
  form.caseDispose.thirdClass = thirdClass;
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
const getReportList = () => {
  disposeService
    .getCaseDisposeByTaskId(props.taskId, currentDepartmentCode)
    .then((res) => {
      if (res.code === 200) {
        if (res.data.length > 0) {
          const data = res.data[0];
          Object.keys(form.caseDispose).forEach((key) => {
            form.caseDispose[key] = data[key];
          });
          defaultVale.value = [
            form.caseDispose.firstClass,
            form.caseDispose.secondClass,
            // form.caseDispose.thirdClass,
          ];
          form.caseDispose.departmentCode = currentDepartmentCode;
          form.caseDispose.fourthClass = "";
          form.caseDispose.taskId = props.taskId;
          doneReport.value.getDoneReport12345(form.caseDispose.recordId!);
          searchModel.value[1].value = form.caseDispose.recordId!;
        }
      }
    });
};
const getPowerStageInfo = () => {
  searchParamsModel.pageParams.pageIndex = -1;
  searchParamsModel.searchParams = searchModel.value;
  powerStorageService.searchList(searchParamsModel).then((res) => {
    if (res.code === 200) {
      if (res.data.results.length > 0) {
        const data = res.data.results[0];
        Object.keys(data).forEach((key) => {
          form.caseArchiveEntity[key] = data[key];
        });
        if (data.flag === "1") {
          caseInfoSearchModel.value[0].value = data.relationTaskIdSixth;
        } else if (data.flag === "0") {
          caseInfoSearchModel.value[0].value = data.relationTaskIdFifth;
        } else {
          isReasonable.value = true;
          caseInfoSearchModel.value[0].value = props.taskId;
        }
        getCaseInfo();
        form.caseArchiveCheckEntity.recordId = form.caseDispose.recordId!;
        form.caseArchiveCheckEntity.archiveId = data.id;
      }
    }
  });
};
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
    relations.value = sourceData;
  }
};
const IdiomContent = (idContent: string) => {
  form.caseArchiveCheckEntity.content = idContent;
};
nextTick(() => {
  getPowerStageInfo();
  getReportList();
});

defineExpose({
  getPowerStageForm() {
    return form.caseArchiveEntity;
  },
  getCaseDisposeForm() {
    return form.caseDispose;
  },
  getCaseDisposeReportRef() {
    return doneReport.value;
  },
  getCheckRef() {
    return caseArchiveCheckEntityForm.value;
  },
  getFormData() {
    return form.caseArchiveCheckEntity;
  },
  powerStageRef() {
    return formRef.value;
  },
  caseDisposeRef() {
    return caseDisposeDtoForm.value;
  },
  getRelations() {
    return relations.value;
  },
});
</script>
<style scoped lang="scss">
.flex {
  display: flex;
}
</style>
