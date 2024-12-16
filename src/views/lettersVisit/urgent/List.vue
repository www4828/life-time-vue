<template>
  <div class="dispatchWrapper">
    <div class="content">
      <Query @getPrams="getParams" :node-code="props.nodeCode" />
      <div class="caseWrapper" v-if="caseInfos.length > 0">
        <CaseInfo
          v-for="caseInfo in caseInfos"
          :caseInfo="caseInfo"
          :buttons="caseInfo.buttonInfo"
          :key="caseInfo.taskId"
        ></CaseInfo>
      </div>
      <div class="wrapper" v-else>
        <el-empty :description="description" />
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
import { useRoute } from "vue-router";
import { ref, reactive, getCurrentInstance, onBeforeUnmount, watch } from "vue";
import Pagination from "@/components/pagination/index.vue";
import CaseInfo from "@/businessComponent/CaseInfo/CaseInfoXF.vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import Query from "@/businessComponent/Query/Query.vue";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { useNodeCode } from "@/hooks/useNodeCode";
import { LettersVisitService } from "@/api/service/LettersVisit/LettersVisitService";
import { useMarkIconAll } from "@/hooks/useMarkIcon";

interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const props = defineProps<{
  nodeCode: NodeCodeKey;
  queryParams: SearchModel<CaseInfoModel>[];
  pageInfo: { pageSize: number; pageIndex: number };
  getFlag: boolean
}>();
const route = useRoute();
const timer = ref<null | NodeJS.Timer>(null);
const description = ref("暂无数据");
const { getSortByNodeCode, hasSessionParams, getSessionParams } = useNodeCode();
const emit = defineEmits(["queyParams", "changePageInfo"]);
const { proxy } = <any>getCurrentInstance()!;
const lettersVisitService = new LettersVisitService();
const caseInfos = ref<CaseInfoModel[]>([]);
const searchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const searchModel = ref<SearchModel<CaseInfoModel>[]>([
  ...getSortByNodeCode(props.nodeCode),
]);
if (hasSessionParams()) {
  searchModel.value = getSessionParams(props.nodeCode);
}
// const markIcons:any = ref({})
const getAll = () => {
  caseInfos.value = [];
  searchParamsModel.searchParams = searchModel.value;
  description.value = "加载中，请稍后...";
  lettersVisitService
    .getSearchList(searchParamsModel)
    .then(async (res) => {
      if (res.code === 200) {
        const { pageInfo, results } = res.data;
        caseInfos.value = results;
        caseInfos.value.forEach((item: any) => {
          item.buttonInfo=[{
            id: item.taskId,
            taskId: item.taskId,
            code: 'C219',
            name: '反馈'
          }]
        });
        searchParamsModel.pageParams.total = pageInfo.total;
      }
      description.value = "暂无数据";
    });
};
const getParams = (result: SearchModel<CaseInfoModel>[]) => {
  searchModel.value = result;
  emit("queyParams", result);
  // getAll();
};
proxy.mittBus.on("advParams", getParams);
onBeforeUnmount(() => {
  proxy.mittBus.off("advParams");
  if (timer.value) {
    clearInterval(Number(timer.value));
  }
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
  getAll()
};
init();
 watch(
  ()=>props.getFlag,
  ()=>{
    props.getFlag && getAll()
  }
  )
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
