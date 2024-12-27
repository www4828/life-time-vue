<template>
  <div class="box">
    <Layout>
      <template #tree>
        <!-- <DepartmentTree @handleNodeClick="handleNodeClick"  /> -->
        <DepartmentTree
          @handleNodeClick="handleNodeClick"
          :treeJson="{ type: departmentServer }"
        />
      </template>
      <template #button>
        <!-- <el-button type="primary" :icon="Plus" @click="addHandle">添加</el-button> -->
      </template>
      <template #content>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="5">
              <span class="sh3h-search-lable div-flex-right">用户名:</span>
              <el-input
                class="sh3h-search-input"
                v-model="searchModel[0].value"
              />
            </el-col>
            <el-col :span="5">
              <span class="sh3h-search-lable div-flex-right">姓名:</span>
              <el-input
                class="sh3h-search-input"
                v-model="searchModel[1].value"
              />
            </el-col>
            <el-col :span="5">
              <span class="sh3h-search-lable div-flex-right">手机号:</span>
              <el-input
                class="sh3h-search-input"
                v-model="searchModel[2].value"
              />
            </el-col>
            <el-col :span="5"> </el-col>
            <el-col :span="4" class="div-flex-right">
              <el-button type="primary" :icon="Search" @click="searchHandle"
                >搜索</el-button
              >
              <el-button type="primary" :icon="Search" @click="searchAll">搜索全部</el-button>
              <el-button type="primary" :icon="Plus" @click="addHandle"
                >添加</el-button
              >
            </el-col>
          </el-row>
        </div>
        <PageLayout>
          <!-- <template #button>
            <el-button type="primary" :icon="Plus" @click="addHandle">添加</el-button>
          </template> -->
          <!-- background: '#f2f7ff', -->
          <template #table>
            <el-table
              :data="state.tableData"
              style="width: 100%"
              height="100%"
              :default-sort="{ prop: 'xuhao', order: 'descending' }"
              :header-cell-style="{
                'text-align': 'center',
              }"
              :cell-style="{ 'text-align': 'center' }"
              :empty-text="state.emptyText"
            >
              <el-table-column prop="userCode" label="用户名" />
              <el-table-column prop="userName" label="姓名" />
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
                  <ButtonGropup
                    :row="scope.row"
                    :list="state.buttonList"
                    @dropdownClick="editHandle"
                    @commandClick="commandClick"
                  />
                </template>
              </el-table-column>
            </el-table>
          </template>
          <template #pagination>
            <Pagination
              :currentPage="searchParamsModel.pageParams.pageIndex"
              :pageSize="searchParamsModel.pageParams.pageSize"
              :total="searchParamsModel.pageParams.total"
              :background="true"
              :layout="state.layout"
              :callBack="paginationChange"
            ></Pagination>
          </template>
        </PageLayout>
      </template>
    </Layout>
    <EditDialog
      v-if="dialogState.EditDialog"
      :dialogVisible="dialogState.EditDialog"
      @close="dialogState.EditDialog = false"
      :editform="state.formData"
      :title="dialogState.titleName"
      @save="saveOrUpdate"
    />
    <DepartmentDialog
      v-if="dialogState.deptDialog"
      :dialogVisible="dialogState.deptDialog"
      @close="dialogState.deptDialog = false"
      :userCode="dialogState.userCode"
      />
  </div>
</template>
<script lang="ts" setup>
import { reactive, unref, ref, watch } from 'vue'
import DepartmentTree from '@/businessComponent/tree/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserModel } from '@/api/model/userModel'
import { UserService } from '@/api/service/System/UserService'
import { Response, SearchParamsModel } from '@/api/interface'
import { SearchModel } from '@/api/model/baseModel'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import Layout from '@/components/Layout/Layout-v2.vue'
import PageLayout from '@/businessComponent/pageLayout/index.vue'
import Pagination from '@/components/pagination/index.vue'
import EditDialog from './components/dialog.vue'
import DepartmentDialog from './components/department.vue'
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'
import { DepartmentService } from '@/api/service/System/DepartmentService'
import { cloneDeep } from 'lodash-es'

