<template>
  <div class="dispatchWrapper">
    <div class="content">
      <div class="searchContentWrapper">
        <el-form :model="form" class="formContent" label-width="120px">
          <el-form-item label="是否本部门">
            <el-radio-group v-model="form.resource">
              <el-radio label="1">本部门操作</el-radio>
              <el-radio label="0">本人操作</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <Query @getPrams="getParams" is-my-query :node-code="nodeCode" />
      </div>

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
import { useNodeCode } from "@/hooks/useNodeCode";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import Query from "@/businessComponent/Query/MyListQuery.vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import Pagination from "@/components/pagination/index.vue";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import CaseInfo from "@/businessComponent/CaseInfo/CaseInfo.vue";
import { ref, reactive, getCurrentInstance, onBeforeUnmount, watch } from "vue";
import { useMarkIconAll } from "@/hooks/useMarkIcon";

const emit = defineEmits(["queyParams", "changePageInfo"]);
const props = defineProps<{
  pageInfo: { pageSize: number; pageIndex: number };
  queryParams: SearchModel<CaseInfoModel>[];
}>();
interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const description = ref("暂无数据");
const caseService = new CaseService();
const { proxy } = <any>getCurrentInstance()!;
const caseInfos = ref<CaseInfoModel[]>([]);
const { nodeCode, getSortByNodeCode, hasSessionParams, getSessionParams } = useNodeCode();
const searchParamsModel = reactive(new SearchParamsModel<CaseInfoModel>());
const searchModel = ref<SearchModel<CaseInfoModel>[]>([...getSortByNodeCode(nodeCode)]);
const form = reactive({
  resource: "0",
});
if (hasSessionParams()) {
  searchModel.value = getSessionParams(nodeCode);
}
const getButtons = (caseInfo: CaseInfoModel) => {
  return [
    {
      name: "案件详情",
      id: "1",
      taskId: String(caseInfo.taskId),
    },
  ];
};
const markIcons:any = ref({})
const getAll = () => {
  caseInfos.value = [];
  searchParamsModel.searchParams = searchModel.value.filter(item=>item.key !== 'createTime' );
  searchParamsModel.otherParams = searchModel.value.filter(item=>item.key === 'createTime' )
  description.value = "加载中，请稍后...";
  caseService.getMyList(searchParamsModel, form.resource).then(async (res) => {
    if (res.code === 200) {
      const { pageInfo, results } = res.data;
      caseInfos.value = results;
      searchParamsModel.pageParams.total = pageInfo.total;
      let taskIdList = caseInfos.value.map((item: any) => item.caseInfo.taskId);
      if(taskIdList.length > 0){
        markIcons.value = await useMarkIconAll(taskIdList);
      }
    }
    description.value = "暂无数据";
  });
};
const getParams = (result: SearchModel<CaseInfoModel>[]) => {
  searchModel.value = [...result];
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
watch(() => form.resource, getAll);
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
