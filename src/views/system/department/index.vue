<template>
  <Layout v-loading="state.submitLoading"
    element-loading-background="rgba(255,255,255,0.3)"
    :element-loading-text="state.text">
    <template #tree>
      <DepartmentTree
        @handleNodeClick="handleNodeClick"
        :refresh="state.refresh"
        :action="state.action"
        :new="state.newDepartment"
        @setRefresh="setRefresh" 
        @getTree="(val:any)=> state.deptList=val"
      />
    </template>
    <template #button>
      <el-button type="primary" @click="addHandle" :disabled="state.loading || state.action == 'add'"
        >新增</el-button
      >
      <el-button type="danger" @click="doDel" :disabled="(state.action == 'add')"
        >删除</el-button
      >
      <el-button type="warning" @click="state.action = 'edit'" v-if="state.action == 'add'"
        >取消</el-button
      >
    </template>
    <template #content>
      <div class="content-wrap">
        <DeptForm
          :formData="state.detail"
          :action="state.action"
          :submit="state.submit"
          @onSubmit="onSubmit"
          :tagFlag="state.tagFlag"
          @changeAction="state.action === 'edit'"
          @changeSubmit="state.submit=false"
          :deptList="state.deptList"
        />
        <RoleTree
          :departmentCode="state.departmentCode"
          :submit="state.submit"
          @onSubmit="onSubmit"
          :action="state.action"
          :new="state.newDepartment"
          @caseEntry="caseEntry"
        />
      </div>
    </template>
    <template #bottom>
      <el-button type="success" @click="submitHandle" :disabled="!state.action || state.action==='del'">确定</el-button>
    </template>
  </Layout>
</template>
<script lang="ts" setup>
import { reactive, unref, ref, watch } from 'vue'
import DeptForm from './components/DeptForm.vue'
import DepartmentTree from '@/businessComponent/tree/departmentTree/index.vue'
import RoleTree from '@/businessComponent/tree/roleTree/roleTree.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DepartmentModel } from '@/api/model/departmentModel'
import { DepartmentService } from '@/api/service/System/DepartmentService'
import { Response, SearchParamsModel } from '@/api/interface'
import { SearchModel } from '@/api/model/baseModel'
import Layout from '@/components/Layout/Layout.vue'
import { cloneDeep, debounce } from 'lodash-es'

const departmentServer = new DepartmentService()

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
  departmentCode:'',  // 当前部门编号
  currentNode: {} as any, // 当前选中节点
  tagFlag: false as boolean,
  newDepartment: {} as DepartmentModel, // 修改或新增的部门信息
  submitLoading: false,
  text:'正在提交数据，请稍后...',
  deptList:[]
})

// 获取详情
const getDeptDetail = (departmentCode: string) => {
  state.loading = state.submitLoading = true
  state.text = '加载中...'
  departmentServer.getByDepartmentCode(departmentCode).then((res) => {
    state.action = 'edit'
    state.loading = state.submitLoading = false
    state.text = '正在提交数据，请稍后...'
    state.detail = res.data
  })
}
const handleNodeClick = (node: any) => {
  state.currentNode = node
  state.action = 'edit'
  if (node.departmentCode) {
    state.departmentCode = node.departmentCode
    
    if (state.action == 'add' && !state.newDepartment) {
      ElMessageBox.confirm(
        `本次${
          state.action == 'add' ? '新增' : '修改'
        }内容还未保存，确认切换吗？`,
        '提示'
      ).then(() => {
        state.detail = {} as DepartmentModel
        getDeptDetail(node.departmentCode)
      })
    } else {
      getDeptDetail(node.departmentCode)
    }
  }
}
const caseEntry = (check:boolean)=>{
  state.tagFlag=check
}
const addHandle = () => {
  
  if (state.detail.departmentCode) {
    state.action = 'add'
  }else{
    ElMessage.warning('请选择左侧部门为上级部门')
    // state.detail.departmentCode = '0'
    // state.detail.departmentLevel = 0
  }
  console.log(state.detail.departmentCode,state.action);
}

const doDel = () => {
  if(state.currentNode.childs.length>0){
    ElMessage.error("请先删除子节点!");
    return
  }
  if (state.detail.id) {
    ElMessageBox.confirm('是否确定删除？', '提示').then(() => {
      state.submitLoading = true
      state.action = 'del'
      departmentServer.delete(String(state.detail.id)).then((res) => {
        state.submitLoading = false
        ElMessage({
          type: res.code == 200 ? 'success' : 'error',
          message: res.code == 200 ? res.message : (res.data || res.message),
        })
        state.refresh = true
        state.detail = {} as DepartmentModel
        state.newDepartment = {} as DepartmentModel
      }).catch(()=>state.submitLoading = false)
    })
  } else {
    ElMessage.info('请先选择左侧部门')
  }
}

const save = () => {
  if(state.flagArr.length === 2){
    // 检查数据是否被修改
    if(state.flagArr.every(item=>item.isEqual)){
      ElMessage.warning('未修改数据！')
      state.submit = false
      state.submitLoading = false
    }else{
      // console.log('saveOrUpdate',state.form);
      state.submitLoading = true
      
      departmentServer.saveOrUpdate(state.form).then(res=>{
        state.submitLoading = false
        ElMessage({
          type:res.code == 200 ? 'success' :'error',
          message: res.code == 200 ? res.message : (res.data || res.message)
        })
        if(res.code == 200){
          state.newDepartment = res.data
          state.refresh = true
        }
        state.flagArr = []
      }).catch(()=>{
        state.submitLoading = false
        state.flagArr = []
      })
    }
  }
}
const setRefresh = ()=>{
  state.refresh = state.submit = false
  state.action = 'edit'
  state.detail = state.newDepartment
}
const onSubmit = (flag: any, data: DepartmentModel,roleList?:Array<string>) => {
  if (flag.type === 'form') {
    let roleList =  state.form.roleList
    state.form = cloneDeep(data) as DepartmentModel
    state.form.roleList = roleList
    // Object.keys(data).forEach((key): keyof DepartmentModel => state.form[key] = data[key] )

  } else {
    state.form.roleList = roleList || []
  }
  state.flagArr.push(flag)
  save()
}
const submitHandle = ()=>{
  state.flagArr = []
  state.submit = true
  
}
</script>

<style lang="scss" scoped>
.content-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  .dept-add-box {
    width: 70%;
    border-right: 1px solid var(--sh3h-tree-border-color);
  }
  .tree_container {
    width: 30%;
  }
}
</style>
