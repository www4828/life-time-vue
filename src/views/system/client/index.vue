<template>
  <div class="wrapper">
    <RoleLayout>
      <template #search>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="4">
              <span class="sh3h-search-lable ">客户端编号:</span>
              <el-input class="sh3h-search-input" placeholder="客户端编号" v-model.trim="searchModel[0].value" />
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
          <el-table-column prop="clientId" align="center" label="客户端编号" min-width="10%" />
          <el-table-column prop="scope" align="center" label="授权范围" min-width="10%"/>
          <el-table-column prop="accessTokenValidity" align="center" label="Token有效时长(秒)" min-width="10%"/>
          <el-table-column prop="refreshTokenValidity" align="center" label="Token刷新时间(天)" min-width="10%"/>
          <el-table-column prop="resourceIds" align="center" label="可访问资源" min-width="20%" />
          <el-table-column prop="authorizedGrantTypes" align="center" label="客户端授权类型" min-width="35%" />
          <el-table-column prop="autoApprove" align="center" label="自动授权" min-width="10%">
            <template #default="scope">
              <el-tag :type="scope.row.autoApprove == 'true' ? 'success' : 'danger'" effect="plain" >
                  {{ scope.row.autoApprove == "true" ? "开启" : "未开启" }}
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
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus, Setting, RefreshLeft } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
import EditDialog from "./components/EditDialog.vue";
import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import { ClientModel } from "@/api/model/clientModel";
import { ClientService } from "@/api/service/System/ClientService";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'
import { ButtonInfoModel } from "@/api/model/dispatchModel";

const searchParamsModel = reactive(new SearchParamsModel<ClientModel>());
const clientSever = new ClientService();

const tableData = reactive({
  clientList: [] as Array<any>,
  buttonList: [
    { name: "编辑" },
    { name: "修改密码" },
    { name: "删除",id:'' }
  ] as Array<any>,
});
let editform = reactive({}) as ClientModel;

const searchModel = ref<SearchModel<ClientModel>[]>([
  {
    key: "clientId",
    value: '',
    match: "like",
  }
]);
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = -1;
  clientSever.list(searchParamsModel).then((res: Response) => {
    tableData.clientList = res.data.results;
  });
};
getAll();
// 弹框
const dialogState = reactive({
  titleName: "" as string,
  EditDialog: false as boolean,
  QXDialog: false as boolean,
});
const add = () => {
  editform.accessTokenValidity = 50000
  editform.refreshTokenValidity = 30
  dialogState.titleName = "添加";
  dialogState.EditDialog = true;
};
const edit = (row: ClientModel) => {
  editform = row
  editform.resourceList = row.resourceIds?.split(',')
  editform.authList = row.authorizedGrantTypes?.split(',')
  dialogState.titleName = "修改";
  dialogState.EditDialog = true
}

const closeDialog = () => {
  dialogState.EditDialog = false;
  editform = {} as ClientModel
};
const editHandle = (params: ClientModel) => {
  clientSever.update(params).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.message
    })
    closeDialog()
    getAll()
  })
}
const saveHandle = (params: ClientModel) => {
  clientSever.save(params).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.message
    })
    closeDialog()
    getAll()
  })
}
const deleteHandle = (row:ClientModel)=>{
  ElMessageBox.confirm("确定要删除吗？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      clientSever.delete(row.clientId).then((res: Response) => {
        ElMessage({
          type: res.code == 200 ? 'success' : 'error',
          message: res.message
        })
        closeDialog()
        getAll()
      });
    })
}
const resetPassword = (row:ClientModel)=>{
  ElMessageBox.prompt('', '请输入新的客户端密码', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValidator: (value:string)=>{
      if(value){
        return true
      }else{
        return false
      }
    },
    inputErrorMessage: '必填',
  })
    .then((value:any) => {
      console.log(value);
      
      clientSever.resetPassword(value.value,row.clientId).then(res=>{
        ElMessage({
          type: res.code == 200 ? 'success' : 'error',
          message: res.message
        })
        closeDialog()
        getAll()
      })
    })
}
const commandClick = (commandClick: string, row: ClientModel) => {
  if(commandClick === '删除'){
    deleteHandle(row)
  }else{
    resetPassword(row)
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
