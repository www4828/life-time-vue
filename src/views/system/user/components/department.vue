<template>
  <el-dialog :model-value="props.dialogVisible" title="用户部门" width="65%" @close="handleClose" 
    top="100px" custom-class="card-mark">
    <div class="content user-content">
      <div class="right">
        <!-- <div class="title">部门数据</div> -->
        <DepartmentTree
          @append="setUserDept"
          :checked="state.checked"
        />
      </div>
      <div class="left">
        <div class="title">所属部门</div>
        <el-table
              :data="state.deptList"
              style="width: 100%"
              height="500px"
              :default-sort="{ prop: 'xuhao', order: 'descending' }"
              :header-cell-style="{
                'text-align': 'center',
              }"
              :cell-style="{ 'text-align': 'center' }"
            >
              <el-table-column prop="departmentCode" label="部门编码" />
              <el-table-column prop="departmentName" label="部门名称" />
              <el-table-column prop="departmentLevel" label="部门层级" />
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <el-tag v-if="scope.row.status" type="success">启用</el-tag>
                  <el-tag v-else type="danger">停用</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-link type="danger" :icon="Delete" @click="deleteHandle(scope.row.id)" >删除</el-link>
                </template>
              </el-table-column>
            </el-table>
      </div>
    </div>
    <!-- <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="onSubmit"> 确定 </el-button>
      </span>
    </template> -->
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import type { FormRules } from "element-plus";
import { Delete } from '@element-plus/icons-vue'
import DepartmentTree from '@/businessComponent/tree/departmentTree/index.vue'
import { DepartmentService } from "@/api/service/System/DepartmentService";
import { verifyPhone } from '@/utils/toolsValidate'
import { UserService } from '@/api/service/System/UserService'
import { useCode } from '@/hooks/useCode'
import { UserModel } from "@/api/model/userModel";
import { DepartmentModel } from "@/api/model/departmentModel";
import { TreeModel } from "@/api/model/baseModel";
import { ElMessage } from "element-plus";

const departmentService = new DepartmentService()

const userServer = new UserService()
const props = withDefaults(defineProps<{
  dialogVisible: boolean;
  userCode: string
}>(), {
  dialogVisible: false
});
const emit = defineEmits(["close", "save"]);
const state = reactive({
  deptList: [] as DepartmentModel[],
  submit: false,
  roleList: [] as any,
  checked: []
})


const getUserDept = () => {
  userServer.getUserDept(props.userCode).then(res=>{
    state.deptList = res.data
    state.checked = res.data.map((i:any)=>i.departmentCode)
  })
}
const setUserDept = (json: TreeModel) => {
  userServer.saveUserDept([{
    departmentCode: json.code,
    userCode: props.userCode
  }] as UserModel[]).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'danger',
      message: res.message
    })
    getUserDept()
  })
}
const deleteHandle = (id:string)=>{
  userServer.deleteUserDept(id).then(res=>{
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
}
</style>