<template>
  <Layout
    v-loading="state.submitLoading"
    element-loading-background="rgba(255,255,255,0.3)"
    :element-loading-text="state.text"
  >
    <template #tree>
      <DepartmentTree
        @handleNodeClick="handleNodeClick"
        :refresh="state.refresh"
        :action="state.action"
        :new="state.newDepartment"
        @setRefresh="setRefresh"
        :treeJson="{
          type: departmentServer,
          name: 'departmentName',
          code: 'departmentCode',
        }"
      />
    </template>
    <template #button>
      <el-button
        type="primary"
        @click="addHandle"
        :disabled="state.loading || state.action == 'add'"
        >新增</el-button
      >
      <el-button type="danger" @click="doDel" :disabled="state.action == 'add'"
        >删除</el-button
      >
      <el-button
        type="warning"
        @click="state.action = 'edit'"
        v-if="state.action == 'add'"
        >取消</el-button
      >
    </template>
    <template #content>
      <div class="content-wrap">
        <DeptForm
          :formData="state.detail"
          :action="state.action"
          :submit="state.submit"
          @onSubmit="save"
          :tagFlag="state.tagFlag"
          @changeAction="state.action === 'edit'"
          @changeSubmit="state.submit = false"
          :deptList="state.deptList"
          @changeType="(val) => (state.detail.departmentType = val)"
        />
        <RoleTree
          ref="roleTreeRef"
          show-checkbox
          :showLine="false"
          :disabled="state.detail.departmentType != '1'"
          :checked="state.departmentRoles"
          :treeJson="{ type: roleServer }"
        />
      </div>
    </template>
    <template #bottom>
      <el-button
        type="success"
        @click="state.submit = true"
        >确定</el-button
      >
    </template>
  </Layout>
</template>
<script lang="ts" setup>
import { reactive, unref, ref, watch } from 'vue'
import DeptForm from './components/DeptForm.vue'
import DepartmentTree from '@/businessComponent/tree/index.vue'
import RoleTree from '@/businessComponent/tree/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DepartmentModel } from '@/api/model/departmentModel'
import { DepartmentService } from '@/api/service/System/DepartmentService'
import { Response, SearchParamsModel } from '@/api/interface'
import { SearchModel } from '@/api/model/baseModel'
import Layout from '@/components/Layout/Layout.vue'
import { cloneDeep, debounce } from 'lodash-es'
import { RoleService } from '@/api/service/System/RoleService'

const departmentServer = new DepartmentService()
const roleServer = new RoleService()
const roleTreeRef = ref()
const state = reactive({
  filterText: '',
  action: '', // show->展示 edit->编辑 add->增加
  detail: {} as DepartmentModel, // 要展示的数据详情
  typeArr: [], // 部门类型
  showDeptDe: false, // 双管弹窗
  deptdeArr: [], // 双管列表
  chekcDe: [], // 选中的双管
  loading: false, // 按钮loading
  refresh: false, // 刷新树标志
  submit: false, // 提交按钮
  form: {} as DepartmentModel, // submit提交信息
  flagArr: [] as Array<any>, // 提交数组
  departmentCode: '', // 当前部门编号
  currentNode: {} as any, // 当前选中节点
  tagFlag: false as boolean,
  newDepartment: {} as DepartmentModel, // 修改或新增的部门信息
  submitLoading: false,
  text: '正在提交数据，请稍后...',
  deptList: [],
  departmentRoles: []
})

// 获取详情
const getDeptDetail = (departmentCode: string) => {
  state.loading = state.submitLoading = true
  state.text = '加载中...'
  departmentServer
    .list({
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
      },
      searchParams: [
        {
          key: 'departmentCode',
          match: 'eq',
          value: departmentCode,
        },
      ],
    })
    .then((res) => {
      state.action = 'edit'
      state.loading = state.submitLoading = false
      state.text = '正在提交数据，请稍后...'
      state.detail = cloneDeep(res.data.results[0])
      state.currentNode = cloneDeep(res.data.results[0])
      state.departmentRoles = res.data.results[0]?.departmentRoles.split(',')
    })
}
const handleNodeClick = (node: any) => {
  state.action = 'edit'
  getDeptDetail(node.code)
}

const addHandle = () => {
  if (state.currentNode.departmentCode) {
    state.action = 'add'
    state.detail = {
      status: 1,
      sort: 1,
      departmentParentCode: state.currentNode.departmentCode,
      departmentLevel: Number(state.currentNode.departmentLevel) + 1
    } as DepartmentModel
  } else {
    ElMessage.warning('请选择左侧部门为上级部门')
  }
}

const doDel = () => {
  if (state.detail.id) {
    ElMessageBox.confirm('是否确定删除？', '提示').then(() => {
      state.submitLoading = true
      state.action = 'del'
      departmentServer
        .delete(String(state.detail.departmentCode))
        .then((res) => {
          state.submitLoading = false
          ElMessage({
            type: res.code == 200 ? 'success' : 'error',
            message: res.message,
          })
          state.refresh = true
        })
        .catch(() => (state.submitLoading = false))
    })
  } else {
    ElMessage.info('请先选择左侧部门')
  }
}


const save = () => {
  // state.submitLoading = true
  state.detail.departmentRoles = roleTreeRef.value?.getCheckedKeys().join(',')

  if (state.detail.id) {
    departmentServer.update(state.detail).then((res: Response) => {
      if (res.code === 200) {
        ElMessage.success('修改成功!')
        state.refresh = true
      } else {
        ElMessage.error(res.message)
      }
    })
  } else {
    departmentServer.save(state.detail).then((res: Response) => {
      if (res.code === 200) {
        ElMessage.success('新增成功!')
        state.refresh = true
      } else {
        ElMessage.error(res.message)
      }
    })
  }
}
const setRefresh = () => {
  state.refresh = state.submit = false
  state.submitLoading = false
  state.action = 'edit'
}

</script>

<style lang="scss" scoped>
.content-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  .dept-add-box {
    width: 70%;
    border-right: 1px solid var(--lt-tree-border-color);
  }
  .tree_container {
    width: 30%;
  }
  ::v-deep(.header-search){
    .el-input{
      margin-top: 0;
    }
  }
}
</style>
