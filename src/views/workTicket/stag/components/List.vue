<template>
  <div class="dispatchWrapper">
    <div class="content">
      <Query @getPrams="getParams" :node-code="nodeCode" />
      <div class="caseWrapper" v-if="caseInfos.length > 0">
        <CaseInfo
          v-for="caseInfo in caseInfos"
          :caseInfo="caseInfo"
          :buttons="getButtons(caseInfo)"
          :key="caseInfo.taskId"
          :tagsAndWaterMarks="markIcons[caseInfo.taskId]"
        ></CaseInfo>
      </div>
      <div class="wrapper" v-else>
        <el-empty description="暂无数据" />
      </div>
    </div>
    <div class="pageWrapper">
      <Pagination
        :currentPage="searchParamsModel.pageParams.pageIndex"
        :pageSize="searchParamsModel.pageParams.pageSize"
        :total="searchParamsModel.pageParams.total"
        :callBack="paginationChange"
        :page-sizes="[5, 10, 20, 30, 50]"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import CaseInfo from "@/businessComponent/CaseInfo/CaseInfo.vue";
import Pagination from "@/components/pagination/index.vue";
import { ref, reactive, getCurrentInstance, onBeforeUnmount } from "vue";
import { CaseInfoModel, ButtonInfoModel } from "@/api/model/dispatchModel";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { useNodeCode } from "@/hooks/useNodeCode";
import { useDepartment } from "@/hooks/useDepartment";
import Query from "@/businessComponent/Query/Query.vue";
import { useMarkIconAll } from "@/hooks/useMarkIcon";

const emit = defineEmits(["changePageInfo", "queyParams"]);
const props = defineProps<{
  pageInfo: { pageSize: number; pageIndex: number };
  queryParams: SearchModel<CaseInfoModel>[];
}>();
interface PageInfo {
  currentPage: number;
  pageSize: number;
}

const { nodeCode, getSortByNodeCode, hasSessionParams, getSessionParams } = useNodeCode();
const caseService = new CaseService();
const { currentDepartmentCode } = useDepartment();
const { proxy } = <any>getCurrentInstance()!;
const caseInfos = ref<CaseInfoModel[]>([]);
const searchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const searchModel = ref<SearchModel<CaseInfoModel>[]>([
  {
    key: "flowState",
    match: "eq",
    value: nodeCode,
  },
  {
    key: "reportDepartmentCode",
    match: "eq",
    value: currentDepartmentCode,
  },
  ...getSortByNodeCode(nodeCode),
]);
if (hasSessionParams()) {
  searchModel.value = getSessionParams(nodeCode, [
    {
      key: "flowState",
      match: "eq",
      value: nodeCode,
    },
    {
      key: "reportDepartmentCode",
      match: "eq",
      value: currentDepartmentCode,
    },
  ]);
}
const getButtons = (caseInfo: CaseInfoModel): ButtonInfoModel[] => {
  return [
    {
      name: "派遣",
      id: "1",
      taskId: String(caseInfo.taskId),
    },
    {
      name: "销单",
      id: "2",
      taskId: String(caseInfo.taskId),
    },
  ];
};
const markIcons:any = ref({})
const getAll = () => {
  caseInfos.value = [];
  searchParamsModel.searchParams = searchModel.value;
  caseService.list(searchParamsModel).then(async (res) => {
    if (res.code === 200) {
      const { pageInfo, results } = res.data;
      caseInfos.value = results;
      searchParamsModel.pageParams.total = pageInfo.total;
      let taskIdList = caseInfos.value.map((item: any) => item.taskId);
      if(taskIdList.length > 0){
        markIcons.value = await useMarkIconAll(taskIdList);
      }
    }
  });
};
const getParams = (result: SearchModel<CaseInfoModel>[]) => {
  searchModel.value = [
    ...result,
    {
      key: "flowState",
      match: "eq",
      value: nodeCode,
    },
    {
      key: "reportDepartmentCode",
      match: "eq",
      value: currentDepartmentCode,
    },
  ];
  emit("queyParams", searchModel.value);
  getAll();
};
proxy.mittBus.on("advParams", getParams);
onBeforeUnmount(() => {
  proxy.mittBus.off("advParams");
});
const init = () => {
  searchParamsModel.pageParams.pageIndex = props.pageInfo.pageIndex;
  searchParamsModel.pageParams.pageSize = props.pageInfo.pageSize;
  if (props.queryParams.length > 0) {
    searchModel.value = props.queryParams;
  }
};
init();
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  emit("changePageInfo", {
    pageIndex: pageInfo.currentPage,
    pageSize: pageInfo.pageSize,
  });
  getAll();
};
getAll();
</script>

<style lang="scss" scoped>
.dispatchWrapper {
  display: flex;
  flex-direction: column;
  background-color: var(--sh3h-head-font-color);
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  .content {
    flex: 1;
    height: calc(100% - 70px);

    .wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 10px;
      height: calc(100% - 50px);
    }
    .caseWrapper {
      // padding-top: 20px;
      height: calc(100% - 60px);
      overflow-y: auto;
    }
  }
  .pageWrapper {
    margin-top: 10px;
  }
}
</style>
