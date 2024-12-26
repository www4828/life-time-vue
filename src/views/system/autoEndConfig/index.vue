<template>
  <div class="wrapper">
    <RoleLayout>
      <template #search>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="4">
              <span class="sh3h-search-lable ">配置项名称:</span>
              <el-input class="sh3h-search-input" v-model.trim="searchModel[0].value" />
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
        <el-table :data="tableData.tableList" style="width:100%" height="100%"
          :header-cell-style="{ 'text-align': 'center', }" :cell-style="{ 'text-align': 'center' }">
          <el-table-column prop="configName" align="center" label="配置项名称"/>
          <el-table-column prop="configType" align="center" label="工单类型">
            <template #default="scope">
              {{ ticketTypes.find(i=>i.codeValue === scope.row.configType )?.codeName }}
            </template>
          </el-table-column>
          <el-table-column prop="intervalTime" align="center" label="等待间隔">
            <template #default="scope">
              {{ autoEndLimitTypes.find(i=>i.codeValue === scope.row.intervalTime )?.codeName }}
            </template>
          </el-table-column>
          <el-table-column prop="overdueTime" align="center" label="截止时限">
            <template #default="scope">
              {{ autoEndLimitTypes.find(i=>i.codeValue === scope.row.overdueTime )?.codeName }}
            </template>
          </el-table-column>
          <el-table-column prop="isValid" align="center" label="是否启用">
            <template #default="scope">
              <el-tag
                  :type="scope.row.isValid == 1 ? 'success' : 'danger'"
                  effect="plain"
                >
                  {{ scope.row.isValid == 1 ? "已启用" : "未启用" }}
                </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
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
      :formData="tableData.editform" 
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
import { AutoEndConfigModel } from "@/api/model/autoEndConfigModel";
import { AutoEndService } from "@/api/service/System/AutoEndService";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'
import { useCode } from "@/hooks/useCode";
import { cloneDeep } from "lodash-es";

const { ticketTypes, autoEndLimitTypes } = useCode();
const searchParamsModel = reactive(new SearchParamsModel<AutoEndConfigModel>());
const autoEndSever = new AutoEndService();

const tableData = reactive({
  tableList: [] as Array<any>,
  buttonList: [
    { name: "修改",id:'' },
    // { name: "删除",id:'' }
  ],
  editform: {} as any
});

const searchModel = ref<SearchModel<AutoEndConfigModel>[]>([
  {
    key: "configName",
    value: '',
    match: "like",
  },
  {
    key: "status",
    value: '1',
    match: "eq",
  }
]);
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = -1;
  autoEndSever.list(searchParamsModel).then((res: Response) => {
    tableData.tableList = res.data.results;
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
  tableData.editform.isValid = '1'
  dialogState.titleName = "添加";
  dialogState.EditDialog = true;
};
const edit = (row: any) => {
  tableData.editform = cloneDeep(row)
  dialogState.titleName = "修改";
  dialogState.EditDialog = true
}

const closeDialog = () => {
  dialogState.EditDialog = false;
  tableData.editform = {} as AutoEndConfigModel
};
const editHandle = (params: AutoEndConfigModel) => {
  autoEndSever.update(params).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.message
    })
    closeDialog()
    getAll()
  })
}
const saveHandle = (params: AutoEndConfigModel) => {
  autoEndSever.save(params).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.message
    })
    closeDialog()
    getAll()
  })
}
const commandClick = (command: string, row: AutoEndConfigModel) => {
  ElMessageBox.confirm("确定要删除吗？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      autoEndSever.delete(row.id).then((res: Response) => {
        ElMessage({
          type: res.code == 200 ? 'success' : 'error',
          message: res.message
        })
        closeDialog()
        getAll()
      });
    })
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
