<template>
  <div class="tree_container">
    <div class="header-search">
      <el-input
        placeholder="请输入内容"
        :prefix-icon="Search"
        v-model="data.filterText"
      />
    </div>
    <div class="split-line"></div>
    <div class="tree">
      <el-tree
        :empty-text="data.emptyText"
        :data="data.list"
        :props="defaultProps"
        @node-click="handleNodeClick"
        node-key="code"
        :filter-node-method="filterNode"
        ref="treeRef"
        highlight-current
        class="treeRef"
        expand-on-click-node
        :default-expanded-keys="data.expanded"
        check-on-click-node
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <el-link
              v-if="data.type == '1' && props.checked?.indexOf(data.code) === -1 "
              type="primary"
              @click="append(data)"
              :underline="false"
              :icon="CirclePlus"
            ></el-link>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { CirclePlus, Search } from '@element-plus/icons-vue'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { DepartmentModel } from '@/api/model/departmentModel'
import { DepartmentService } from '@/api/service/System/DepartmentService'

const departmentServer = new DepartmentService()
const treeRef: any = ref(null)
const emits = defineEmits(['handleNodeClick', 'append', 'getTree'])
const props = defineProps({
  checked: Array,
})
const data = reactive({
  list: [] as any,
  filterText: '',
  checkedNode: [] as Array<DepartmentModel>,
  emptyText: '加载中...',
  node: {} as any,
  expanded: [] as any,
})

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
}
// 搜索
const filterNode = (value: string, data: DepartmentModel) => {
  if (!value) return true
  return data.name.includes(value)
}
// 点击部门
const handleNodeClick = (node: any) => {
  node.isActive = true
  data.node = node
  emits('handleNodeClick', node)
}
// 读取全部
const loadData = () => {
  data.list = []
  departmentServer
    .tree({
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
        total: 0,
      },
      searchParams: [],
    })
    .then((res) => {
      data.list = res.data
      data.expanded = [data.list[0].code]
    })
    .catch(() => (data.emptyText = '暂无数据'))
}
loadData()

const append = (data: any) => {
  emits('append', data)
}

watch(data, (val) => {
  treeRef.value?.filter(val.filterText)
  data.emptyText = treeRef.value?.filter(val.filterText)
    ? '加载中...'
    : '暂无数据'
})
</script>

<style lang="scss" scoped>
.tree_container {
  height: 100%;
  .tree {
    height: calc(100% - 70px);
  }
  .custom-tree-node {
    width: 100%;
    display: flex;
    justify-content: space-between;
    .el-link {
      font-size: 18px;
    }
  }
}
</style>
