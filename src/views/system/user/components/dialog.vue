<template>
  <el-dialog :model-value="props.dialogVisible" :title="title" width="70%" @close="handleClose" custom-class="card-mark"
    top="100px">
    <div class="content">
      <div class="left">
        <div class="title">基础信息</div>
        <el-form ref="form" :model="props.editform" :rules="editRules" label-position="right" :inline="true" class="form">
          <el-form-item label="用户名:" prop="userCode">
            <el-input v-model.trim="props.editform.userCode" placeholder="用户名" :disabled="title === '修改'"></el-input>
          </el-form-item>
          <el-form-item label="姓名:" prop="userName">
            <el-input v-model.trim="props.editform.userName" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item label="密码:" prop="passWord" v-if="title == '添加' " >
            <el-input v-model.trim="props.editform.passWord" placeholder="密码" show-password></el-input>
          </el-form-item>
          <el-form-item label="昵称:" prop="userNickName">
            <el-input v-model.trim="props.editform.userNickName" placeholder="昵称"></el-input>
          </el-form-item>
          <el-form-item label="部门:" prop="departmentCode">
            <el-tree-select 
              disabled
              v-model="props.editform.departmentCode" 
              :data="state.deptList"
              :render-after-expand="false" 
              :props="{
                  children: 'child',
                  label: 'name',
                  value: 'code',
              }" 
              node-key="code" 
              check-strictly 
              ref="deptParentTree" 
              check-on-click-node 
            />
          </el-form-item>
          <el-form-item label="手机:" prop="mobile">
            <el-input v-model.trim="props.editform.mobile" placeholder="手机" :maxlength="11"></el-input>
          </el-form-item>
          <el-form-item label="身份证:" prop="idCard">
            <el-input v-model.trim="props.editform.idCard" placeholder="身份证" :maxlength="18"></el-input>
          </el-form-item>
          <el-form-item label="性别:" prop="sex">
            <el-radio-group v-model="props.editform.sex">
              <el-radio :label="0">女</el-radio>
              <el-radio :label="1">男</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="邮箱:" prop="email">
            <el-input v-model.trim="props.editform.email" placeholder="邮箱"></el-input>
          </el-form-item>
          <el-form-item label="地址:" prop="address">
            <el-input v-model.trim="props.editform.address" placeholder="地址"></el-input>
          </el-form-item>
          <el-form-item label="备注:" prop="remark">
            <el-input v-model.trim="props.editform.remark" placeholder="备注"></el-input>
          </el-form-item>
          <el-form-item label="是否启用:" prop="status">
            <el-switch v-model="props.editform.status" :active-value="1" :inactive-value="0"></el-switch>
          </el-form-item>
        </el-form>
      </div>
      <div class="right">
        <div class="title">用户角色设置</div>
        <RoleTree
          :showSearch="false"
          ref="roleTreeRef"
          show-checkbox
          :checked="state.checkdeList"
          :treeJson="{ type: roleServer }"
        />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="onSubmit"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import type { FormRules } from "element-plus";
import RoleTree from '@/businessComponent/tree/index.vue'
import { verifyPhone } from '@/utils/toolsValidate'
import { UserService } from '@/api/service/System/UserService'
import { useCode } from '@/hooks/useCode'
import { RoleService } from "@/api/service/System/RoleService";
import { DepartmentService } from "@/api/service/System/DepartmentService";
import { UserModel } from "@/api/model/userModel";
import { Session } from "@/utils/storage";

const validateMobile = (rule: any, value: any, callback: any) => {
  if (verifyPhone(value)) {
    callback()
  } else {
    callback(new Error('号码格式错误，请重新输入'))
  }
}
const editRules = reactive<InstanceType<typeof FormRules>>({
  userCode: [{ required: true, message: "请输入", trigger: "blur"}],
  userName: [{ required: true, message: "请输入", trigger: "blur" }],
  passWord: [{ required: true, message: "请输入", trigger: "blur" }],
  mobile: [{ required: true, trigger: "blur", validator: validateMobile, }],
  // idCard: [
  //   { required: true, message: "请输入", trigger: "blur" },
  //   { min: 18, max: 18, message: '身份证为18位数', trigger: 'blur' }
  // ],
  departmentCode: [{ required: true, trigger: 'blur', message: '请选择部门' }],
});

const form: any = ref(null)
const roleTreeRef = ref()
const roleServer = new RoleService()
const userServer = new UserService()
const departmentService = new DepartmentService()
const props = withDefaults(defineProps<{
  dialogVisible: boolean;
  editform: UserModel;
  title: string
}>(), {
  dialogVisible: false
});
const emit = defineEmits(["close", "save"]);
const state = reactive({
  deptList: [] as any,
  submit: false,
  checkdeList:  [] as string[],
  roleList: [] as UserModel[]
})

const loadDeptList = () => {
  departmentService.tree({
        pageParams: {
          pageIndex: 0,
          pageSize: -1,
        },
        searchParams: [],
      }).then((res) => {
    state.deptList = res.data
  })
}
loadDeptList()
const loadUserRole = () => {
  userServer.getUserRole(props.editform.userCode,Session.get('activeDept')).then(res=>{
    state.checkdeList = res.data?.map((i:any)=>i.roleCode)
    state.roleList = res.data
  })
}

// props.title === '修改' && loadUserRole()

const save = () => {
  let list =  roleTreeRef.value?.getCheckedKeys() as string[],
  roleList = [] as UserModel[]
  list.forEach(role=>{
    if(state.checkdeList.indexOf(role) > -1){
      let index = state.checkdeList.indexOf(role)
      roleList.push(state.roleList[index])
    }else{
      roleList.push({
        roleCode: role,
        roleDept: Session.get('activeDept'),
        userCode: props.editform.userCode
      } as UserModel)
    }
  })
  console.log(roleList);
  
  emit('save',roleList)
  handleClose();
};

const onSubmit = (flag: any, list: any,checkList:any) => {

  // let obj = {} as any
  // Object.keys(props.editform).forEach(key => {
  //   obj[key] = props.editform[key]
  // })
  // flag.type === 'tree' && (obj.roleList = checkList)
  form.value.validate((valid: any, fields: any) => {
    if (valid) {
      save()
    }
  })
}
const handleClose = () => {
  emit("close", false);
};
watch(()=>props.editform,(val)=>{
  val.userCode && loadUserRole()
},{
  immediate: true
})
</script>
<style lang="scss" scoped></style>