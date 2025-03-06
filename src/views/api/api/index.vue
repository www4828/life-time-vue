<template>
  <Layout>
    <template #tree>
      <div class="tree_container">
        <div class="header-search">
          <div class="header-left">
            <el-icon>
              <Menu />
            </el-icon>
            API分类
          </div>
          <el-button type="primary" size="small" @click="createSql"
            >创建</el-button
          >
        </div>
        <div class="split-line" />
        <div class="tree">
          <ApiGroupTree
            @handleNodeClick="handleNodeClick"
            @addHandle="addApiGroupHandle"
            @editHandle="editApiGroupHandle"
            @getTree="(val) => (apiState.apiGroupList = val)"
            :showSearch="false"
            :showLine="false"
            :treeJson="{ type: apiGroupSever }"
            :refresh="state.refresh"
            @setRefresh="() => (state.refresh = false)"
            operate
          />
        </div>
      </div>
      <el-dialog
        v-model="state.groupDialogShow"
        :title="state.groupFlag === 'add' ? '创建分组' : '修改分组'"
        width="500"
      >
        <el-form
          ref="groupForm"
          :inline="true"
          :model="state.groupForm"
          class="dataForm"
          :rules="rules"
        >
          <el-form-item label="分组编码:" prop="groupCode" class="long_item">
            <el-input
              v-model="state.groupForm.groupCode"
              placeholder="接口编码"
              :disabled="state.groupFlag === 'edit'"
              clearable
            />
          </el-form-item>
          <el-form-item label="分组名称:" prop="groupName" class="long_item">
            <el-input
              v-model="state.groupForm.groupName"
              placeholder="接口名称"
              clearable
            />
          </el-form-item>
          <el-form-item
            label="上级分组:"
            prop="parentCode"
            class="long_item"
            v-if="state.groupFlag === 'add'"
          >
            <el-tree-select
              v-model="state.groupForm.parentCode"
              :data="apiState.apiGroupList"
              :render-after-expand="false"
              node-key="code"
              clearable
              check-strictly
              :props="{ children: 'child', label: 'name', value: 'code' }"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" @click="submitGroup"> 确定 </el-button>
          </div>
        </template>
      </el-dialog>
    </template>
    <template #content>
      <SqlTable v-if="state.isTable" :groupCode="apiState.groupCode" @edit="editSqlInfo" />
      <SqlCreate
        v-else
        @back="state.isTable = true"
        :list="apiState.apiGroupList"
        :groupCode="apiState.groupCode"
        :apiInfo="state.apiInfo"
      />
    </template>
  </Layout>
</template>
<script scoped lang="ts" setup>
import { reactive, ref } from 'vue'
import { Menu } from '@element-plus/icons-vue'
import Layout from '@/components/Layout/Layout-v2.vue'
import { ApiInfoService, ApiGroupService } from '@/api/service/Api/ApiService'
import { ApiGroupModel, ApiModel, ApiBaseInfoModel } from '@/api/model/apiModel'
import { ElMessage } from 'element-plus'
import ApiGroupTree from '@/businessComponent/tree/index.vue'
import type { FormRules } from 'element-plus'
import SqlTable from './components/sqlTable.vue'
import SqlCreate from './components/sqlCreate.vue'
import { useApiData } from '@/views/api/api/useApiData'

const apiInfoSever = new ApiInfoService()
const apiGroupSever = new ApiGroupService()
const groupForm = ref()
const { apiState } = useApiData()
const rules = reactive<InstanceType<typeof FormRules>>({
  apiCode: [{ required: true, message: '不能为空', trigger: 'blur' }],
  apiName: [{ required: true, message: '不能为空', trigger: 'blur' }],
})

const state = reactive({
  groupDialogShow: false,
  groupForm: {} as ApiGroupModel,
  apiInfo: {} as ApiModel,
  groupFlag: '',
  refresh: false,
  isTable: true,
})

const closeDialog = () => {
  state.groupDialogShow = false
  state.groupForm = {} as ApiGroupModel
}

const handleNodeClick = (node: any) => {
  apiState.groupCode = node.code
}

const submitGroup = () => {
  groupForm.value.validate((valid: boolean) => {
    if (valid) {
      if (state.groupFlag === 'add') {
        apiGroupSever.save(state.groupForm).then((res) => {
          ElMessage({
            type: res.code == 200 ? 'success' : 'danger',
            message: res.message,
          })
          if (res.code === 200) {
            state.groupDialogShow = false
            state.refresh = true
          }
        })
      } else {
        apiGroupSever
          .update(state.groupForm.id!, state.groupForm)
          .then((res) => {
            ElMessage({
              type: res.code == 200 ? 'success' : 'danger',
              message: res.message,
            })
            if (res.code === 200) {
              state.groupDialogShow = false
              state.refresh = true
            }
          })
      }
    }
  })
}

const addApiGroupHandle = (row: any) => {
  state.groupForm.parentCode = row.code
  state.groupFlag = 'add'
  state.groupDialogShow = true
}
const editApiGroupHandle = (row: any) => {
  state.groupFlag = 'edit'
  state.groupForm.groupCode = row.code
  state.groupForm.id = row.id
  state.groupForm.groupName = row.name
  state.groupDialogShow = true
}

const createSql = () => {
  state.apiInfo = {} as ApiModel
  state.isTable = false
}
const editSqlInfo = (row: ApiModel)=>{
  console.log(row);
  
  state.apiInfo = row
  state.isTable = false
}
</script>
<style lang="scss" scoped>
.tree_container {
  height: 100%;

  .tree {
    height: calc(100% - 70px);
  }

  .header-search {
    padding: 10px 20px 0;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;

    .header-left {
      color: var(--lt-historyCase-value-color);
      font-size: 14px;
      display: flex;
      align-items: center;

      .el-icon {
        color: var(--el-color-primary);
        margin: 2px 5px 0 0;
      }
    }
  }

  .split-line {
    margin-top: 10px;
  }
}

.sh3h-search-box {
  background-color: var(--lt-tree-background-color);
}
</style>
