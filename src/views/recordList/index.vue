<template>
  <div class="wrapper">
    <RoleLayout>
      <template #search>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="4">
              <span class="sh3h-search-lable">预警标题:</span>
              <el-input class="sh3h-search-input" v-model.trim="searchModel[0].value" />
            </el-col>
            <el-col :span="4">
              <!-- <span class="sh3h-search-lable">操作环节:</span>
              <el-input class="sh3h-search-input" v-model.trim="searchModel[1].value" /> -->
            </el-col>
            <el-col :span="12"></el-col>
            <el-col :span="4" class="div-flex-right">
              <el-button type="primary" :icon="Search" @click="getList">搜索</el-button>
            </el-col>
          </el-row>
        </div>
        
      </template>
      <template #table>
        <div class="tableWrapper">
          <div class="tableContent">
            <el-table 
              :data="tableData" 
              style="width: 100%" 
              height="100%"
              :header-cell-style="{ 'text-align': 'center' }" 
              :cell-style="{ 'text-align': 'center' }"
            >
              <el-table-column prop="recordId" label="操作编码" minWidth="10%" />
              <el-table-column prop="warnName" label="预警标题" minWidth="10%" show-overflow-tooltip />
              <el-table-column prop="reportTime" label="执行时间" minWidth="10%" />
              <el-table-column prop="nodeName" label="操作环节" minWidth="10%" />
              <el-table-column prop="caseNum" label="操作案件数量" minWidth="10%" />
              <el-table-column prop="successNum" label="成功数量" minWidth="10%" />
              <el-table-column prop="createUser" label="操作人" minWidth="10%" />
              <el-table-column prop="department" label="所属部门" minWidth="10%" />
              <el-table-column label="操作" minWidth="5%">
                <template #default="scope">
                  <el-link type="primary" @click='clickHandle(scope.row)' >查看详情</el-link>
                </template>
              </el-table-column>
            </el-table>
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
          <Dialog :recordId="recordId" :show-flag="show" @closeDialog="show=false;recordId=''" />
        </div>
      </template>
    </RoleLayout>
  </div>
</template>
<script lang="ts" setup>
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import RoleLayout from '@/components/RoleLayout/RoleLayout.vue'
import { useDepartment } from '@/hooks/useDepartment'
import { reactive, ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import Pagination from "@/components/pagination/index.vue";
import { SearchModel } from "@/api/model/baseModel";
import { CroupVisitModel } from '@/api/model/disposeModel'
import { Response, SearchParamsModel } from "@/api/interface";
import Dialog from './components/dialog.vue'

interface PageInfo {
    currentPage: number;
    pageSize: number;
}

const disposeService = new DisposeService()
const { username } = useDepartment()
const recordId = ref('')
const show = ref(false)

const tableData = ref([])
const searchParamsModel = reactive(new SearchParamsModel<CroupVisitModel>());
const searchModel = ref<SearchModel<CroupVisitModel>[]>([
  {
    key: "warnName",
    value: "",
    match: "like"
  },
  // {
  //   key: "nodeName",
  //   value: "",
  //   match: "like"
  // },
  {
    key: "createUser",
    value: username === 'admin' ? '' : username ,
    match: "eq"
  }
]);

const getList = () => {
  tableData.value = []
  searchParamsModel.searchParams = searchModel.value;
  disposeService.getBatchRecordList(searchParamsModel).then((res) => {
    tableData.value = res.data.results
    searchParamsModel.pageParams.total = res.data.pageInfo.total
  })
}
getList()

const clickHandle = (row: CroupVisitModel) => {
  recordId.value = row.recordId
  show.value = true
};

const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  getList();
};
</script>
<style lang="scss" scoped>
.wrapper {
    width: 100%;
    height: 100%;
}
.sh3h-search-box {
    background-color: var(--sh3h-tree-background-color);
    margin: 0;

    // border: 1px solid var(--sh3h-tree-border-color);
    .search-lable {
        width: 160px;
        height: 100%;
        line-height: 200%;
        font-size: var(--el-font-size-base);
        font-family: var(--sh3h-font-family-normal);
        font-weight: 500;
        float: left;
    }

    .search-input {
        width: calc(100% - 170px);
        height: 100%;
        float: left;
        margin: 0 0 0 10px;
    }

    ::v-deep(.el-date-editor) {
        width: calc(100% - 110px);
        height: 100%;
        float: left;
        // margin: 0 0 0 10px;
    }

    .concatIcon {
        font-size: $font-size-14;
        font-weight: 500;
        margin: 0 5px;
    }
}
.tableWrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    padding: 10px;

    .tableContent {
        flex: 1;
        height: calc(100% - 150px);
    }

    .pageWrapper {
        margin-top: 10px;
    }
}
</style>