const searchModel = ref<SearchModel<UserModel>[]>([
  {
    key: 'userCode',
    value: '',
    match: 'like',
  },
  {
    key: 'userName',
    value: '',
    match: 'like',
  },
  {
    key: 'mobile',
    value: '',
    match: 'like',
  },
  {
    key: 'sort',
    value: 'sort',
    match: 'orderByAsc',
  },
])
const searchParamsModel = reactive(new SearchParamsModel<UserModel>())
const userServer = new UserService()
const departmentServer = new DepartmentService()

const state = reactive({
  tableData: [] as Array<UserModel>,
  buttonList: [
    { name: '修改' },
    { name: '停用', id: 0 },
    { name: '启用', id: 1 },
    { name: '删除' },
    { name: '设置部门' },
    // { name: '重置密码' },
  ],
  currentPage: 1 as number,
  pageSize: 10 as number,
  total: 0 as number,
  layout: 'sizes,prev,pager,next,slot',
  detail: {} as any, // 要展示的数据详情
  deptdeLoading: false,
  formData: {} as UserModel,
  show: false,
  emptyText: '暂无数据',
  roleList: [] as UserModel[]
})
const dialogState = reactive({
  titleName: '' as string,
  EditDialog: false as boolean,
  deptDialog: false as boolean,
  userCode: ''
})

const handleNodeClick = (node: any) => {
  state.detail = node
  state.tableData = []
  state.emptyText = '数 据 加 载 中 . . .'
  searchHandle()
}
const addHandle = () => {
  if (state.detail.code) {
    state.formData = {
      departmentCode: state.detail.code,
      status: 1,
      sex: 0,
      departName: state.detail.name,
    } as UserModel
    dialogState.EditDialog = true
    dialogState.titleName = '添加'
  } else {
    ElMessage.warning('请选择部门后进行操作')
  }
}
const editHandle = (row: any) => {
  state.formData = cloneDeep(row)
  state.formData.departmentCode = state.detail.code,
  dialogState.titleName = '修改'
  dialogState.EditDialog = true
  state.show = true
}

const doDel = (id: any) => {
  ElMessageBox.confirm('是否确定删除？', '提示').then(() => {
    userServer.delete(id).then((res) => {
      ElMessage({
        type: res.code == 200 ? 'success' : 'error',
        message: res.message,
      })
      searchHandle()
    })
  })
}
const updateUserInfo = (params: any) => {
  userServer.update(params).then((res) => {
    // searchHandle()
    saveUserRoleFull()
  })
}
const saveUserRoleFull = () => {
  userServer.saveUserRoleFull(state.roleList).then((res) => {
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.message,
    })
    searchHandle()
  })
}
const resetPassword = (name: string, username: string) => {
  ElMessageBox.confirm(
    `新密码将会以短信形式发送至用户手机。`,
    `确定重置" ${name} " 的密码吗？`
  ).then(() => {
    userServer.resetPassword(username).then((res) => {
      ElMessage({
        type: res.code == 200 ? 'success' : 'error',
        message: res.message,
      })
      searchHandle()
    })
  })
}
const commandClick = (command: string, row: UserModel) => {
  switch (command) {
    case '删除':
      doDel(row.id)
      break
    case '设置部门':
      dialogState.deptDialog = true
      dialogState.userCode = row.userCode
      break
    case '停用':
      updateUserInfo({ id: row.id, status: 0 })
      break
    case '启用':
      updateUserInfo({ id: row.id, status: 1 })
      break
    case '重置密码':
      resetPassword(row.userName, row.userCode)
      break
  }
}

const save = (form: UserModel) => {
  userServer.save(form).then((res) => {
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.code == 200 ? res.message : res.data || res.message,
    })
    searchHandle()
  })
}

const saveOrUpdate = (roleList: UserModel[]) => {
  state.roleList = roleList
  if (state.formData.id) {
    updateUserInfo(state.formData)
  } else {
    save(state.formData)
  }
}

const searchHandle = (form?: any) => {
  if(state.detail.code === '0000' || !state.detail.code ){
    searchAll()
  }else{
    searchParamsModel.searchParams = searchModel.value
    userServer.listUserDept(state.detail.code, searchParamsModel).then((res) => {
      state.tableData = res.data?.results ? res.data?.results : []
      searchParamsModel.pageParams.total = res.data?.pageInfo?.total || 0
      state.emptyText = '暂无数据'
    })
  }
}
const searchAll = () => {
  searchParamsModel.searchParams = searchModel.value
  userServer.list(searchParamsModel).then((res) => {
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
  background-color: var(--lt-tree-background-color);
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
