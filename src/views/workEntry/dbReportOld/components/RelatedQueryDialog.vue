<template>
  <el-dialog
    :model-value="props.showFlag"
    title="关联工单"
    custom-class="powerStorageDialog"
    width="80%"
    @close="dialogClose"
  >
    <el-form>
      <el-row :gutter="10">
        <el-col :span="7">
          <el-form-item label="工单编号">
            <el-input v-model="taskId" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="外系统编号">
            <el-input v-model="externalNumber" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="联系人">
            <el-input v-model="searchModel[3].value" />
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
            <el-input v-model="searchModel[6].value" />
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
            <el-input v-model="searchModel[7].value" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="问题描述">
            <el-input v-model="searchModel[8].value" />
          </el-form-item>
        </el-col>
        <el-col :span="3" class="div-flex-center flex">
          <el-button type="primary" @click="emits('closeDialog')">取消</el-button>
        </el-col>
      </el-row>
    </el-form>
    <Title title="督办单关联单号查询结果">
      <template #content>
        <el-table
          :data="related.tableData"
          style="width: 100%; margin-bottom: 10px"
          @selection-change="handleSelectionChange"
          :empty-text="related.emptyText"
          height="500"
          row-key="id"
          ref="checkTable"
        >
          <el-table-column reserve-selection type="selection" width="55" />
          <el-table-column label="序号" width="70">
            <template #default="scope">
              <span v-if="related.choiceTaskId.indexOf(scope.row.taskId) + 1 > 0">
                {{ related.choiceTaskId.indexOf(scope.row.taskId) + 1 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="工单编号">
            <template #default="scope">
              <el-link
                @click="jumpToDetail(scope.row.taskId)"
                type="primary"
                :underline="false"
              >
                {{ scope.row.taskId || "" }}</el-link
              >
            </template>
          </el-table-column>
          <el-table-column label="外系统编号">
            <template #default="scope">
              <el-link
                @click="jumpToOldDetail(scope.row.externalNumber)"
                type="primary"
                :underline="false"
              >
                {{ scope.row.externalNumber || "" }}</el-link
              >
            </template>
          </el-table-column>
          <el-table-column prop="reportTime" label="接报时间" />
          <el-table-column prop="caseTypeName" label="工单类型" />
          <el-table-column prop="businessTypeName" label="业务类型" />
          <el-table-column label="事项类别">
            <template #default="scope">
              {{ scope.row.reflectIndustryName + "-" + scope.row.reflectClassName }}
            </template>
          </el-table-column>
          <el-table-column prop="address" label="发生地址" />
          <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
          <el-table-column prop="executeDepartmentName" label="承办单位" />
          <el-table-column prop="flowStateName" label="案件状态" />
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
<script lang="ts" setup>
import dayjs from "dayjs";
import Title from "@/components/Title/Title.vue";
import { ElMessage, ElTable } from "element-plus";
import { SearchModel } from "@/api/model/baseModel";
import { SearchParamsModel } from "@/api/interface";
import { useDepartment } from "@/hooks/useDepartment";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import { ref, reactive, getCurrentInstance } from "vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import Pagination from "@/components/pagination/index.vue";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";

interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const props = defineProps<{
  showFlag: boolean;
}>();
const emits = defineEmits(["closeDialog"]);
const classSelect = ref();
const checkTable = ref();
const caseService = new CaseService();
const { proxy } = <any>getCurrentInstance()!;
const { jumpToOldDetail, jumpToDetail } = useCaseDetail();
const { currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const reportTime = ref<string[]>([
  dayjs().subtract(6, "M").format("YYYY-MM-DD"),
  dayjs().format("YYYY-MM-DD"),
]);
const taskId = ref("");
const externalNumber = ref("");
const searchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const searchModel = ref<SearchModel<CaseInfoModel>[]>([
  {
    match: "orderByDesc",
    key: "",
    value: "reportTime",
  },
  {
    match: "in",
    key: "taskId",
    value: "",
  },
  {
    match: "in",
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
    value: dayjs().subtract(6, "M").format("YYYY-MM-DD"),
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
    key: "eventSourceCode",
    value: "1",
  },
]);
const related = reactive<{
  tableData: any[];
  choiceTaskId: string[];
  checkedList: CaseInfoModel[];
  emptyText: string;
}>({
  tableData: [],
  choiceTaskId: [],
  checkedList: [],
  emptyText: "",
});
const dialogClose = () => {
  emits("closeDialog");
  classSelect.value.resetValue();
};

const handleSelectionChange = (result: CaseInfoModel[]) => {
  related.choiceTaskId = [];
  if (result.length > 4) {
    ElMessage.error("最多选择4个关联工单！");
    checkTable.value!.toggleRowSelection(result[result.length - 1], false);
  } else {
    result.forEach((item) => {
      related.choiceTaskId.push(item.taskId + "");
    });
    related.checkedList = result;
  }
};
const getSearchList = () => {
  related.tableData = [];
  related.emptyText = "加载中...";
  const queryTaskType = taskId.value.split(",").length > 1 ? "in" : "like";
  const queryExternalNumberType =
    externalNumber.value.split(",").length > 1 ? "in" : "like";
  searchModel.value[1].match = queryTaskType;
  searchModel.value[1].value = taskId.value.split(",").join(",");
  searchModel.value[2].match = queryExternalNumberType;
  searchModel.value[2].value = externalNumber.value.split(",").join(",");
  searchParamsModel.searchParams = searchModel.value;
  caseService.getSearchList(searchParamsModel).then((res) => {
    if (res.code === 200) {
      const { results, pageInfo } = res.data;
      searchParamsModel.pageParams.total = pageInfo.total;
      if (results.length > 0) {
        related.tableData = results;
      } else {
        related.emptyText = "暂无数据";
      }
    }
  });
};
const query = () => {
  const [startTime, endTime] = reportTime.value;
  searchModel.value[4].value = startTime;
  searchModel.value[5].value = endTime;
  getSearchList();
};
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  getSearchList();
};
const relevance = () => {
  if (related.choiceTaskId.length === 0) {
    ElMessage.error("请至少关联一个工单！");
    return;
  }
  ElMessage.success("关联成功！");
  proxy.mittBus.emit("getRelatedInfo", {
    taskIds: related.choiceTaskId,
    caseInfo: related.checkedList[0],
    relationField: 'relationTaskIdFirst'
  });
  emits("closeDialog");
};
const getCheckedValue = ({ checkedValue, secondParams }: EmitProps) => {
  const [firstClass, secondClass, thirdClass] = checkedValue;
  const taskId = searchModel.value[1].value;
  const externalNumber = searchModel.value[2].value;
  const defaultSearchModel: SearchModel<CaseInfoModel>[] = [
    {
      match: "orderByDesc",
      key: "",
      value: "reportTime",
    },
    {
      match: taskId!.split(",").length > 1 ? "like" : "in",
      key: "taskId",
      value: taskId,
    },
    {
      match: externalNumber!.split(",").length > 1 ? "like" : "in",
      key: "externalNumber",
      value: externalNumber,
    },
    {
      match: "like",
      key: "reportPerson",
      value: "",
    },
    {
      match: "gt",
      key: "reportTime",
      value: searchModel.value[4].value,
    },
    {
      match: "lt",
      key: "reportTime",
      value: searchModel.value[5].value,
    },
    {
      match: "like",
      key: "contactPhone",
      value: searchModel.value[6].value,
    },
    {
      match: "like",
      key: "address",
      value: searchModel.value[7].value,
    },
    {
      match: "like",
      key: "description",
      value: searchModel.value[8].value,
    },
    {
      match: "eq",
      key: "eventSourceCode",
      value: "1",
    },
  ];
  if (checkedValue.length === 0) {
    searchModel.value = defaultSearchModel;
  } else {
    searchModel.value = [
      ...defaultSearchModel,
      {
        key: "reflectIndustryCode",
        value: firstClass || "",
        match: "eq",
      },
      {
        key: "reflectClassCode",
        value: secondClass || "",
        match: "eq",
      },
      {
        key: "reflectContentCode",
        value: thirdClass || "",
        match: "eq",
      },
    ];
  }
};
</script>

<style lang="scss" scoped></style>
