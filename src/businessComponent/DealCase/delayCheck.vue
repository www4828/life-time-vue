<template>
  <div>
    <Title title="申请信息" v-if="tableData.approveData.length === 0">
      <template #content>
        <el-table
          :data="tableData.applyData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          ref="checkTable"
        >
          <el-table-column
            type="selection"
            width="55"
            v-if="showCheck"
            :selectable="(row:any)=> row.status == 1 && showCheck "
          />
          <el-table-column
            prop="applyDepartmentCodeName"
            label="申请部门"
            min-width="15%"
            show-overflow-tooltip
          />
          <el-table-column
            prop="applyTime"
            label="申请时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column prop="applyDayName" label="延期天数" min-width="7%" />
          <el-table-column prop="delayReasonName" label="延期原因" min-width="7%" />
          <el-table-column prop="applyPerson" label="申请人" min-width="10%" />
          <el-table-column
            prop="oldEndTime"
            label="原截止时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column
            prop="newEndTime"
            label="新截止时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column prop="executeType" label="是否主责" min-width="7%">
            <template #default="scope">
              {{ scope.row.executeType == 1 ? "是" : "否" }}
            </template>
          </el-table-column>
          <!-- <el-table-column prop="description" label="备注" show-overflow-tooltip  min-width="10%"/> -->
          <el-table-column prop="description" label="备注" min-width="10%">
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
        </el-table>
      </template>
    </Title>
    <Title title="审批信息" v-if="tableData.approveData.length > 0">
      <template #content>
        <el-table
          :data="tableData.approveData"
          style="width: 100%"
          @selection-change="handleApproveSelectionChange"
          ref="approveTable"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="(row:any)=> row.status == 1 "
          />
          <el-table-column
            prop="applyDepartmentCodeName"
            label="申请部门"
            min-width="11%"
          />
          <el-table-column prop="applyDayName" label="审批延期天数" min-width="11%" />
          <el-table-column
            prop="oldEndTime"
            label="原截止时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column
            prop="newEndTime"
            label="新截止时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column
            prop="createTime"
            label="审批时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column prop="executeType" label="是否主责" min-width="7%">
            <template #default="scope">
              {{ scope.row.executeType == 1 ? "是" : "否" }}
            </template>
          </el-table-column>
          <!-- <el-table-column prop="description" label="备注" show-overflow-tooltip/> -->
          <el-table-column prop="description" label="备注" min-width="10%">
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
        </el-table>
      </template>
    </Title>
    <Title title="延期审核">
      <template #content>
        <el-form
          :model="caseDelayCheckDto"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="是否同意" prop="delayResult">
                <el-select
                  v-model="caseDelayCheckDto.delayResult"
                  placeholder="请选择"
                  @change="changeResult"
                >
                  <el-option
                    v-for="item in returnCheckTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <template v-if="caseDelayCheckDto.delayResult == '1'">
              <el-col :span="6">
                <el-form-item label="审核天数" prop="applyDay">
                  <el-select
                    v-model="caseDelayCheckDto.applyDay"
                    placeholder="请选择"
                    @change="changeTime"
                  >
                    <el-option
                      v-for="item in useCode().applyDaysTypes.value"
                      :label="item.codeName"
                      :value="item.codeValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="原截止时间">
                  <span>{{ caseDelayCheckDto.oldEndTime }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="新截止时间">
                  <span>{{ caseDelayCheckDto.newEndTime }}</span>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
          <el-form-item label="意见说明" prop="description">
            <el-input
              @dblclick="showDialog"
              v-model="caseDelayCheckDto.description"
              autofocus
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <IdiomDialog
            :node-code="props.flowModel.code"
            :show-flag="idiomControl"
            @close-dialog="closeDialog"
            @get-idiom-content="IdiomContent"
            ref="idiomRef"
          />
          <Idiom :node-code="props.flowModel.code" @idiomContentText="IdiomContent"></Idiom>
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, reactive, ref, watch } from "vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/TitleCollapse.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import dayjs from "dayjs";
import { useDepartment } from "@/hooks/useDepartment";
import { useCode } from "@/hooks/useCode";
import { getDalayLimit } from "@/hooks/getLimitTime";
import { useIdiom } from "@/hooks/useIdiom";
const { returnCheckTypes, applyDaysTypes } = useCode();
const disposeService = new DisposeService();
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
    nodeCode: string;
  }>(),
  {
    taskId: "",
  }
);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const emit = defineEmits(["changeLoading", "done", "changeSubmit"]);
const returnApplyForm = ref();
const { currentDepartmentCode } = useDepartment();
const caseDelayCheckDto = reactive({
  applyDay: "",
  delayId: "",
  delayResult: "",
  description: "",
  newEndTime: "",
  nodeCode: props.nodeCode,
  oldEndTime: "",
});
const dispatchRules = reactive<FormRules>({
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  delayResult: [{ required: true, message: "请选择是否同意", trigger: "blur" }],
  applyDay: [{ required: true, message: "审核天数不能为空", trigger: "blur" }],
});

