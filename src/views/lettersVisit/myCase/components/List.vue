<template>
  <div class="dispatchWrapper">
    <div class="content">
      <div class="searchContentWrapper">
        <el-form :model="form" class="formContent" label-width="120px">
          <el-form-item label="是否本部门">
            <el-radio-group v-model="form.resource" @change="getAll">
              <el-radio label="1" v-if="form.show">本单位操作</el-radio>
              <el-radio label="2">本部门操作</el-radio>
              <el-radio label="3">本人操作</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <Query @getPrams="getParams" is-x-f :node-code="props.nodeCode" />
      </div>
      <div class="caseWrapper" v-if="caseInfos.length > 0">
        <CaseInfo
          v-for="caseInfo in caseInfos"
          :caseInfo="caseInfo.xfCaseInfo"
          :buttons="getButtons(caseInfo.xfCaseInfo)"
          :key="caseInfo.xfCaseInfo.taskId"
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
import { ref, reactive, getCurrentInstance, onBeforeUnmount } from "vue";
import Pagination from "@/components/pagination/index.vue";
import CaseInfo from "@/businessComponent/CaseInfo/CaseInfoXF.vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import Query from "@/businessComponent/Query/Query.vue";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { useNodeCode } from "@/hooks/useNodeCode";
import { LettersVisitService } from "@/api/service/LettersVisit/LettersVisitService";
import { store } from "@/store";

interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const props = defineProps<{
  nodeCode: NodeCodeKey;
  queryParams: SearchModel<CaseInfoModel>[];
  pageInfo: { pageSize: number; pageIndex: number };
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
const form = reactive({
  resource: "3",
  show: true,
});
if (hasSessionParams()) {
  searchModel.value = getSessionParams(props.nodeCode);
}
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
  description.value = "加载中，请稍后...";
  lettersVisitService
    .getMyCaseList(
      // 'all',
      searchParamsModel,
      form.resource
      // (route.query.flowName as string) || "all"
    )
    .then((res) => {
      if (res.code === 200) {
        const { pageInfo, results } = res.data;
        caseInfos.value = results;
        searchParamsModel.pageParams.total = pageInfo.total;
      }
      description.value = "暂无数据";
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
  if (props.queryParams.length > 0) {
    searchModel.value = props.queryParams;
  }
  let routesList = store.state.routesList.routesList
    .find((item) => item.path === "/lettersVisit")
    ?.children?.map((item) => item.path.split("lettersVisit/")![1]);
  if (
    routesList?.length == 2 &&
    routesList.indexOf("dealwith") > -1 &&
    routesList.indexOf("myCase") > -1
  ) {
    form.show = false;
  }
  // console.log(store.state.routesList.routesList,routesList);
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
    .searchContentWrapper {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      .formContent {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 20px;
        margin-bottom: 10px;
        ::v-deep(.el-form-item) {
          margin-bottom: 0;
          label {
            margin-right: 10px;
          }
        }
      }
    }
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
