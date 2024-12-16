<template>
  <div>
    <Title title="收单">
      <template #content>
        <el-table
          :data="tableData"
          style="width: 100%; margin-bottom: 10px"
          ref="checkTable"
          @selection-change="selectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="disposeDeptName" label="承办部门" />
          <el-table-column label="是否主办" >
            <template #default="scope">
              {{ scope.row.type === '1' ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止时间" />
        </el-table>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, reactive } from "vue";
import { ElMessage, ElTable } from "element-plus";
import { useDepartment } from "@/hooks/useDepartment";
import Title from "@/components/Title/TitleCollapse.vue";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import { CaseDispatchModel, RecoveryModel } from "@/api/model/caseModel";
import { CaseService } from "@/api/service//WorkTicket/CaseService";
import { DisposeService } from "@/api/service/Dispose/DisposeService";

const disposeService = new DisposeService();
const caseService = new CaseService();
const tableData = ref<CaseDispatchModel[]>([]);
const checkTable = ref<InstanceType<typeof ElTable>>();
const {
  currentDepartmentCode,
  currentDepartmentCodeName,
  username,
  name,
} = useDepartment();
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
  }>(),
  {
    taskId: "",
  }
);
const emit = defineEmits(["changeSubmit", "changeLoading", "done"]);
const form = reactive<RecoveryModel>({
  departmentCode: currentDepartmentCode,
  departmentName: currentDepartmentCodeName,
  nodeCode: props.flowModel.code as NodeCodeKey,
  taskId: props.taskId,
  userId: username,
  userName: name,
  recoveryDeptArray: [],
  attachmentInfos: [],
});
const save = () => {
  emit("changeLoading", true);
  form.attachmentInfos = props.attachments;
  caseService
    .back(form)
    .then((res) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
      if (res.code === 200) {
        emit("done");
      }
    })
    .catch(() => emit("done"));
};
const getDispatchDeptList = () => {
  disposeService.getDispatchDeptList(currentDepartmentCode, props.taskId).then((res) => {
    if (res.code === 200) {
      tableData.value = res.data;
    }
  });
};
getDispatchDeptList();
const selectionChange = (result: CaseDispatchModel[]) => {

  if(result.some(item=> item.type == '1')){
    tableData.value.filter(item=>item.type == '0').forEach(item=>{
      checkTable.value?.toggleRowSelection(item,true)
    })
    if(result.filter(item=>item.type == '0').length ===  tableData.value.filter(item=>item.type == '0').length){
      ElMessage.warning('主办收单操作会导致协办部门同时收单！')
    }
  }
  form.recoveryDeptArray = checkTable.value?.getSelectionRows();
};
watch(
  () => props.submit,
  (val) => {
    if (val) {
      if (form.recoveryDeptArray.length !== 0) {
        save();
      } else {
        ElMessage.error("请选择一个");
        emit("changeSubmit");
      }
    }
  },
  { deep: true }
);
</script>
<style lang="scss" scoped>
::v-deep(.el-table th) {
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
