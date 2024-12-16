<template>
  <div class="tree_container">
    <div class="header-search">
      <el-input
        placeholder="请输入内容"
        :prefix-icon="Search"
        v-model="data.filterText"
      />
    </div>
    <!--这是一个完美的分割线-->
    <div class="split-line"></div>
    <div class="tree">
      <el-tree
        :empty-text="data.emptyText"
        :data="data.list"
        :props="defaultProps"
        @node-click="handleNodeClick"
        node-key="departmentCode"
        :filter-node-method="filterNode"
        ref="treeRef"
        highlight-current
        class="treeRef"
        expand-on-click-node
        :default-expanded-keys="data.expanded"
        check-on-click-node
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
import { Session } from '@/utils/storage'

const departmentServer = new DepartmentService()
const treeRef: any = ref(null)
const emits = defineEmits(['handleNodeClick', 'setRefresh','getTree'])
const props = defineProps({
  action: String,
  checkbox: Boolean,
  checked: Array,
  refresh: Boolean,
  new: Object
})
const data = reactive({
  list: [] as any,
  filterText: '',
  checkedNode: [] as Array<DepartmentModel>,
  emptyText: '加载中...',
  node: {} as any,
  expanded: [] as any
})

const customNodeClass = (data: any, node: Node) => {
  
  if (node.level == 1) {
    return 'first'
  } else{
    return ''
  }
  // else if (data.childs.length == 0) {
  //   return 'dept'
  // }
  // return ''
}
const defaultProps = {
  children: 'childs',
  label: 'departmentName',
  value: 'departmentCode',
  class: customNodeClass,
}
// 搜索
const filterNode = (value: string, data: DepartmentModel) => {
  if (!value) return true
  return data.departmentName.includes(value)
}
// 点击部门
const handleNodeClick = (node: any) => {
  
  node.isActive = true
  data.node = node
  emits('handleNodeClick', node)
}
// 读取全部
const loadData = () => {
  let  { departmentList }=Session.get("userInfo");
  
  data.list = []
  departmentServer.tree(departmentList[0].departmentCode).then((res) => {
    // data.list = res.data
    data.list = [{
      departmentCode: departmentList[0].departmentCode,
      departmentName: departmentList[0].departmentName,
      childs: res.data
    }]
    emits('getTree',data.list)
    data.expanded = [data.list[0].departmentCode]
  }).catch(()=>data.emptyText = '暂无数据')
}
loadData()
// 设置选中
const setCheckedNodes = () => {
  if (props.checked) {
    treeRef.value.setCheckedNodes(props.checked, false)
  }
}
// 操作部门树
const setTree = ()=>{
  switch(props.action){
    case 'add':
      treeRef.value!.append({ ...props.new, childs: [] }, treeRef.value!.getCurrentKey());
      treeRef.value!.setCurrentKey(props.new?.departmentCode,true)
      data.node = treeRef.value!.getCurrentNode()
      emits('handleNodeClick', data.node)
      break;
    case 'edit':
      data.node.departmentName = props.new?.departmentName
      break;
    case 'del':
      treeRef.value!.remove(data.node);
    case 'done':
      break;
  }
  emits('setRefresh',false)
}

watch(data, (val) => {
  treeRef.value?.filter(val.filterText)
  data.emptyText = treeRef.value?.filter(val.filterText) ? '加载中...' : '暂无数据'
})
watch(()=>props.checked, (val) => {
  val && setCheckedNodes
})
watch(()=>props.refresh, (val) => {
  val && setTree()
})
</script>

<style lang="scss" scoped>
.tree_container{
  height: 100%;
  .tree{
    height: calc(100% - 70px);
  }
}
</style>
