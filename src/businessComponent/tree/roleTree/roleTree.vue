<template>
  <div class="tree_container">
    <template v-if="!props.show">
      <div class="rolePool">
        角色池
      </div>
      <div class="header-search">
        <el-input
          placeholder="请输入内容"
          :prefix-icon="Search"
          v-model="data.filterText"
        >
        </el-input>
      </div>
      <!--这是一个完美的分割线-->
      <div class="split-line"/>
    </template>
    <div class="tree">
      <el-tree
        :empty-text="data.emptyText"
        :data="data.list"
        :props="defaultProps"
        @check-change="handleCheckChange"
        node-key="roleId"
        :filter-node-method="filterNode"
        ref="roletreeRef"
        highlight-current
        class="treeRef"
        expand-on-click-node
        show-checkbox
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { Search, Edit, Delete } from '@element-plus/icons-vue'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { DepartmentModel } from '@/api/model/departmentModel'
import { DepartmentService } from '@/api/service/System/DepartmentService'
import { UserService } from '@/api/service/System/UserService'
import { RoleModel } from '@/api/model/roleModel'
import { RoleService } from '@/api/service/System/RoleService'
import { ElMessage } from 'element-plus'
import { Session } from '@/utils/storage'
import { cloneDeep,isEqual } from 'lodash-es'

const loading = ref(false)
const departmentServer = new DepartmentService()
const userServer = new UserService()
const roletreeRef: any = ref(null)
const emits = defineEmits(['caseEntry', 'changeHandle','onSubmit'])
const props = defineProps({
  action: String,
  refresh: Boolean,
  departmentCode: String,
  show: Boolean,
  submit: Boolean,
  user: Boolean,
  new: Object,
  roleList: Array
})
const data = reactive({
  list: [] as any,
  filterText: '',
  checkedNode: [] as Array<DepartmentModel>,
  emptyText: '暂无数据',
  initialList: [] as any
})

const customNodeClass = (data: any, node: Node) => {
  if (node.data.roleName) {
    return 'none'
  }
  if (node.level == 1) {
    return 'first'
  } else if (data.type == 2) {
    return 'dept'
  }
  return 'dept'
}
const defaultProps = {
  label: 'roleName',
  value: 'roleId',
  class: customNodeClass,
}

// 搜索
const filterNode = (value: string, data: RoleModel) => {
  if (!value) return true
  return data.roleName.includes(value)
}

const handleCheckChange = (node: any, check: any) => {
  if (!props.departmentCode && !props.user && props.action != 'add') {
    ElMessage.error('请选择部门后设置角色')
    roletreeRef.value.setCheckedNodes([])
  }else{
    if(node.roleName === '工单录入'){
      emits('caseEntry',check)
    }
  }
}

const loadData = () => {
  let  { departmentList }=Session.get("userInfo");
  data.list = []
  departmentServer.listDeptRole(props.user ? (props.departmentCode || departmentList[0].departmentCode ) : departmentList[0].departmentCode).then((res) => {
    if(res.data.length>0){
      data.list = res.data
    }
  })
  
}
loadData()
// 设置选中
const loadDeptData = () => {
  loading.value = true
  departmentServer.listDeptRole(props.departmentCode).then((res) => {
    loading.value = false
    if(res.data?.length>0){
      data.initialList = res.data.map((i:any)=>i.roleId)
    }else{
      data.initialList = []
    }
    roletreeRef.value.setCheckedKeys(data.initialList)
  })
}


const submit = ()=>{
  let checkList = roletreeRef.value.getCheckedKeys()
  
  let flag = isEqual(cloneDeep(checkList),cloneDeep(data.initialList))
  emits('onSubmit', {type:'tree',isEqual:flag},null,checkList)
  !flag && ( data.initialList = checkList)
  
}
watch(()=>data.filterText, (val) => {
  roletreeRef.value?.filter(val)
})
watch(()=>props.action, (val) => {
  switch(val){
    case 'del':
      data.initialList=[]
    case 'add':
      roletreeRef.value.setCheckedKeys([])
      break
    default:
      roletreeRef.value.setCheckedKeys(data.initialList)
  }
})
watch(()=>props.departmentCode, (val) => {
  if(props.departmentCode){
    !props.user && loadDeptData()
      props.user && loadData()
  }
})
watch(()=>props.submit, (val) => {
  val && submit()
})
watch(()=>props.roleList, (val) => {
  val!.length >0 && roletreeRef.value.setCheckedKeys(val?.map((i:any)=>i.roleId))
})
</script>

<style lang="scss" scoped>
.tree_container {
  height: 100%;
  position: relative;
  .tree {
    height: calc(100% - 70px);
  }
  .rolePool{
    width: 100%;
    height: 30px;
    font-size: 16px;
    padding: 0 20px;
    position: absolute;
    top: -15px;
    text-align: center;
    box-sizing: border-box;
    color: var(--lt-tree-color);
  }
}
</style>
