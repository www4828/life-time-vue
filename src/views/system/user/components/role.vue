<template>
  <el-dialog :model-value="props.dialogVisible" title="用户角色" width="40%" @close="handleClose" 
    top="100px" custom-class="card-mark user-mark">
    <div class="content user-content">
      <div class="left">
        <div class="title">所属部门</div>
        <div class="dept" :class="state.active == item.departmentCode ? 'active' : ''" @click="clickDeptHandle(item.departmentCode)" v-for="item in state.deptList">{{ item.departmentName }}</div>
      </div>
      <div class="right">
        <div class="title">可选角色</div>
        <RoleTree
          ref="roleTreeRef"
          show-checkbox
          :showLine="false"
          :content=state.roleTree
          :showSearch="false"
          :checked="state.checked"
        />
          <!-- :checked="state.departmentRoles" -->
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="onSubmit"> 提交 </el-button>
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import type { FormRules } from "element-plus";
import { Delete } from '@element-plus/icons-vue'
import RoleTree from '@/businessComponent/tree/index.vue'
import { DepartmentService } from "@/api/service/System/DepartmentService";
import { verifyPhone } from '@/utils/toolsValidate'
import { UserService } from '@/api/service/System/UserService'
import { useCode } from '@/hooks/useCode'
import { UserModel } from "@/api/model/userModel";
import { DepartmentModel } from "@/api/model/departmentModel";
import { TreeModel } from "@/api/model/baseModel";
import { ElMessage } from "element-plus";
import { RoleService } from "@/api/service/System/RoleService";
import { active } from "sortablejs";

const roleServer = new RoleService()
const departmentServer = new DepartmentService()

const userServer = new UserService()
const props = withDefaults(defineProps<{
  dialogVisible: boolean;
  userCode: string
  deptCode: string
}>(), {
  dialogVisible: false
});
const emit = defineEmits(["close", "save"]);
const roleTreeRef = ref()
const state = reactive({
  deptList: [] as DepartmentModel[],
  submit: false,
  roleList: [] as any,
  active: '',
  roleTree: [],
  checked: []
})


const getUserDept = () => { // 获取用户部门
  userServer.getUserDept(props.userCode).then(res=>{
    state.deptList = res.data
    clickDeptHandle(props.deptCode)
  })
}
const getUserRole = () => { // 获取用户角色
  userServer.getUserRole(props.userCode, state.active).then(res=>{
    state.checked = res.data.map((i:any)=>i.roleCode)
  })
}
const getDeptRoleTree = (code:string) => { // 获取部门角色树
  state.roleTree = []
  roleServer.deptRoleTree(code).then(res=>{
    state.roleTree = res.data
    getUserRole()
  }).catch(()=>state.roleTree = [])
}

const clickDeptHandle = (code:any)=>{
  state.active = code
  state.checked = []
  getDeptRoleTree(code)
}
const setUserRole = (params:UserModel[]) => { 
  userServer.saveUserRoleFull(params as UserModel[]).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'danger',
      message: res.message
    })
    getUserDept()
  })
}

const save = () => {
  emit('save')
  handleClose();
};

const onSubmit = () => {
  let keys = roleTreeRef.value.getCheckedKeys(),
  params = [] as UserModel[]
  keys.forEach((key:string)=>{
    params.push({
      roleCode: key,
      roleDept: state.active,
      userCode: props.userCode
    } as UserModel)
  })
  setUserRole(params)
}
const handleClose = () => {
  emit("close", false);
};
watch(()=>props.userCode,()=>{
  props.userCode && getUserDept()
},{
  immediate: true
})

</script>
<style lang="scss" scoped>
.content{
  .dept{
    height: 30px;
    padding: 0 10px 10px;
    box-sizing: border-box;
    line-height: 30px;
    cursor: pointer;
    &:hover{
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    }
    &.active{
      color: var(--el-color-primary);
    }
  }
}
</style>