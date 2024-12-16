<template>
  <div class="box">
  <Layout>
    <template #tree>
      <DepartmentTree @handleNodeClick="handleNodeClick"  />
    </template>
    <template #button>
      <!-- <el-button type="primary" :icon="Plus" @click="addHandle">添加</el-button> -->
    </template>
    <template #content>
      <div class="sh3h-search-box div-flex-column">
        <el-row>
          <el-col :span="5">
            <span class="sh3h-search-lable div-flex-right">用户名:</span>
            <el-input class="sh3h-search-input" v-model="searchModel[0].value" />
          </el-col>
          <el-col :span="5">
            <span class="sh3h-search-lable div-flex-right">姓名:</span>
            <el-input class="sh3h-search-input" v-model="searchModel[1].value" />
          </el-col>
          <el-col :span="5">
            <span class="sh3h-search-lable div-flex-right">手机号:</span>
            <el-input class="sh3h-search-input" v-model="searchModel[2].value" />
          </el-col>
          <el-col :span="5"> </el-col>
          <el-col :span="4" class="div-flex-right">
            <el-button type="primary" :icon="Search" @click="searchHandle">搜索</el-button>
            <!-- <el-button type="primary" :icon="Search" @click="searchHandle('all')">搜索全部</el-button> -->
            <el-button type="primary" :icon="Plus" @click="addHandle">添加</el-button>
          </el-col>
        </el-row>
      </div>
      <PageLayout>
          <!-- <template #button>
            <el-button type="primary" :icon="Plus" @click="addHandle">添加</el-button>
          </template> -->
          <!-- background: '#f2f7ff', -->
          <template #table>
            <el-table :data="state.tableData" style="width: 100%" height="100%"
              :default-sort="{ prop: 'xuhao', order: 'descending' }" :header-cell-style="{
                'text-align': 'center',
              }" :cell-style="{ 'text-align': 'center' }" :empty-text="state.emptyText">
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="mobile" label="手机" />
              <el-table-column prop="status" label="是否启用">
                <template #default="scope">
                  <el-tag v-if="scope.row.status" type="success">启用</el-tag>
                  <el-tag v-else type="danger">停用</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="idCard" label="身份证号" />
              <el-table-column label="操作">
                <template #default="scope">
                  <ButtonGropup :row="scope.row" :list="state.buttonList" @dropdownClick="editHandle"
                    @commandClick="commandClick" />
                </template>
              </el-table-column>
            </el-table>
          </template>
          <template #pagination>
            <Pagination :currentPage="searchParamsModel.pageParams.pageIndex" :pageSize="searchParamsModel.pageParams.pageSize" :total="searchParamsModel.pageParams.total"
              :background="true" :layout="state.layout" :callBack="paginationChange"></Pagination>
          </template>
        </PageLayout>
      </template>

    </Layout>
    <EditDialog v-if="dialogState.EditDialog" :dialogVisible="dialogState.EditDialog"
      @close="dialogState.EditDialog = false;" :editform="state.formData" :title="dialogState.titleName"
      @save="dialogSave">
    </EditDialog>
  </div>
</template>
<script lang="ts" setup>
import { reactive, unref, ref, watch } from 'vue'
import DepartmentTree from '@/businessComponent/tree/departmentTree/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserModel } from '@/api/model/userModel'
import { UserService } from '@/api/service/System/UserService'
import { Response, SearchParamsModel } from '@/api/interface'
import { SearchModel } from '@/api/model/baseModel'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import Layout from "@/components/Layout/Layout-v2.vue";
import PageLayout from "@/businessComponent/pageLayout/index.vue";
import Pagination from "@/components/pagination/index.vue";
import EditDialog from "./components/dialog.vue";
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'

const searchModel = ref<SearchModel<UserModel>[]>([{
  key: 'username',
  value: '',
  match: 'like'
}, {
  key: 'name',
  value: '',
  match: 'like'
}, {
  key: 'mobile',
  value: '',
  match: 'like'
}, {
  key: 'sort',
  value: 'sort',
  match: 'orderByAsc'
}])
const searchParamsModel = reactive(new SearchParamsModel<UserModel>())
const userServer = new UserService()

