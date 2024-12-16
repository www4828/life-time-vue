<template>
  <div class="dispatchWrapper">
    <div class="content">
      <Query @getPrams="getParams" :node-code="nodeCode" export />
      <div class="caseWrapper" v-if="caseInfos.length > 0">
        <CaseInfo
          v-for="caseInfo in caseInfos"
          :caseInfo="caseInfo.caseInfo"
          :buttons="getButtons(caseInfo.caseInfo)"
          :key="caseInfo.caseInfo.taskId"
          :tagsAndWaterMarks="markIcons[caseInfo.caseInfo.taskId]"
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
import { ref, reactive, getCurrentInstance, onBeforeUnmount } from "vue";
import CaseInfo from "@/businessComponent/CaseInfo/CaseInfo.vue";
import Pagination from "@/components/pagination/index.vue";
import Query from "@/businessComponent/Query/Query.vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { useNodeCode } from "@/hooks/useNodeCode";
import { useRoute } from "vue-router";
import { useMarkIconAll } from "@/hooks/useMarkIcon";

interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const props = defineProps<{
  pageInfo: { pageSize: number; pageIndex: number };
  queryParams: SearchModel<CaseInfoModel>[];
}>();
const route = useRoute();
const emit = defineEmits(["changePageInfo", "queyParams"]);
const caseService = new CaseService();
const { proxy } = <any>getCurrentInstance()!;
const caseInfos = ref<CaseInfoModel[]>([]);
const { nodeCode, getSortByNodeCode, hasSessionParams, getSessionParams } = useNodeCode();
const searchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const searchModel = ref<SearchModel<CaseInfoModel>[]>([...getSortByNodeCode(nodeCode)]);
if (hasSessionParams()) {
  searchModel.value = getSessionParams(nodeCode);
}
const markIcons:any = ref({})
const getButtons = (caseInfo: CaseInfoModel) => {
  return [
    {
      name: "案件详情",
      text: "案件详情",
      id: "1",
      taskId: String(caseInfo.taskId),
    },
  ];
};
const getAll = () => {
  caseInfos.value = [];
  searchParamsModel.searchParams = searchModel.value;
  caseService
    .getApprovedList(
      searchParamsModel,
      nodeCode,
      (route.query.flowName as string) || "all"
    )
    .then(async (res) => {
      if (res.code === 200) {
        const { pageInfo, results } = res.data;
        caseInfos.value = results;
        searchParamsModel.pageParams.total = pageInfo.total;
        let taskIdList = caseInfos.value.map((item: any) => item.caseInfo.taskId);
        if(taskIdList.length > 0){
          markIcons.value = await useMarkIconAll(taskIdList);
        }
      }
    });
};
const getParams = (result: SearchModel<CaseInfoModel>[]) => {
  searchModel.value = result;
  emit("queyParams", result);
  getAll();
};
proxy.mittBus.on("advParams", getParams);
onBeforeUnmount(() => {
  proxy.mittBus.off("advParams");
});
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  emit("changePageInfo", {
    pageIndex: pageInfo.currentPage,
    pageSize: pageInfo.pageSize,
  });
  getAll();
};
const init = () => {
  searchParamsModel.pageParams.pageIndex = props.pageInfo.pageIndex;
  searchParamsModel.pageParams.pageSize = props.pageInfo.pageSize;
  if (props.queryParams.length > 0) {
    searchModel.value = props.queryParams;
  }
};
init();
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