const tableData: any = reactive({
  applyData: [],
  approveData: [],
  flagArr: [],
});
const checkTable = ref();
const approveTable = ref();
const showCheck = ref(false);
const deptCode = ref("");
const baseDeptCode = ref("");

const changeTime = async (val: any) => {
  caseDelayCheckDto.newEndTime = (await getDalayLimit(
    val,
    caseDelayCheckDto.oldEndTime
  )) as any;
};
const handleSelectionChange = (val: any) => {
  if (val.length <= 0) {
    if (tableData.applyData.length === 1) {
      checkTable.value.toggleRowSelection(tableData.applyData[0], true);
    } else {
      caseDelayCheckDto.delayId = "";
      caseDelayCheckDto.applyDay = "";
      caseDelayCheckDto.newEndTime = "";
    }
  } else {
    if (val.length > 1) {
      ElMessage.warning("只能选择一个申请信息！");
      val.forEach(
        (i: any, index: number) =>
          index > 0 && checkTable.value.toggleRowSelection(i, false)
      );
    } else {
      if (
        tableData.applyData.some((item: any) => item.executeType == "0") &&
        val[0].executeType == "1"
      ) {
        checkTable.value.toggleRowSelection(val[0], false);
        ElMessage.warning("请先选择协办部门进行审核");
      } else {
        caseDelayCheckDto.delayId = val[0].id;
        caseDelayCheckDto.applyDay = val[0].applyDay;
        deptCode.value = baseDeptCode.value = val[0].applyDepartmentCode;
      }
    }
  }
};
const handleApproveSelectionChange = (val: any) => {
  if (val.length <= 0) {
    if (tableData.approveData.length === 1) {
      approveTable.value.toggleRowSelection(tableData.approveData[0], true);
    } else {
      caseDelayCheckDto.delayId = "";
      caseDelayCheckDto.applyDay = "";
      caseDelayCheckDto.newEndTime = "";
    }
  } else {
    if (val.length > 1) {
      ElMessage.warning("只能选择一个申请信息！");
      val.forEach(
        (i: any, index: number) =>
          index > 0 && approveTable.value.toggleRowSelection(i, false)
      );
    } else {
      if (
        tableData.approveData.some((item: any) => item.executeType == "0") &&
        val[0].executeType == "1"
      ) {
        approveTable.value.toggleRowSelection(val[0], false);
        ElMessage.warning("请先选择协办部门进行审核");
      } else {
        caseDelayCheckDto.delayId = val[0].delayId;
        caseDelayCheckDto.applyDay = val[0].applyDay;
        deptCode.value = val[0].deptCode;
        baseDeptCode.value = val[0].applyDepartmentCode;
      }
    }
  }
};
const { departmentList } = Session.get("userInfo");
const save = () => {
  // 延期审核
  let params: any = {
    attachmentInfos: cloneDeep(props.attachments),
    caseInfo: cloneDeep(props.caseInfo),
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    departmentVo: cloneDeep(departmentList[0]),
    caseDelayCheckDto: cloneDeep(caseDelayCheckDto),
  };
  emit("changeLoading", true);
  disposeService
    .delayCheck(params)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? "success" : "error",
        message: res.message + "，即将返回列表页",
      });
      emit("done");
    })
    .catch(() => {
      emit("done");
    });
};
const delayFindDispatch = () => {
  disposeService
    .delayFindDispatch(
      props.caseInfo.taskId,
      departmentList[0].departmentCode,
      baseDeptCode.value
    )
    .then((res) => {
      caseDelayCheckDto.oldEndTime = res.data.deadline;
      changeTime(caseDelayCheckDto.applyDay);
    });
};
const changeResult = (val: any) => {
  if (val == 1 || val == 3) {
    delayFindDispatch();
  }
};
const setChecked = () => {
  if (tableData.flagArr.length == 2) {
    if (tableData.approveData.length > 0) {
      // let node = tableData.approveData.length == 1 ?
      //   tableData.approveData[0] :
      //   tableData.approveData.find((i:any)=>i.executeType=='0' && i.status == 1)
      let node =
        tableData.approveData.length == 1
          ? tableData.approveData[0].status == 1
            ? tableData.approveData[0]
            : {}
          : tableData.approveData.find(
              (i: any) => i.executeType == "0" && i.status == 1
            ) ||
            tableData.approveData.find((i: any) => i.executeType == "1" && i.status == 1);
      nextTick(() => {
        node.id && approveTable.value.toggleRowSelection(node, true);
      });
    } else {
      // let node = tableData.applyData.length > 0 && tableData.applyData.length == 1 ?
      //   tableData.applyData[0] :
      //   tableData.applyData.find((i:any)=>i.executeType=='0'  && i.status == 1)
      let node =
        tableData.applyData.length > 0 && tableData.applyData.length == 1
          ? tableData.applyData[0].status == 1
            ? tableData.applyData[0]
            : {}
          : tableData.applyData.find((i: any) => i.executeType == "0" && i.status == 1) ||
            tableData.applyData.find((i: any) => i.executeType == "1" && i.status == 1);
      node.id && checkTable.value.toggleRowSelection(node, true);
    }
  }
};
const getDelayList = () => {
  disposeService
    .getDelayList(props.taskId, { deptCode: currentDepartmentCode })
    .then((res) => {
      res.data.forEach((item: any) => {
        tableData.applyData.push(item);
      });
      tableData.flagArr.push(true);
      setChecked();
    })
    .catch(() => {
      tableData.flagArr.push(true);
      setChecked();
    });
};
const getApproveList = () => {
  disposeService
    .getApproveList(props.taskId, { deptCode: currentDepartmentCode })
    .then((res) => {
      res.data.forEach((item: any) => {
        tableData.approveData.push(item);
      });
      showCheck.value = tableData.approveData.length > 0 ? false : true;
      tableData.flagArr.push(true);
      setChecked();
    })
    .catch(() => {
      showCheck.value = true;
      tableData.flagArr.push(true);
      setChecked();
    });
};
const init = () => {
  getDelayList();
  getApproveList();
};
init();
const submit = () => {
  if (caseDelayCheckDto.delayId) {
    save();
  } else {
    ElMessage.warning("请选择一条申请信息进行操作");
    emit("changeSubmit");
  }
};
watch(
  () => props.submit,
  (val) => {
    val &&
      returnApplyForm.value?.validate((valid: any) => {
        if (valid) {
          submit();
        } else {
          emit("changeSubmit");
        }
      });
  }
);
const IdiomContent = (idContent: string) => {
  caseDelayCheckDto.description = idContent;
};
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
