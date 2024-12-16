<template>
  <div class="dispatchWrapper">
    <div class="content">
      <div class="searchWrapper">
        <el-button :icon="Search" @click="search" />
        <el-select
          v-model="keywords"
          multiple
          filterable
          allow-create
          placeholder="请选择条件"
        >
          <el-option
            v-for="option in options"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-link type="primary" :underline="false" class="highSearch">高级搜索</el-link>
      </div>
      <Scrollbar class="caseWrapper" v-if="caseInfos.length > 0">
        <CaseInfo
          v-for="caseInfo in caseInfos"
          :caseInfo="caseInfo"
          :buttons="getButtons(caseInfo)"
          :key="caseInfo.taskId"
          :tagsAndWaterMarks="markIcons[caseInfo.taskId]"
        ></CaseInfo>
      </Scrollbar>
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
import Scrollbar from "@/components/scrollbar/index.vue";
import Pagination from "@/components/pagination/index.vue";
import { Search } from "@element-plus/icons-vue";
import { ref, reactive } from "vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { useNodeCode } from "@/hooks/useNodeCode";
import { CallBackModel } from "@/api/model/callBackModel";
import { CallBackService } from "@/api/service/CaseCallBack/CallBackService";
import { useMarkIconAll } from "@/hooks/useMarkIcon";

type Key = keyof CaseInfoModel;
interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const options = [
  {
    label: "工单编号",
    value: "taskId",
  },
  {
    label: "发生地址",
    value: "address",
  },
  {
    label: "问题描述",
    value: "description",
  },
];
const { nodeCode } = useNodeCode();
const keywords = ref<Key[]>([]);
const caseService = new CaseService();
const callBackService = new CallBackService();
const caseInfos = ref<CaseInfoModel[]>([]);
const searchParamsModel = reactive(new SearchParamsModel<CallBackModel>());
const searchModel = ref<SearchModel<CallBackModel>[]>([
  // {
  //   key: "create_time",
  //   value: "create_time",
  //   match: "orderByDesc",
  // },
]);
const getButtons = (caseInfo: CaseInfoModel) => {
  return [
    {
      name: "回访",
      text: "回访",
      id: "1",
      taskId: String(caseInfo.taskId),
    },
    //   {
    //     name: "销单",
    //     text: "销单",
    //     id: "2",
    //     taskId: caseInfo.taskId,
    //   },
  ];
};
const markIcons:any = ref({})
const getAll = () => {
  caseInfos.value = [];
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = 5;
  callBackService.getOperateList(searchParamsModel).then(async (res) => {
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
const search = () => {
  // const [key, value] = keywords.value;
  // searchModel.value = [
  //     {
  //         key,
  //         value: value ? String(value) : "",
  //         match: "like",
  //     },
  //     {
  //         key: "create_time",
  //         value: "create_time",
  //         match: "orderByDesc",
  //     },
  // ];
  // getAll();
};
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = 5;
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

    .searchWrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;

      ::v-deep(.el-select) {
        width: 200px;
        margin-left: -5px;

        .el-select__tags {
          & > span {
            display: flex;
          }
        }
      }

      .highSearch {
        margin-left: 10px;
        margin-right: 20px;
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
    }
  }

  .pageWrapper {
    margin-top: 10px;
  }
}
</style>
