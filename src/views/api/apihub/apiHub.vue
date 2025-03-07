<template>
  <Layout>
    <template #tree>
      <div class="tree_container">
        <div class="header-search">
          <div class="header-left">
            <el-icon>
              <Menu />
            </el-icon>
            API分类
          </div>
        </div>
        <div class="split-line" />
        <div class="tree">
          <ApiGroupTree
            @handleNodeClick="handleNodeClick"
            :showSearch="false"
            :showLine="false"
            :treeJson="{ type: apiGroupSever }"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div class="hub-search">
        <el-input
          v-model="state.input"
          style="width: 600px"
          placeholder="输入你要的API"
          class="input-with-select"
        >
          <template #append>
            <el-button type="primary" :icon="Search">搜索</el-button>
          </template>
        </el-input>
      </div>
      <div class="hub-content">
        <div class="item" v-for="item in state.tableData">
          <i class="icon interface"></i>
          <div class="apiName">{{ item.apiBaseInfo.apiName }}</div>
          <div class="count">
            <el-icon><View /></el-icon> 10
          </div>
          <div class="des">简介：{{ item.apiBaseInfo.apiName }}</div>
          <div class="item-botton">
            <div class="apiGroup">
              <i class="icon group"></i>
              {{ item.apiBaseInfo.groupCode }}
            </div>
            <el-link type="primary" :icon="Link" @click="emits('showInfo', item)" > 详情</el-link>
          </div>
        </div>
      </div>
      <Pagination 
        :currentPage="searchParamsModel.pageParams.pageIndex"
        :pageSize="searchParamsModel.pageParams.pageSize" 
        :total="searchParamsModel.pageParams.total"
        :callBack="paginationChange" 
      />
    </template>
  </Layout>
</template>
<script scoped lang="ts" setup>
import { reactive, ref } from 'vue'
import { Menu, Search, Coin, Link, View } from '@element-plus/icons-vue'
import Layout from '@/components/Layout/Layout-v2.vue'
import { ApiInfoService, ApiGroupService } from '@/api/service/Api/ApiService'
import { ApiGroupModel, ApiModel, ApiBaseInfoModel } from '@/api/model/apiModel'
import { ElMessage } from 'element-plus'
import ApiGroupTree from '@/businessComponent/tree/index.vue'
import Pagination from "@/components/pagination/index.vue";
import { SearchParamsModel } from '@/api/interface';
import { SearchModel } from '@/api/model/baseModel'
import { useRouter } from "vue-router";

const emits = defineEmits(['showInfo'])
const apiInfoSever = new ApiInfoService()
const apiGroupSever = new ApiGroupService()
const router = useRouter()
const searchParamsModel = reactive(new SearchParamsModel<ApiBaseInfoModel>());
const searchModel = ref<SearchModel<ApiBaseInfoModel>[]>([
  {
    key: "apiName",
    value: "",
    match: "like",
  },
  {
    key: "groupCode",
    value: '',
    match: "eq",
  }
]);
const state = reactive({
  input: '',
  tableData: [] as ApiModel[]
})

const handleNodeClick = (node: any) => {
  
}

const paginationChange = (pageInfo: any) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  searchHandle();
};
const searchHandle = () => {
  searchParamsModel.searchParams = searchModel.value;
  apiInfoSever.list(searchParamsModel).then(res => {
    if (res.code == 200) {
      const { results, pageInfo } = res.data;
      searchParamsModel.pageParams.total = pageInfo.total;
      state.tableData = results;
    } else {
      ElMessage.error(res.message);
    }
  })
}
searchHandle()
</script>
<style lang="scss" scoped>
.tree_container {
  height: 100%;

  .tree {
    height: calc(100% - 70px);
  }

  .header-search {
    padding: 10px 20px 0;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;

    .header-left {
      color: var(--lt-historyCase-value-color);
      font-size: 14px;
      display: flex;
      align-items: center;

      .el-icon {
        color: var(--el-color-primary);
        margin: 2px 5px 0 0;
      }
    }
  }

  .split-line {
    margin-top: 10px;
  }
}

.hub-search{
  width: 100%;
  display: flex;
  justify-content: center;
  .el-input{
    height: 40px;
    ::v-deep(.el-input__wrapper){
      border-radius: 10px 0 0 10px;
      border: 2px solid var(--el-color-primary);
      // box-shadow: rgba( var(--el-color-primary), 0.2) 0px 4px 12px;
      box-shadow: rgba( #2E75D2, 0.2) 0px 4px 12px;
    }
    ::v-deep(.el-input-group__append){
      border-radius: 0 10px 10px 0;
      border: 2px solid var(--el-color-primary);
      background-color: var(--el-color-primary);
      box-shadow: rgba( #2E75D2, 0.2) 0px 4px 12px;
      box-sizing: border-box;
      color: var(--lt-head-font-color);
      .el-button{
        display: flex;
        align-items: center;

      }
    }
  }
}

.hub-content{
  padding: 20px;
  height: calc(100% - 80px);
  box-sizing: border-box;
  display: flex;
  overflow-y: auto;
  .item{
    width: 30%;
    height: 180px;
    margin-right: 30px;
    box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px;
    border-radius: 10px;
    background-color: var(--lt-head-font-color);
    position: relative;
    padding: 20px 20px 40px;
    box-sizing: border-box;
    font-size: 16px;
    i{
      width: 18px;
      height: 18px;
      &.interface{
        background: url("@/assets/api/interface.png") center/ 100% 100%;
        position: absolute;
        top: 25px;
        left: 20px;
      }
      &.group{
        margin-right: 5px;
        background: url("@/assets/api/group.png") center/ 100% 100%;
      }
    }
    .apiName{
      padding-left: 30px;
      margin-bottom: 10px;
    }
    .count,.des{
      font-size: 14px;
      font-family: Arial, Helvetica, sans-serif;
      padding-left: 30px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      color: var(--lt-label-form-color);
      .el-icon{
        margin-right: 10px;
      }
    }
    .des{
      padding-left: 30px;
    }
    .item-botton{
      position: absolute;
      width: calc(100% - 40px);
      bottom: 20px;
      display: flex;
      justify-content: space-between;
      color: var(--lt-label-form-color);
      font-family: Arial, Helvetica, sans-serif;
      .apiGroup{
        display: flex;
        align-items: center;
      }
      .el-link{
        ::v-deep(.el-icon){
          font-size: 18px;
        }
      }
    }
  }
}
</style>
