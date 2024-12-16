<template>
  <el-table
    :data="data.tableData"
    style="width: 100%;margin-bottom: 20px"
    @selection-change="handleSelectionChange"
    ref="checkTable"
  >
    <el-table-column type="selection" min-width="2%" />
    <el-table-column
      prop="applyTime"
      label="申请日期"
      min-width="10%"
      show-overflow-tooltip
    />
    <el-table-column prop="applyPerson" label="申请人" min-width="8%" />
    <el-table-column
      prop="applyDepartmentCodeName"
      label="申请部门"
      show-overflow-tooltip
      min-width="12%"
    />
    <el-table-column prop="chargeReasonName" label="退单理由" min-width="8%" />
    <el-table-column prop="executeType" label="是否主责" min-width="6%">
      <template #default="scope">
        {{ scope.row.executeType == '1' ? '是' : '否' }}
      </template>
    </el-table-column>
    <el-table-column prop="description" label="退单说明" min-width="12%">
      <template #default="scope">
        <el-popover
          placement="left"
          :popper-style="{ letterSpacing: '3px' }"
          :width="500"
          trigger="hover"
          :content="scope.row.description"
        >
          <template #reference>
            <span class="ellipsis">
              {{ scope.row.description }}
            </span>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <!-- <el-table-column prop="description" label="操作" min-width="5%">
      <template #default="scope">
        <el-link type="primary" :underline="false" @click="data.show = true" :disabled="data.id != scope.row.id && data.applyDetail?.backId != scope.row.id" >操作</el-link>
      </template>
    </el-table-column> -->
  </el-table>
  
  
  <!-- <el-dialog
    :model-value="data.show"
    width="60%"
    @close="data.show = false "
    :show-close="false"
    :close-on-click-modal="false"
    draggable
    custom-class="return-popup"
    >
    <returnApply 
      :taskId="props.taskId"
      :flowModel="{}"
      :submit="false"
      :attachments="[]"
      :allFiles="[]"
      :caseInfo="{}"
      :nodeCode="''"
      :backId="data.backId"
      :applyDetail="data.applyDetail"
      ref="returnApplyRef"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="data.show = false">取消</el-button>
        <el-button type="primary" @click="applySave">确定</el-button>
      </span>
    </template>
  </el-dialog> -->
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { useDepartment } from "@/hooks/useDepartment";
import returnApply from './returnApply.vue';
import { ReturnModel } from '@/api/model/caseModel'

const disposeService = new DisposeService()
const { currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const checkTable = ref()
const props = withDefaults(
  defineProps<{
    taskId: string
  }>(),
  {
    taskId: '',
  }
)

const emit = defineEmits(['changeCheck'])
const returnApplyRef = ref()
const data = reactive({
  tableData: [] as any,
  id:'',
  show: false,
  backId: '',
  applyDetail:{} as ReturnModel,
  isAssist: false,
  applyDepartmentCode: ''
})

const handleSelectionChange = (val: any) => {
  
  if (val.length <= 0) {
    if (data.tableData.length === 1) {
      checkTable.value.toggleRowSelection(data.tableData[0], true)
    } else {
      data.id = ''
      data.applyDepartmentCode = "";
    }
  } else {
    data.id = val[0].id
    if (val.length > 1) {
      ElMessage.warning('只能选择一个申请信息！')
      val.forEach(
        (i: any, index: number) =>
          index > 0 && checkTable.value.toggleRowSelection(i, false)
      )
      data.isAssist = false;
    } else {
      if (
        data.tableData.some((item: any) => item.executeType == '0') &&
        val[0].executeType == '1'
      ) {
        checkTable.value.toggleRowSelection(val[0], false)
        ElMessage.warning('请先选择协办部门进行审核')
      } else {
        data.id= val[0].id
        data.isAssist = val[0].executeType == "1" ? false : true;
        data.applyDepartmentCode = val[0].applyDepartmentCode;
      }
    }
  }
  data.id && getReturnDetailByBackId(data.id)
}
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve,reject) => {
    returnApplyRef.value?.checkForm((valid:any) => {
      console.log('table',valid);
      if (valid) {
        resolve(returnApplyRef.value?.getFormData());
      } else {
        resolve(false);
      }
    });
  });
};
const applySave = ()=>{
  returnApplyRef.value?.checkForm().then((valid:boolean)=>{
    if(valid){
      let applyDetail = returnApplyRef.value?.getFormData()
      Object.keys(applyDetail).forEach(key=>{
        data.applyDetail[key] = applyDetail[key]
      })
      Object.keys(data.applyDetail).forEach(key=>{
        if(key.indexOf('Name') > -1){
          delete data.applyDetail[key]
        }
      })
      data.show = false
      emit('changeCheck',data.id,data.applyDetail,data.isAssist,data.applyDepartmentCode)
    }
  })
}
const getReturnDetailByBackId = (id:string)=>{
  disposeService
    .getReturnDetailByBackId(id)
    .then((res) => {
      data.applyDetail = res.data
      emit('changeCheck',data.id,data.applyDetail,data.isAssist,data.applyDepartmentCode)
    })
}


const init = () => {
  disposeService
    .getReturnList(props.taskId, { deptCode: currentDepartmentCode })
    .then((res) => {
      res.data.forEach((item: any) => {
        data.tableData.push(item)
      })
      // data.tableData.length == 1 && checkTable.value.toggleRowSelection(data.tableData[0],true)
      if (data.tableData.length > 1) {
        checkTable.value.toggleRowSelection(
          data.tableData.find((i: any) => i.executeType == '0'),
          true
        )
      } else if (data.tableData.length == 1) {
        checkTable.value.toggleRowSelection(data.tableData[0], true)
      }

    })
}
init()
defineExpose({
  checkForm,
  getApplyForm(){
    return data.applyDetail
  }
})

</script>
<style lang="scss" scoped>
::v-deep(.el-table th),
.el-table tr {
  background-color: #e1eaf7;
  color: #414951;
  padding-top: 8px;
  padding-bottom: 8px;
}
::v-deep(.el-table .cell) {
  text-align: center;
  font-size: 14px;
}
::v-deep(.el-table, .el-table__expanded-cell) {
  background-color: transparent;
}
::v-deep(.el-table tbody th) {
  background-color: transparent;
  color: #7a8693;
}
::v-deep(.el-radio__label) {
  color: #414951;
  font-weight: bold;
}
</style>
