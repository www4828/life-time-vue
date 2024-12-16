<template>
  <div class="wrapper">
    <RoleLayout>
      <template #search>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="4">
              <span class="sh3h-search-lable">导出人:</span>
              <el-input class="sh3h-search-input" v-model.trim="searchModel.userId" />
            </el-col>
            <el-col :span="5">
            </el-col>
            <el-col :span="11"></el-col>
            <el-col :span="4" class="div-flex-right">
              <el-button type="primary" :icon="Search" @click="getHistoryExportList">搜索</el-button>
              <el-button type="success" :icon="Refresh" @click="getHistoryExportList">刷新</el-button>
            </el-col>
          </el-row>
        </div>
      </template>
      <template #table>
        <div class="tableWrapper">
          <div class="tableContent">
            <el-table :data="tableData" style="width: 100%" height="100%" :header-cell-style="{ 'text-align': 'center' }" :cell-style="{ 'text-align': 'center' }">
              <el-table-column prop="jobName" label="导出任务名称" minWidth="10%" />
              <el-table-column prop="status" label="执行状态" minWidth="10%">
                <template #default="scope">
                  {{ scope.row.status == 1 ? '成功' : '失败' }}
                </template>
              </el-table-column>
              <el-table-column prop="runTime" label="执行时间" minWidth="10%" />
              <el-table-column prop="fileName" label="文件名称" minWidth="20%" />
              <el-table-column prop="userId" label="导出人" minWidth="10%" />
              <el-table-column prop="deptName" label="导出部门" minWidth="10%" />
              <el-table-column label="操作" minWidth="5%">
                <template #default="scope">
                  <el-link type="primary" @click="exportFile(scope.row.downloadUrl,scope.row.fileName)" >下载</el-link>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pageWrapper">
            <Pagination :currentPage="searchModel.pageIndex + 1"
              :pageSize="searchModel.pageSize" :total="total"
              :callBack="paginationChange" layout="prev,pager,next,slot" />
          </div>
        </div>
      </template>
    </RoleLayout>
  </div>
</template>
<script lang="ts" setup>
import { CaseService } from '@/api/service/WorkTicket/CaseService'
import RoleLayout from '@/components/RoleLayout/RoleLayout.vue'
import { useDepartment } from '@/hooks/useDepartment'
import { ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import Pagination from "@/components/pagination/index.vue";

interface PageInfo {
    currentPage: number;
    pageSize: number;
}

const caseService = new CaseService()
const { currentDepartmentCode, username } = useDepartment()

const tableData = ref([])
const searchModel = ref({
  deptCode: currentDepartmentCode,
  userId: username,
  pageIndex: 0,
  pageSize: 10,
})
const total = ref()
const getHistoryExportList = () => {
  tableData.value = []
  caseService.getDownloadLog(searchModel.value).then((res) => {
    tableData.value = res.data.content
    total.value = res.data.totalElements
  })
}
getHistoryExportList()

const exportFile = (url: string, fileName: string) => {
  let a = document.createElement("a");
  a.style.display = "none"; // 创建一个隐藏的a标签
  a.download = fileName;
  a.href = url;
  document.body.appendChild(a);
  a.click(); // 触发a标签的click事件
  document.body.removeChild(a);
};

const paginationChange = (pageInfo: PageInfo) => {
    searchModel.value.pageIndex = pageInfo.currentPage - 1;
    searchModel.value.pageSize = pageInfo.pageSize;
    getHistoryExportList();
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
