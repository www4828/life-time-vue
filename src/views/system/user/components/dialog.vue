<template>
  <el-dialog :model-value="props.dialogVisible" :title="title" width="70%" @close="handleClose" custom-class="card-mark"
    top="100px">
    <div class="content">
      <div class="left">
        <div class="title">基础信息</div>
        <el-form ref="form" :model="props.editform" :rules="editRules" label-position="right" :inline="true" class="form">
          <el-form-item label="用户名:" prop="username">
            <el-input v-model.trim="props.editform.username" placeholder="用户名" :disabled="title === '修改'"></el-input>
          </el-form-item>
          <el-form-item label="姓名:" prop="name">
            <el-input v-model.trim="props.editform.name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item label="部门:" prop="departmentCode">
            <el-tree-select 
              disabled
              v-model="props.editform.departmentCode" 
              :data="state.deptList"
              :render-after-expand="false" 
              :props="treeProps" 
              node-key="departmentCode" 
              value-key="departmentCode"
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
              <el-radio :label="1">男</el-radio>
              <el-radio :label="0">女</el-radio>
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
          show user 
          :departmentCode="props.editform.departmentCode" 
          :submit="state.submit" 
          @onSubmit="onSubmit" 
          :roleList="state.roleList" 
        />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="state.submit = true"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import RoleTree from '@/businessComponent/tree/roleTree/roleTree.vue'
import { DepartmentService } from "@/api/service/System/DepartmentService";
import { verifyPhone } from '@/utils/toolsValidate'
import { UserService } from '@/api/service/System/UserService'
import { useCode } from '@/hooks/useCode'

const validateMobile = (rule: any, value: any, callback: any) => {
  if (verifyPhone(value)) {
    callback()
  } else {
    callback(new Error('号码格式错误，请重新输入'))
  }
}
const editRules = reactive<InstanceType<typeof FormRules>>({
  username: [{ required: true, message: "请输入", trigger: "blur"}],
  name: [{ required: true, message: "请输入", trigger: "blur" }],
  mobile: [{ required: true, trigger: "blur", validator: validateMobile, }],
  idCard: [
    { required: true, message: "请输入", trigger: "blur" },
    { min: 18, max: 18, message: '身份证为18位数', trigger: 'blur' }
  ],
  departmentCode: [{ required: true, trigger: 'blur', message: '请选择部门' }],
});
interface Props {
  dialogVisible?: boolean;
  editform?: any;
  title: string
}
const treeProps = {
  label: 'departmentName',
  value: 'departmentCode',
  children: 'childs',
}

const form: any = ref(null)
const departmentService = new DepartmentService()
const userServer = new UserService()
const props = withDefaults(defineProps<Props>(), {
  dialogVisible: false,
  editform: {
    roleId: "",
    rolename: "",
    sort: 0,
    remark: "",
    status: 0,
  },
});
const emit = defineEmits(["close", "save"]);
const state = reactive({
  deptList: [] as any,
  submit: false,
  roleList: [] as any
})

const { departmentList } = JSON.parse(sessionStorage.getItem('userInfo')!)

const loadDeptList = () => {
  departmentService.tree(departmentList[0].departmentParentCode).then((res) => {
    state.deptList = res.data
  })
}
loadDeptList()
const loadUserRole = () => {
  userServer.listUserRole({
    "pageParams": {
      "pageIndex": 1,
      "pageSize": -1,
      "total": 0
    },
    "searchParams": [
      {
        "key": "userName",
        "match": "eq",
        "value": props.editform.username
      }
    ]
  }).then(res=>{
    state.roleList = res.data.results
  })
}
props.title === '修改' && loadUserRole()

const save = (obj: any) => {
  emit('save', props.title, obj)
  handleClose();
};

const onSubmit = (flag: any, list: any,checkList:any) => {

  let obj = {} as any
  Object.keys(props.editform).forEach(key => {
    obj[key] = props.editform[key]
  })
  flag.type === 'tree' && (obj.roleList = checkList)
  form.value.validate((valid: any, fields: any) => {
    if (valid) {
      save(obj)
    } else {
      state.submit = false
    }
  })
}
const handleClose = () => {
  emit("close", false);
};
</script>
<style lang="scss" scoped></style>