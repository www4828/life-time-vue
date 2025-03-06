<template>
  <div class="sh3h-search-box div-flex-column">
    <el-row>
      <el-col :span="5">
        <span class="sh3h-search-lable div-flex-right">接口名称:</span>
        <el-input class="sh3h-search-input" v-model.trim="searchModel[0].value" />
      </el-col>
      <el-col :span="5"> </el-col>
      <el-col :span="5"> </el-col>
      <el-col :span="5"> </el-col>
      <el-col :span="4" class="div-flex-right">
        <el-button type="primary" :icon="Search" @click="searchHandle">搜索</el-button>
      </el-col>
    </el-row>
  </div>
  <PageLayout>
    <template #table>
      <el-table :data="state.tableData" style="width: 100%" height="100%">
        <el-table-column prop="apiBaseInfo.apiCode" align="center" label="接口编号" />
        <el-table-column prop="apiBaseInfo.apiName" align="center" label="接口名称" show-overflow-tooltip />
        <el-table-column prop="apiBaseInfo.apiUrl" align="center" label="接口路径" show-overflow-tooltip />
        <el-table-column prop="apiBaseInfo.apiMethod" align="center" label="请求类型" />
        <el-table-column prop="apiBaseInfo.authType" align="center" label="认证类型" />
        <el-table-column prop="apiBaseInfo.description" align="center" label="说明" show-overflow-tooltip />
        <el-table-column prop="apiBaseInfo.isPublish" align="center" label="是否发布">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.apiBaseInfo.isPublish == 1"> 已发布</el-tag>
            <el-tag type="warning" v-else>未发布</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template #default="scope">
            <ButtonGropup :row="scope.row" :list="state.buttonList" @dropdownClick="editHandle"
              @commandClick="commandClick" />
          </template>
        </el-table-column>
      </el-table>
    </template>
    <template #pagination>
      <Pagination :currentPage="searchParamsModel.pageParams.pageIndex"
        :pageSize="searchParamsModel.pageParams.pageSize" :total="searchParamsModel.pageParams.total"
        :callBack="paginationChange" />
    </template>
  </PageLayout>
</template>
<script scoped lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import Pagination from "@/components/pagination/index.vue";
import { Plus, Search } from "@element-plus/icons-vue";
import { ApiInfoService, ApiGroupService } from '@/api/service/Api/ApiService'
import { ApiGroupModel, ApiModel, ApiBaseInfoModel } from '@/api/model/apiModel'
import { ElMessage } from 'element-plus'
import { SearchModel } from "@/api/model/baseModel";
import { SearchParamsModel } from '@/api/interface';
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'
import PageLayout from "@/businessComponent/pageLayout/index.vue";

interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const emits = defineEmits(['edit'])
const props = defineProps({
  groupCode: {
    type: String
  },
})

const apiInfoSever = new ApiInfoService()
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
  tableData: [],
  buttonList: [
    { name: "修改" },
    { name: "删除" }
  ] as Array<any>,
})

const commandClick = (commandClick: string, row: ApiModel) => {
  switch (commandClick) {
    case '删除':
      deleteHandle(row);
      break;
    case '发布':
      break;
    default:
      break
  }
}


const paginationChange = (pageInfo: PageInfo) => {
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
const editHandle = (row: ApiModel) => { 
  emits('edit',row)
}
const deleteHandle = (row: ApiModel) => { }

watch(
  () => props.groupCode,
  (newValue, oldValue) => {
    if(newValue){
      searchModel.value[1].value = newValue
      paginationChange({currentPage: 1, pageSize: 10})
    }
  }
)
</script>
<style lang="scss" scoped>
.sh3h-search-box {
  background-color: var(--lt-tree-background-color);
}
</style>
