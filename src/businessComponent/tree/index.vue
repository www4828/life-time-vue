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
        :check-strictly="props.checkStrictly"
        :check-on-click-node="!props.showCheckbox"
        >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span style="margin-right: 25px;" >{{ node.label }}</span>
            <el-link v-if="props.operate" :icon="FolderAdd" type="primary" style="margin-right: 2px;" @click="emits('addHandle', data)"></el-link>
            <el-link v-if="props.operate" :icon="Edit" type="primary" style="margin-right: 2px;" @click="emits('editHandle', data)"></el-link>
            <el-popconfirm title="是否确定删除此节点?" hide-icon width="160px" @confirm="removeNode(node, data)">
              <template #reference>
                <el-link v-if="props.operate && !data[defaultProps.children] " :icon="Delete" type="danger"></el-link>
              </template>
              <template #actions="{ confirm, cancel }">
                <el-button size="mini" @click="cancel">取消</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @confirm="confirm"
                >
                  确定
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-tree>
        <!-- expand-on-click-node -->
        <!-- check-on-click-node -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, reactive, ref, watch } from 'vue'
import { Search, FolderAdd, Delete, Edit } from '@element-plus/icons-vue'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { TreeModel } from '@/api/model/baseModel'
import { cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus'

const treeRef: any = ref(null)
const emits = defineEmits(['handleNodeClick', 'setRefresh', 'getTree','addHandle', 'editHandle'])
const props = withDefaults(
  defineProps<{
    checked?: Array<string>,
    refresh?: boolean, // 刷新
    new?: any,  // 新增数据
    treeJson?: any, // 
    content?: any, // 默认数据
    showCheckbox?: boolean, // 显示多选框
    showSearch?: boolean, // 显示搜索框
    showLine?: boolean, // 显示分割线
    disabled?: boolean, // 禁选
    operate?: boolean, // 显示删除图标
    checkStrictly?: boolean // 严格模式
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

const removeNode = (node:any, data:any)=>{
  if (props.treeJson?.type && data.id) {
    props.treeJson?.type
      .delete(data.id)
      .then((res: any) => {
        ElMessage({
          type: res.code == 200 ? 'success' : 'danger',
          message:res.message
        })
        loadData()
      })
      .catch(() => (state.emptyText = '暂无数据'))
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
        let key = props.new ? props.new![props.treeJson.code] : state.node[nodeKey]
        
        state.expandedList = [state.list[0][nodeKey],key]
        
        nextTick(()=>{
          treeRef.value!.setCurrentKey(key, true)
        })
        emits('setRefresh', false)
        emits('getTree', state.list)
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
      val && (state.expandedList = cloneDeep(val))
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
watch(
  () => props.content,
  (val) => {
    if(val.length>0){
      state.list = val
    }
  },
  {
    deep: true
  }
)
defineExpose({
  getCheckedKeys(){
    return treeRef.value?.getCheckedKeys()
  },
  getTreeKeys(){
    let keys = treeRef.value?.getCheckedKeys().concat(treeRef.value?.getHalfCheckedKeys()) 
    return keys
  }
})
</script>

<style lang="scss" scoped>
.tree_container {
  height: 100%;
  .tree {
    height: calc(100% - 70px);
  }
  .custom-tree-node {
    // flex: 1;
    // display: flex;
    // align-items: center;
    // justify-content: space-between;
    // font-size: 14px;
    // padding-right: 8px;
  }
}
</style>
