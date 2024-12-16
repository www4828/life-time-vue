<template>
  <el-dialog
    :model-value="props.showFlag"
    title="关联工单"
    custom-class="concant-dialog"
    width="90%"
    top="100px"
    @close="dialogClose"
  >
    <el-form>
      <el-row :gutter="10">
        <el-col :span="7">
          <el-form-item label="外系统编号">
            <el-input v-model="externalNumber" />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="工单编号">
            <el-input v-model="taskId" />
          </el-form-item>
        </el-col>
        <el-col :span="10" class="buttons">
          <el-button type="primary" @click="query">查询</el-button>
          <el-button type="primary" @click="relevance">关联</el-button>
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
          height="600"
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
          <el-table-column prop="reportTime" label="接报时间" />
          <el-table-column prop="caseTypeName" label="工单类型" />
          <el-table-column prop="businessTypeName" label="业务类型" />
          <el-table-column label="事项类别" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.reflectIndustryName + "-" + scope.row.reflectClassName }}
            </template>
          </el-table-column>
          <el-table-column prop="address" label="发生地址" show-overflow-tooltip />
          <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
          <el-table-column prop="executeDepartmentName" label="承办单位" show-overflow-tooltip />
          <el-table-column prop="flowStateName" label="案件状态" />
        </el-table>
        <div class="footer-box">
          <Pagination
            :currentPage="searchParamsModel.pageParams.pageIndex"
            :pageSize="searchParamsModel.pageParams.pageSize"
            :total="searchParamsModel.pageParams.total"
            :callBack="paginationChange"
            :page-sizes="[5, 10, 20, 30, 50]"
          />
          <el-button type="info" @click="emits('closeDialog')">取消</el-button>
        </div>
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
import { ref, reactive, getCurrentInstance, watch } from "vue";
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
  relationField: string
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
  }
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
  // classSelect.value.resetValue();
};

const handleSelectionChange = (result: CaseInfoModel[]) => {
  related.choiceTaskId = [];
  if (result.length > 4) {
    ElMessage.error("最多选择4个关联工单！");
    checkTable.value!.toggleRowSelection(result[result.length - 1], false);
  } else {
    if(result.length > 1){
      result.map((item,index)=> {
        if(index > 0 && item.externalNumber != result[0].externalNumber ){
          ElMessage.error("只能勾选相同外系统单号工单！");
          checkTable.value!.toggleRowSelection(result[index], false);
        }
      })
      result = result.filter((item,index)=>index === 0 || item.externalNumber === result[0].externalNumber)
    }
    
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
  if(taskId.value || externalNumber.value ){
    getSearchList();
  }else{
    ElMessage.warning('请输入外系统单号或者工单编号查询')
  }
};
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  query();
};
const relevance = () => {
  if (related.choiceTaskId.length === 0) {
    ElMessage.error("请至少关联一个工单！");
    return;
  }
  ElMessage.success("关联成功！");
  proxy.mittBus.emit("getRelatedInfo", {
    taskIds: Array.from(new Set(related.choiceTaskId)) ,
    caseInfo: related.checkedList[0],
    relationField: props.relationField
  });
  emits("closeDialog");
};

const clear = ()=>{
  related.tableData = []
  externalNumber.value = ''
  taskId.value = ''
  related.choiceTaskId = []
  related.checkedList = []
  related.emptyText = "";
  checkTable.value?.clearSelection()
  searchParamsModel.pageParams.total = 0
  // paginationChange({
  //   currentPage: 0,
  //   pageSize: 10
  // })
}
defineExpose({
  clear
})
</script>

<style lang="scss" scoped>
.buttons{
  position: absolute;
  right: 10px;
}
.footer-box{
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
}
</style>
