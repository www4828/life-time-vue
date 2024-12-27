<template>
  <Layout>
    <template #tree>
      <Tree
        ref="treeRef"
        @handleNodeClick="nodeClick"
        :refresh="state.refresh"
        :new="state.formData"
        @setRefresh="setRefresh" 
        :treeJson="{
          type: roleSever,
          name: 'roleName',
          code: 'roleCode',
        }"
      />
    </template>
    <template #button>
      <el-button type="primary" @click="addChildren">新增下级</el-button>
      <el-button
        type="danger"
        @click="deletePermission"
        >删除</el-button
      >
    </template>
    <template #content>
      <el-form
        ref="authForm"
        :model="state.formData"
        label-position="left"
        label-width="140px"
        :rules="rules"
        inline
        class="role-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="父级编码" prop="roleParentCode">
              <el-input v-model="state.formData.roleParentCode" disabled> </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色编码" prop="roleCode">
              <el-input v-model.trim="state.formData.roleCode" :disabled="state.mode === 'edit' " ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色类型" prop="roleType">
              <el-select v-model="state.formData.roleType" placeholder="角色类型">
                <el-option
                  v-for="item in roleOption"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model.trim="state.formData.roleName" maxlength="20"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" >
            <el-form-item label="数据权限" prop="dataScope">
              <el-select v-model="state.formData.dataScope" placeholder="数据权限">
                <el-option
                  v-for="item in dataScopes"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="state.formData.dataScope === '2' " >
            <el-form-item label="自定义数据权限" prop="status" >
              <el-switch
                v-model="state.dataScope"
                :active-value="1"
                :inactive-value="0"
                active-text="用户"
                inactive-text="部门"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="state.formData.dataScope === '2' && !state.dataScope ">
            <el-form-item label="数据权限（部门）" prop="status">
              <el-tree-select
                v-model="state.formData.dataDepts"
                :data="state.departmentList"
                multiple
                :render-after-expand="false"
                node-key="code"
                :props="{
                    children: 'child',
                    label: 'name',
                    value: 'code',
                }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="state.formData.dataScope === '2' && state.dataScope ">
            <el-form-item label="数据权限（用户）" prop="status" >
              <el-input v-model.trim="state.formData.roleName" maxlength="20"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input
                v-model.trim="state.formData.sort"
                maxlength="5"
                @input="valChange"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="status">
              <el-switch
                v-model="state.formData.status"
                :active-value="1"
                :inactive-value="0"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="state.formData.remark"
                :rows="2"
                type="textarea"
                placeholder="备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="permission-tree">
        <Tree
          ref="permissionTreeRef"
          show-checkbox
          :disabled="state.formData.roleType != '1' "
          :checked="state.formData.permissions?.split(',')"
          :treeJson="{
            type: permissionSever,
            name: 'name',
            code: 'permissionCode',
          }"
        />
      </div>
    </template>
    <template #bottom>
      <div class="btnGroup">
        <el-button type="success" @click="submitForm(authForm)" class="save"
          >保存</el-button
        >
        <el-button @click="cancel" class="cancel">取消</el-button>
      </div>
    </template>
  </Layout>
</template>
<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormRules, FormInstance } from 'element-plus'
import { ElMessage, ElTree, ElMessageBox, ElForm } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import Layout from '@/components/Layout/Layout.vue'
import IconSelect from '@/components/iconSelect/index.vue'
import { RoleModel } from '@/api/model/roleModel'
import { RoleService } from "@/api/service/System/RoleService";
import { Response, SearchParamsModel } from '@/api/interface'
import Tree from '@/businessComponent/tree/index.vue'
import { cloneDeep } from 'lodash-es'
import { TreeModel } from '@/api/model/baseModel'
import { PermissionService } from '@/api/service/System/PermissionService'
import { DepartmentService } from '@/api/service/System/DepartmentService'

type FormRules = /*unresolved*/ any

const roleOption = [
  { label: '目录', value: '0' },
  { label: '角色', value: '1' }
]
const dataScopes = [
  { label: '所有', value: '1' },
  { label: '自定义', value: '2' },
  { label: '本部门', value: '3' },
  { label: '本部门及以下', value: '4' },
  { label: '仅本人', value: '5' }
]

const state = reactive({
  refresh: false,
  formData: {} as RoleModel,
  roleParentCode: '',
  departmentList: [],
  mode: '',
  dataScope: 0 // 0-> 部门 1->用户
})

