<template>
  <ContactFirst :task-id="props.taskId" v-if="props.isShow" type="联系市民" isChoice @get-result="getResult"
    :is-only-look="props.name === '审核'" />
  <TitleCollapse title="办结报告">
    <template #content>
      <el-table :data="tableData" style="width: 100%; margin-bottom: 10px" @selection-change="handleSelectionChange"
        ref="checkTable">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="resultName" label="处理结果" />
        <el-table-column prop="person" label="处理人" />
        <el-table-column prop="description" label="意见说明" show-overflow-tooltip />
        <el-table-column prop="time" label="处理时间" />
        <el-table-column label="是否主责">
          <template #default="scope">
            <span :class="[props.name === '审核' ? '' : 'isExecute']">{{ scope.row.executeType === '1' ? "是" : "否"
              }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="disposeDeptName" label="处置部门" />
      </el-table>
      <DoneForm ref="doneForm" :form="form" />
      <el-divider v-show="props.isShow" />
      <DoneReport :case-info="props.caseInfo" v-show="props.isShow" ref="doneReport" :task-id="props.taskId"
        is-check-or-approve :node-code="[undefined, undefined, 'C202-1', undefined]" />
    </template>
  </TitleCollapse>
</template>
<script lang="ts" setup>
import { isEmpty } from "lodash-es";
import { ref, nextTick, reactive } from "vue";
import DoneForm from "./DoneForm.vue";
import DoneReport from "./DoneReport.vue";
import ContactFirst from "./ContactFirst.vue";
import { ElTable, ElMessage, ElMessageBox } from "element-plus";
import { useDepartment } from "@/hooks/useDepartment";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { DisposeFormModel, ContactModel } from "@/api/model/disposeModel";
import TitleCollapse from "@/components/Title/TitleCollapse.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
interface Result {
  row: ContactModel;
  sourceData: ContactModel[];
}
const props = defineProps<{
  isShow: boolean;
  reviewId?: string;
  taskId: string;
  name: string;
  caseInfo: CaseInfoModel;
}>();
const emit = defineEmits(["getDisposeInfo"]);
const doneReport = ref();
const doneForm = ref();
const relations = ref<ContactModel[]>([]);
const disposeService = new DisposeService();
const { currentDepartmentCode } = useDepartment();
let form: DisposeFormModel = reactive({
  id: "",
  content: "",
  description: "",
  person: "",
  result: "",
  taskId: "",
  time: "",
  type: "",
  firstClass: "",
  secondClass: "",
  thirdClass: "",
  fourthClass: "",
  status: "",
  departmentCode: "",
  recordId: "",
});
const checkTable = ref<InstanceType<typeof ElTable>>();
const tableData = ref<DisposeFormModel[]>([]);

const findOtherExecute = () => {
  return new Promise((reslove) => {
    disposeService.findOhter(props.taskId, currentDepartmentCode).then(res => {
      reslove(res.data)
    })
  })
}

const handleSelectionChange = (result: DisposeFormModel[]) => {
  console.log('handleSelectionChange', result);

  if (result.length <= 0) {
  } else {
    if (result.length > 1) {
      ElMessage.warning("只能选择一个办结报告！");
      checkTable.value!.clearSelection();
    } else {
      // 如果上报部门是当前部门并且是主责的 不做任何提示
      // 如果是有主协办的那么进行提示
      // 如果是非立案部门的走原来的逻辑
      // doneReport.value.getDoneReport12345(result[0].recordId!);
      // Object.keys(result[0]).forEach((key) => {
      //   form[key] = result[0][key];
      // });
      // emit("getDisposeInfo", result[0]);
      if (result[0].executeType === "1" && tableData.value.length === 1 ) {
        findOtherExecute().then(res => {
          if (res) {
            ElMessageBox.confirm(
              "现有协办单位还未处置反馈，是否继续结案审批？(主办单位结案审批通过后，协办单位还可以继续处置反馈)",
              "提示",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              }
            )
              .then(() => {
                doneReport.value.getDoneReport12345(result[0].recordId!);
                Object.keys(result[0]).forEach((key) => {
                  form[key] = result[0][key];
                });
                emit("getDisposeInfo", result[0]);
              })
              .catch(() => {
                checkTable.value!.toggleRowSelection(result[0], false);
              });
          } else {
            doneReport.value.getDoneReport12345(result[0].recordId!);
            Object.keys(result[0]).forEach((key) => {
              form[key] = result[0][key];
            });
            emit("getDisposeInfo", result[0]);
          }
        })
      } else {
          doneReport.value.getDoneReport12345(result[0].recordId!);
          Object.keys(result[0]).forEach((key) => {
            form[key] = result[0][key];
          });
          emit("getDisposeInfo", result[0]);
        }

      // if (props.caseInfo.reportDepartmentCode === currentDepartmentCode) {
      //   if (
      //     tableData.value.some((item) => item.executeType === "1") &&
      //     result[0].executeType === "1" &&
      //     tableData.value.length !== 1
      //   ) {
      //     doneReport.value.getDoneReport12345(result[0].recordId!);
      //     Object.keys(result[0]).forEach((key) => {
      //       form[key] = result[0][key];
      //     });
      //     ElMessageBox.confirm(
      //       "现有协办单位还未处置反馈，是否继续结案审批？（主办单位结案审批通过后，协办单位还可以继续处置反馈",
      //       "提示",
      //       {
      //         confirmButtonText: "确定",
      //         cancelButtonText: "取消",
      //         type: "warning",
      //       }
      //     )
      //       .then(() => {
      //         doneReport.value.getDoneReport12345(result[0].recordId!);
      //         Object.keys(result[0]).forEach((key) => {
      //           form[key] = result[0][key];
      //         });
      //         emit("getDisposeInfo", result[0]);
      //       })
      //       .catch(() => {
      //         checkTable.value!.toggleRowSelection(result[0], false);
      //       });
      //   } else {
      //     doneReport.value.getDoneReport12345(result[0].recordId!);
      //     Object.keys(result[0]).forEach((key) => {
      //       form[key] = result[0][key];
      //     });
      //     emit("getDisposeInfo", result[0]);
      //   }
      // } else {
      //   if (
      //     tableData.value.some((item) => item.executeType === "0") &&
      //     result[0].executeType === "1"
      //   ) {
      //     checkTable.value!.toggleRowSelection(result[0], false);
      //     ElMessage.warning("请先选择协办部门进行" + props.name);
      //   } else {
      //     doneReport.value.getDoneReport12345(result[0].recordId!);
      //     Object.keys(result[0]).forEach((key) => {
      //       form[key] = result[0][key];
      //     });
      //     emit("getDisposeInfo", result[0]);
      //   }
      // }
    }
  }
};

const getDoneReport = () => {
  disposeService
    .getCaseDisposeByTaskId(props.taskId, currentDepartmentCode)
    .then((res) => {
      if (res.code === 200) {
        tableData.value = res.data;
        if (res.data.length === 1) {
          nextTick(() => {
            // Object.keys(tableData.value[0]).forEach((key) => {
            //   form[key] = tableData.value[0][key];
            // });
            checkTable.value!.toggleRowSelection(tableData.value[0], true);
            // handleSelectionChange([tableData.value[0]])
          });
        }
      }
    });
};
const getResult = (result: Result) => {
  const { row, sourceData } = result;
  if (!isEmpty(row)) {
    sourceData.forEach((source) => {
      if (source.id === row.id) {
        source.status = 2;
      } else {
        source.status = 1;
      }
    });
    relations.value = sourceData;
  }
};
getDoneReport();
defineExpose({
  getFormData() {
    return doneReport.value.getFormData();
  },
  getDoneFormData() {
    return doneForm.value.getFormData();
  },
  getRelations() {
    return relations.value;
  },
  checkForm() {
    return doneReport.value.checkForm();
  },
  checkDoneForm() {
    return doneForm.value.checkForm();
  },
});
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

.isExecute {
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
