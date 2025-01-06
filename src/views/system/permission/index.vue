<template>
  <Layout>
    <template #tree>
      <PermissionTree
        ref="treeRef"
        @handleNodeClick="nodeClick"
        :refresh="state.refresh"
        @setRefresh="setRefresh" 
        :treeJson="{
          type: permissionSever,
          name: 'name',
          code: 'permissionCode',
        }"
      />
    </template>
    <template #button>
      <el-button type="primary" @click="addChildren">新增下级</el-button>
      <el-button
        type="danger"
        @click="deletePermission"
        :disabled="detail.permission.parentId === '-1'"
        >删除</el-button
      >
    </template>
    <template #content>
      <el-form
        ref="authForm"
        :model="detail.permission"
        label-position="left"
        label-width="140px"
        :rules="rules"
        inline
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- <el-form-item label="上级编码" prop="parentId">
              <el-input v-model="detail.permission.parentId" disabled> </el-input>
            </el-form-item> -->
            <el-form-item label="上级菜单" prop="parentName">
              <el-input v-model="detail.permission.parentName" disabled> </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="权限类型" prop="type">
              <el-select v-model="detail.permission.type" placeholder="权限类型">
                <el-option
                  v-for="item in roleOption"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="权限名称" prop="name">
              <el-input v-model.trim="detail.permission.name" maxlength="20"></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item label="权限编码" prop="permissionId">
              <el-input v-model.trim="detail.permission.permissionId" :disabled="state.action == 'edit'" maxlength="20"></el-input>
            </el-form-item>
          </el-col> -->
          <el-col :span="8">
            <el-form-item label="权限地址" prop="url">
              <el-input v-model.trim="detail.permission.url"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="detail.permission.type == '2'">
            <el-form-item label="标签" prop="tag">
              <el-input v-model.trim="detail.permission.tag"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="detail.permission.type === '1'">
            <el-form-item label="图标" prop="icon">
              <IconSelect
                @change="val=>detail.permission.icon = val"
                :value="detail.permission.icon"
                class="w100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="detail.permission.type === '1'">
            <el-form-item label="打开方式" prop="openType">
              <el-select v-model="detail.permission.openType" placeholder="打开方式">
                <el-option
                  v-for="item in openTypeOption"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序" prop="sort">
              <el-input
                v-model.trim="detail.permission.sort"
                maxlength="5"
                @input="valChange"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否启用" prop="status">
              <el-switch
                v-model="detail.permission.status"
                :active-value="1"
                :inactive-value="0"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="detail.permission.remark"
                :rows="2"
                type="textarea"
                placeholder="备注"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="detail.permission.type == '1'">
            <el-form-item label="按钮权限">
              <el-table border :data="detail.buttons">
                <el-table-column prop="name" label="按钮名称" align="center">
                  <template #default="scope">
                    <el-input
                      v-model="detail.buttons[scope.$index].name"
                      style="width: 100%"
                      placeholder="按钮名称"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="tag" label="标签" align="center">
                  <template #default="scope">
                    <el-input
                      v-model="detail.buttons[scope.$index].tag"
                      style="width: 100%"
                      placeholder="标签"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" align="center">
                  <template #default="scope">
                    <el-input
                      v-model="detail.buttons[scope.$index].remark"
                      style="width: 100%"
                      placeholder="备注"
                    />
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  align="center"
                  class-name="setting"
                >
                  <template #default="scope">
                    <el-button
                      type="primary"
                      :icon="Plus"
                      circle
                      size="small"
                      @click="addDocument"
                      v-if="
                        scope.$index === detail.buttons.length - 1 &&
                        detail.buttons.length < 5
                      "
                    />
                    <el-button
                      type="danger"
                      :icon="Delete"
                      circle
                      size="small"
                      @click="deleteDocument(scope)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
import { PermissionModel, PermissionButtonModel } from '@/api/model/permissionModel'
import { PermissionService } from '@/api/service/System/PermissionService'
import { Response, SearchParamsModel } from '@/api/interface'
import { SearchModel } from '@/api/model/baseModel'
// import PermissionTree from '@/businessComponent/tree/permissionTree/index.vue'
import PermissionTree from '@/businessComponent/tree/index.vue'
import { cloneDeep } from 'lodash-es'

interface Tree extends PermissionModel {
  children?: Tree[]
}
type FormRules = /*unresolved*/ any

