<template>
  <div class="tree_container">
    <div class="header-search" v-if="props.showSearch">
      <el-input
        placeholder="请输入内容查找"
        :prefix-icon="Search"
        v-model="state.filterText"
      />
    </div>
    <!--这是一个完美的分割线-->
    <div class="split-line" v-if="props.showLine"></div>
    <div class="tree">
      <el-tree
        :empty-text="state.emptyText"
        :data="state.list"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :node-key="nodeKey"
        :filter-node-method="filterNode"
        ref="treeRef"
        highlight-current
        class="treeRef"
        :default-expanded-keys="state.expandedList"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
        :show-checkbox="props.showCheckbox"
        :check-on-click-node="!props.showCheckbox"
        :check-strictly="props.checkStrictly"
        />
        <!-- expand-on-click-node -->
        <!-- check-on-click-node -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, reactive, ref, watch } from 'vue'
import { Search, Edit, Delete } from '@element-plus/icons-vue'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { TreeModel } from '@/api/model/baseModel'
import { cloneDeep } from 'lodash-es'

const treeRef: any = ref(null)
const emits = defineEmits(['handleNodeClick', 'setRefresh', 'getTree'])
const props = withDefaults(
  defineProps<{
    action?: string,
    checkbox?: boolean,
    checked?: Array<string>,
    refresh?: boolean,
    new?: any,
    treeJson: any,
    showCheckbox?: boolean,
    showSearch?: boolean,
    showLine?: boolean
    disabled?: boolean,
    checkStrictly?: boolean
  }>(),
  {
    showSearch: true,
    showLine: true
  }
);

const state = reactive({
  list: [] as TreeModel[],
  filterText: '',
  checkedNode: [] as Array<TreeModel>,
  emptyText: '加载中...',
  node: {} as TreeModel,
  expandedList: [] as string[]
})
const nodeKey = 'code'
const customNodeClass = (data: any, node: Node) => {
  if (node.level == 1) {
    return 'first'
  } else {
    return ''
  }
}
const defaultProps = {
  children: 'child',
  label: 'name',
  value: 'code',
  class: customNodeClass,
  disabled: ()=> props.disabled
}

// 搜索
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.includes(value)
}
// 点击
const handleNodeClick = (node: any) => {
  node.isActive = true
  state.node = node
  emits('handleNodeClick', node)
}

const handleNodeExpand = (data: any, node: any) => {
  // 保存当前展开的节点
  let flag = false
  state.expandedList.some((ele: any) => {
    if (ele === data[nodeKey]) {
      // 判断当前节点是否存在，存在则不做处理
      flag = true
      return true
    }
  })

  if (!flag) {
    // 不存在则存到数组中
    state.expandedList.push(data[nodeKey])
  }
}
const handleNodeCollapse = (data: any, node: any) => {
  // 删除当前缩起的节点及其子节点
  state.expandedList.some((item:any, i:any) => {
    if (item === data[nodeKey]) {
      state.expandedList.splice(i, 1)
    }
  })
  removeChildrenIds(data)
}
const removeChildrenIds = (data: any) => {
  if (data.children) {
    data.children.forEach((item:any) => {
      const index = state.expandedList.indexOf(item[nodeKey])
      if (index > 0) {
        state.expandedList.splice(index, 1)
      }
      removeChildrenIds(item)
    })
  }
}
// 读取全部
const loadData = () => {
  if (props.treeJson?.type) {
    props.treeJson?.type
      .tree({
        pageParams: {
          pageIndex: 0,
          pageSize: -1,
        },
        searchParams: [],
      })
      .then((res: any) => {

        state.list = res.data
        let key = props.new ?  props.new![nodeKey] : state.node[nodeKey]
        state.expandedList = [state.list[0][nodeKey],key]
        
        nextTick(()=>{
          treeRef.value!.setCurrentKey(key, true)
        })
        emits('setRefresh', false)
      })
      .catch(() => (state.emptyText = '暂无数据'))
  }
}
loadData()

watch(state, (val) => {
  treeRef.value?.filter(val.filterText)
  state.emptyText = treeRef.value?.filter(val.filterText)
    ? '加载中...'
    : '暂无数据'
})
watch(
  () => props.checked,
  (val) => {
    nextTick(()=>{
      treeRef.value.setCheckedKeys(val)
      val && (state.expandedList = val)
    })
  },
  {
    deep: true
  }
)
watch(
  () => props.refresh,
  (val) => {
    val && loadData()
  }
)

defineExpose({
  getCheckedKeys(){
    return treeRef.value?.getCheckedKeys()
  }
})
</script>

<style lang="scss" scoped>
.tree_container {
  height: 100%;
  .tree {
    height: calc(100% - 70px);
  }
}
</style>