const treeRef = ref<InstanceType<typeof ElTree>>()
const permissionTreeRef =  ref<InstanceType<typeof ElTree>>()
const authForm = ref<InstanceType<typeof ElForm>>()
const keywords = ref('')
const rules = reactive<InstanceType<typeof FormRules>>({
  roleParentCode: [{ required: true, message: '不能为空', trigger: 'blur' }],
  roleCode: [{ required: true, message: '不能为空', trigger: 'blur' }],
  roleName: [{ required: true, message: '不能为空', trigger: 'blur' }],
  roleType: [{ required: true, message: '请选择', trigger: 'change' }],
})

const roleSever = new RoleService()
const permissionSever = new PermissionService()
const departmentSever = new DepartmentService()

const nodeClick = (data: TreeModel) => {
  state.roleParentCode = data.code
  state.mode = 'edit'
  roleSever.list({
    "pageParams": {
      "pageIndex": 0,
      "pageSize": -1
    },
    "searchParams": [
      {
        "key": "roleCode",
        "match": "eq",
        "value": data.code
      }
    ]
  }).then((res) => {
    if (res.code == 200) {
      state.formData = cloneDeep(res.data.results[0])
    }
  })
}

const getDeptList = ()=>{
  departmentSever.tree({
    "pageParams": {
      "pageIndex": 0,
      "pageSize": -1
    },
    "searchParams": []
  }).then(res=>{
    state.departmentList = res.data
  })
}
getDeptList()
const valChange = (value: string) => {
  state.formData.sort = Number(value.replace(/\D/g, ''))
}
const addChildren = () => {
  if (state.roleParentCode === '') {
    ElMessage.error('请选择节点后再添加！')
    return
  }
  state.mode = 'add'
  reset()
}

const reset = () => {
  state.formData = {status: 1,sort: 1,roleParentCode:state.roleParentCode} as RoleModel
}

const cancel = () => {
  reset()
  authForm.value!.clearValidate()
}
const deletePermission = () => {
  if (state.formData.id === '') {
    ElMessage.error('请选择一个节点删除！')
    return
  }
  ElMessageBox.confirm('确定要删除吗？', '删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      roleSever.delete(state.formData.id!).then((res: Response) => {
        if (res.code === 200) {
          ElMessage.success('删除成功!')
          state.refresh = true
          reset()
        } else {
          ElMessage.error(res.message)
        }
      })
    })
}


const save = () => {
  state.formData.permissions = permissionTreeRef.value?.getCheckedKeys().join(',')
  if (state.formData.id) {
    roleSever.update(state.formData).then((res: Response) => {
      if (res.code === 200) {
        ElMessage.success('修改成功!')
        state.refresh = true
      } else {
        ElMessage.error(res.message)
      }
    })
  } else {
    roleSever.save(state.formData).then((res: Response) => {
      if (res.code === 200) {
        ElMessage.success('新增成功!')
        state.refresh = true
      } else {
        ElMessage.error(res.message)
      }
    })
  }
}
const submitForm = async (formEl: InstanceType<typeof FormInstance>) => {
  if (!formEl) return
  await formEl.validate((valid: boolean) => {
    if (valid) {
      save()
    }
  })
}

const setRefresh = ()=>{
  state.refresh =  false
  // state.formData = {} as RoleModel
}

watch(
  () => keywords.value,
  (keywords) => {
    treeRef.value!.filter(keywords)
  }
)
</script>

<style lang="scss" scoped>
.w100,
.tree-menu,
::v-deep(.el-form-item__content),
::v-deep(.el-select) {
  width: 100%;
}

::v-deep(.el-form) {
  width: 65%;
  height: 100%;
  padding-right: 15px;
  float: left;
  box-sizing: border-box;
  border-right: 1px solid #ccc;
  .el-form-item {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}

.btnGroup {
  display: flex;
  justify-content: flex-end;
}

.treeRef {
  background-color: var(--lt-tree-background-color);
}

::v-deep(.el-tree-node__expand-icon:before) {
  background: url('@/assets/system/first.png') no-repeat;
  content: '';
  display: block;
  width: 13px;
  height: 13px;
  font-size: 13px;
  background-size: 13px;
}

::v-deep(.el-tree-node__expand-icon) {
  width: fit-content;

  svg {
    display: none;
  }
}
.permission-tree{
  width: 35%;
  float: right;
  // margin-top: -60px;
  box-sizing: border-box;
  height: 100%;
}
</style>
