<template>
  <div class="wrapper">
    <RoleLayout>
      <template #search>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="4">
              <span class="sh3h-search-lable ">应用名称:</span>
              <el-input class="sh3h-search-input" placeholder="应用名称" v-model.trim="searchModel[0].value" />
            </el-col>
            <el-col :span="5">
            </el-col>
            <el-col :span="11"></el-col>
            <el-col :span="4" class="div-flex-right">
              <el-button type="primary" :icon="Search" @click="getAll">搜索</el-button>
              <el-button type="primary" :icon="Plus" @click="add" class="save">增加</el-button>
            </el-col>
          </el-row>
        </div>
      </template>
      <template #table>
        <el-table :data="tableData.clientList" style="width:100%" height="100%"
          :header-cell-style="{ 'text-align': 'center', }" :cell-style="{ 'text-align': 'center' }">
          <el-table-column prop="appId" label="ID" min-width="10%" />
          <el-table-column prop="appName" label="应用名称" min-width="10%"/>
          <el-table-column prop="appCode" label="Code" min-width="10%"/>
          <el-table-column prop="appKey" label="AppKey" min-width="15%" show-overflow-tooltip/>
          <el-table-column prop="strategy" label="策略类型" min-width="10%"/>
          <el-table-column prop="createTime" label="创建时间" min-width="10%" >
            <template #default="{row}">
              {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm') }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="10%">
            <template #default="scope">
              <el-tag :type="scope.row.status == '1' ? 'success' : 'danger'" effect="plain" >
                  {{ scope.row.status == "1" ? "启用" : "禁用" }}
                </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="10%">
            <template #default="scope">
              <ButtonGropup :row="scope.row" :list="tableData.buttonList" @dropdownClick="edit"
                @commandClick="commandClick" />
            </template>
          </el-table-column>
        </el-table>
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
    <KeyDialog 
      :showFlag="dialogState.keyDialog" 
      :formData="editform" 
      @closeDialog="closeDialog" 
    />
    <AuthDialog 
      :showFlag="dialogState.authDialog" 
      :formData="editform" 
      @closeDialog="closeDialog" 
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus, Setting, RefreshLeft } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
import EditDialog from "./components/EditDialog.vue";
import KeyDialog from "./components/secretKey.vue";
import AuthDialog from "./components/auth.vue";
import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import { AppModel } from "@/api/model/apiModel";
import { AppService } from "@/api/service/Api/ApiService";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'
import { cloneDeep } from "lodash-es";
import dayjs from "dayjs";

const searchParamsModel = reactive(new SearchParamsModel<AppModel>());
const appSever = new AppService();

const tableData = reactive({
  clientList: [] as Array<any>,
  buttonList: [
    { name: "编辑" },
    { name: "密钥" },
    { name: "授权API" },
    { name: "删除" },
    { name: "禁用" }
  ] as Array<any>,
});
let editform = reactive({}) as AppModel;

const searchModel = ref<SearchModel<AppModel>[]>([
  {
    key: "appName",
    value: '',
    match: "like",
  }
]);
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = -1;
  appSever.list(searchParamsModel).then((res: Response) => {
    tableData.clientList = res.data.results;
  });
};
getAll();
// 弹框
const dialogState = reactive({
  titleName: "" as string,
  EditDialog: false as boolean,
  keyDialog: false as boolean,
  authDialog: false
});
const add = () => {
  dialogState.titleName = "添加";
  dialogState.EditDialog = true;
};
const edit = (row: AppModel) => {
  editform = row
  dialogState.titleName = "修改";
  dialogState.EditDialog = true
}

const closeDialog = () => {
  dialogState.EditDialog = false;
  dialogState.keyDialog = false;
  dialogState.authDialog = false;
  editform = {} as AppModel
};
const editHandle = (params: AppModel) => {
  appSever.update(params.id!, params).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.message
    })
    closeDialog()
    getAll()
  })
}
const saveHandle = (params: AppModel) => {
  appSever.save(params).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.message
    })
    closeDialog()
    getAll()
  })
}
const deleteHandle = (row:AppModel)=>{
  ElMessageBox.confirm("确定要删除吗？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      appSever.delete(row.id!).then((res: Response) => {
        ElMessage({
          type: res.code == 200 ? 'success' : 'error',
          message: res.message
        })
        closeDialog()
        getAll()
      });
    })
}

const commandClick = (commandClick: string, row: AppModel) => {
  editform = cloneDeep(row)
  switch(commandClick){
    case '删除':
      deleteHandle(row);
      break;
    case '密钥':
      dialogState.keyDialog = true
      break;
    case '授权API':
      dialogState.authDialog = true
      break;
  }
}

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
</style>