const state = reactive({
  tableData: [] as any,
  buttonList: [
    { name: "修改" },
    { name: "停用",id:0 },
    { name: "启用",id:1 },
    { name: "删除" },
    { name: "重置密码" },
  ],
  currentPage: 1 as number,
  pageSize: 10 as number,
  total: 0 as number,
  layout: "sizes,prev,pager,next,slot",
  detail: {} as any, // 要展示的数据详情
  deptdeLoading: false,
  formData: {} as any,
  show: false,
  emptyText: '暂无数据'
})
const dialogState = reactive({
  titleName: "" as string,
  EditDialog: false as boolean
})

const handleNodeClick = (node: any) => {
  state.detail = node
  state.tableData = []
  state.emptyText = '数 据 加 载 中 . . .'
  searchHandle()
}
const addHandle = () => {
  if (state.detail.departmentCode) {
    state.formData = []
    state.formData.departmentCode = state.detail.departmentCode
    state.formData.status = 1
    dialogState.EditDialog = true;
    dialogState.titleName = "添加"
  } else {
    ElMessage.warning('请选择部门后进行操作')
  }
}
const editHandle = (row: any) => {
  state.formData = row
  state.formData.departmentCode = state.detail.departmentCode
  dialogState.titleName = "修改"
  dialogState.EditDialog = true;
  state.show = true
}

const doDel = (id: any) => {
  ElMessageBox.confirm('是否确定删除？', '提示').then(() => {
    userServer.delete(id).then((res) => {
      ElMessage({
        type: res.code == 200 ? 'success' : 'error',
        message: res.code == 200 ? res.message : (res.data || res.message),
      })
      searchHandle()
    })
  })
}
const updateUserInfo = (params:any)=>{
  userServer.update(params).then(res=>{
    ElMessage({
        type: res.code == 200 ? 'success' : 'error',
        message: res.code == 200 ? res.message : (res.data || res.message),
      })
      searchHandle()
  })
}
const resetPassword =(name:string,username:string)=>{
  ElMessageBox.confirm(`新密码将会以短信形式发送至用户手机。`, `确定重置" ${name} " 的密码吗？`).then(() => {
    userServer.resetPassword(username).then((res) => {
      ElMessage({
        type: res.code == 200 ? 'success' : 'error',
        message: res.message
      })
      searchHandle()
    })
  })
}
const commandClick = (command: string, row: any) => {
  switch (command) {
    case '删除':
      doDel(row.id)
      break;
    case '停用':
      updateUserInfo({id:row.id,status: 0})
      break;
    case '启用':
      updateUserInfo({id:row.id,status: 1})
      break;
    case '重置密码':
      resetPassword(row.name,row.username)
      break;
  }

}


const saveOrUpdate = (form: any) => {
  userServer.saveOrUpdate(form).then((res) => {
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message:res.code == 200 ? res.message : (res.data || res.message),
    })
    searchHandle()
  })
}

const dialogSave = (type: string, form: UserModel) => {
  saveOrUpdate(form)
}
const searchHandle = (form?: any) => {
  // searchParamsModel.pageParams.pageSize = state.pageSize;
  // searchParamsModel.pageParams.pageIndex = state.currentPage; 
  searchParamsModel.searchParams = searchModel.value
  userServer.listUserDept(state.detail.departmentCode,searchParamsModel).then(res => {
    state.tableData = res.data?.results ? res.data?.results : []
    searchParamsModel.pageParams.total = res.data?.pageInfo?.total || 0
    state.emptyText = '暂无数据'
  })
}
// searchHandle()



//分页处理
const paginationChange = (msg: any) => {
  searchParamsModel.pageParams.pageIndex = msg.currentPage
  searchParamsModel.pageParams.pageSize = msg.pageSize
  searchHandle()
}
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100%;
}

.sh3h-search-box {
  background-color: var(--sh3h-tree-background-color);
  // background: rgb(242, 242, 242);
}

::v-deep(.button) {
  margin: 0 !important;
  padding-bottom: 0 !important;
}
// ::v-deep(.content){
  // padding-top: 0 !important;
// }
</style>
