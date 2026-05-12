<template>
  <div class="wrapper">
    <RoleLayout>
      <template #search>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="4">
              <span class="sh3h-search-lable ">模型名称:</span>
              <el-input class="sh3h-search-input" placeholder="模型名称" v-model.trim="searchModel[0].value" />
            </el-col>
            <el-col :span="4">
              <span class="sh3h-search-lable ">模型类型:</span>
              <el-input class="sh3h-search-input" placeholder="模型类型" v-model.trim="searchModel[1].value" />
            </el-col>
            <el-col :span="12"></el-col>
            <el-col :span="4" class="div-flex-right">
              <el-button type="primary" :icon="Search" @click="getAll">搜索</el-button>
              <el-button type="primary" :icon="Plus" @click="add" class="save">新增</el-button>
            </el-col>
          </el-row>
        </div>
      </template>
      <template #table>
        <div class="tableWrapper">
          <div class="tableContent">
            <el-table :data="tableData.dataList" style="width:100%" height="100%"
              :header-cell-style="{ 'text-align': 'center', }" :cell-style="{ 'text-align': 'center' }">
              <el-table-column prop="id" align="center" label="模型编号" />
              <el-table-column prop="modelName" align="center" label="模型名称" />
              <el-table-column prop="modelType" align="center" label="模型类型" />
              <el-table-column prop="apiKey" align="center" label="API密钥" />
              <el-table-column prop="url" align="center" label="URL" />
              <el-table-column prop="baseModel" align="center" label="基础模型" />
              <el-table-column prop="embedModel" align="center" label="嵌入模型" />
              <el-table-column prop="modelVersion" align="center" label="模型版本" />
              <el-table-column prop="status" align="center" label="模型状态" >
                <template #default="scope">
                  <el-tag type="success" v-if="scope.row.status == 1">上线</el-tag>
                  <el-tag type="danger" v-else>调试</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createUser" align="center" label="创建人" />
              <el-table-column label="操作">
                <template #default="scope">
                  <ButtonGropup :row="scope.row" :list="tableData.buttonList" @dropdownClick="edit"
                    @commandClick="commandClick" />
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
        </div>
      </template>
    </RoleLayout>
    <EditDialog 
      :showFlag="dialogState.EditDialog" 
      :formData="editform" 
      :dialogStatus="dialogState.titleName"
      @closeDialog="closeDialog" 
      @update="editHandle" 
      @save="saveHandle" 
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus, Setting, RefreshLeft } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
import EditDialog from "./components/EditDialog.vue";
import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import { AIModelModel } from '@/api/model/aiModel'
import { DataSourceService } from "@/api/service/Data/DataSourceService";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'
import Pagination from "@/components/pagination/index.vue";

const searchParamsModel = reactive(new SearchParamsModel<AIModelModel>());
const dataSourceSever = new DataSourceService();

const tableData = reactive({
  dataList: [{
    modelName: 'openai',
    modelType: 'openai',
    apiKey: 'key',
    url: 'https://xxx',
    baseModel: 'v1/chat/completions',
    embedModel: 'v1/embeddings',
    modelVersion: 'v1',
    status: '1',
    createUser: 'admin',
    id: '1'
  }] as Array<any>,
  buttonList: [
    { name: "编辑模型" },
    { name: "查看表" },
    { name: "删除",id:'' }
  ] as Array<any>,
});
let editform = reactive({}) as AIModelModel;

const searchModel = ref<SearchModel<AIModelModel>[]>([
  // {
  //   key: "",
  //   value: '',
  //   match: "like",
  // },
  // {
  //   key: "",
  //   value: '',
  //   match: "like",
  // }
]);
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = 10;
  // dataSourceSever.list(searchParamsModel).then((res: Response) => {
  //   tableData.dataList = res.data.results;
  // });
};
getAll();
// 弹框
const dialogState = reactive({
  titleName: "" as string,
  EditDialog: false as boolean,
  QXDialog: false as boolean,
});
const add = () => {
  dialogState.titleName = "新增";
  dialogState.EditDialog = true;
};
const edit = (row: AIModelModel) => {
  editform = row
  dialogState.titleName = "修改";
  dialogState.EditDialog = true
}

const closeDialog = () => {
  dialogState.EditDialog = false;
  editform = {} as AIModelModel
};
const editHandle = (params: AIModelModel) => {
  // dataSourceSever.update(params).then(res=>{
  //   ElMessage({
  //     type: res.code == 200 ? 'success' : 'error',
  //     message: res.message
  //   })
  //   closeDialog()
  //   getAll()
  // })
}
const saveHandle = (params: AIModelModel) => {
  // dataSourceSever.save(params).then(res=>{
  //   ElMessage({
  //     type: res.code == 200 ? 'success' : 'error',
  //     message: res.message
  //   })
  //   closeDialog()
  //   getAll()
  // })
}
const deleteHandle = (row:AIModelModel)=>{
  ElMessageBox.confirm("确定要删除吗？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // dataSourceSever.delete(row.id!).then((res: Response) => {
      //   ElMessage({
      //     type: res.code == 200 ? 'success' : 'error',
      //     message: res.message
      //   })
      //   closeDialog()
      //   getAll()
      // });
    })
}

const commandClick = (commandClick: string, row: AIModelModel) => {
  switch(commandClick){
    case '删除':
      deleteHandle(row);
      break;
    case '查看表':
      // deleteHandle(row);
      break;
    default:
      break
  }
}
const paginationChange = (pageInfo: any) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;

};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
}

.sh3h-search-box {
  background-color: var(--lt-tree-background-color);
  margin: 0;
  // border: 1px solid var(--lt-tree-border-color);
}

::v-deep(.button) {
  margin: 0 !important;
}

::v-deep(.el-dropdown-menu__item) {
  width: 100% !important;
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