const roleOption = [
  { label: '目录', value: '0' },
  { label: '菜单', value: '1' },
  { label: '按钮', value: '2' },
]
const openTypeOption = [
  { label: '路由', value: '0' },
  { label: 'iframe打开', value: '1' },
  { label: '弹框', value: '2' },
  { label: '新窗口', value: '3' },
]
const state = reactive({
  refresh: false,
  action: '',
  formData: {} as PermissionModel,
  parentId: '',
  parentName: ''
})
const detail = reactive<PermissionButtonModel>({
  buttons: [] as PermissionModel[],
  permission: {} as PermissionModel  // show->展示 edit->编辑 add->增加
})
const treeRef = ref<InstanceType<typeof ElTree>>()
const authForm = ref<InstanceType<typeof ElForm>>()
const keywords = ref('')
const rules = reactive<InstanceType<typeof FormRules>>({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  nodeCode: [{ required: true, message: '环节编码不能为空', trigger: 'blur' }],
  url: [{ required: true, message: '权限地址不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '权限类型不能为空', trigger: 'change' }],
  permissionId: [{ required: true, message: '权限编码不能为空', trigger: 'blur' }],
})

const permissionSever = new PermissionService()

const nodeClick = (data: Tree) => {
  state.parentId = data.code
  state.parentName = data.name
  state.action = 'edit'
  
  permissionSever.find(data.code!).then((res) => {
    if (res.code == 200 && res.data.permission) {
      detail.permission = cloneDeep(res.data.permission)
      if (res.data.buttons?.length > 0) {
        detail.buttons = res.data.buttons
      } else {
        detail.buttons = [{
          name: '',
          tag: '',
          remark: '',
          type: '2',
          parentId: detail.permission.permissionId,
          sort: 1,
          status: 1,
          url: '#'
        } as PermissionModel]
      }
    }
  })
}

const valChange = (value: string) => {
  detail.permission.sort = Number(value.replace(/\D/g, ''))
}
const addChildren = () => {
  if (!state.parentId) {
    ElMessage.error('请选择节点后再添加！')
    return
  }
  state.action = 'add'
  reset()
}

const reset = () => {
  detail.permission = {status: 1,sort: 1,parentId:state.parentId,parentName: state.parentName} as PermissionModel
  detail.buttons = [{
    name: '',
    tag: '',
    remark: '',
    type: '2',
    parentId: state.parentId,
    parentName: state.parentName,
    sort: 1,
    status: 1,
    url: '#'
  } as PermissionModel]
}

const cancel = () => {
  reset()
  authForm.value!.clearValidate()
}
const deletePermission = () => {
  if (!detail.permission.permissionId) {
    ElMessage.error('请选择一个节点删除！')
    return
  }
  ElMessageBox.confirm('确定要删除吗？', '删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      permissionSever.delete(detail.permission.permissionId!).then((res: Response) => {
        if (res.code === 200) {
          ElMessage.success('删除成功!')
          state.action = 'del'
          state.refresh = true
          reset()
        } else {
          ElMessage.error(res.message)
        }
      })
    })
}

const save = () => {
  let buttons = detail.buttons.filter(i=>i.name)
  
  if (detail.permission.id) {
    permissionSever.updateWithButton({
      permission: detail.permission,
      buttons
    }).then((res: Response) => {
      if (res.code === 200) {
        ElMessage.success('修改成功!')
        state.formData = detail.permission
        state.refresh = true
      } else {
        ElMessage.error(res.message)
      }
    }).finally(()=>state.refresh = false)
  } else {
    permissionSever.saveWithButton({
      permission: detail.permission,
      buttons
    }).then((res: Response) => {
      if (res.code === 200) {
        ElMessage.success('新增成功!')
        state.formData = detail.permission
        state.refresh = true
      } else {
        ElMessage.error(res.message)
      }
    }).finally(()=>state.refresh = false)
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
  state.action = ''
  state.formData = {} as PermissionModel
}

const addDocument = () => {
  detail.buttons.push({
    name: '',
    tag: '',
    remark: '',
    type: '2',
    parentId: detail.permission.permissionId,
    sort: 1,
    status: 1,
    url: '#'
  } as PermissionModel)
}
const deleteDocument = (scope: any) => {
  if(detail.buttons.length > 1){
    detail.buttons = detail.buttons.filter(
      (item, index) => index !== scope.$index
    )
  }else{
    detail.buttons = [{
      name: '',
      tag: '',
      remark: '',
      type: '2',
      parentId: state.parentId,
      parentName: state.parentName,
      sort: 1,
      status: 1,
      url: '#'
    } as PermissionModel]
  }
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
  width: 100%;
  height: 100%;
  box-sizing: border-box;
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
</style>
