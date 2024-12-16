<template>
  <div>
    <Title title="退单情况">
      <template #content>
        <el-table
          :data="tableData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          ref="checkTable"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            prop="applyDepartmentCodeName"
            label="退单单位"
            show-overflow-tooltip
            min-width="12%"
          />
          <el-table-column
            prop="applyTime"
            label="退单时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column prop="chargeReasonName" label="退单原因" min-width="8%" />
          <el-table-column prop="applyPerson" label="退单类型" min-width="8%" />
          <!-- <el-table-column prop="executeType" label="是否主责" min-width="8%">
            <template #default="scope">
              {{ scope.row.executeType == '1' ? '是' : '否' }}
            </template>
          </el-table-column> -->
          <el-table-column prop="description" label="退单描述" min-width="12%">
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
    <Title title="疑难完成">
      <template #content>
        <el-form
          :model="caseBackCheckDto"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="完成结果" prop="result">
                <el-select v-model="caseBackCheckDto.result" placeholder="请选择">
                  <el-option
                    v-for="item in knottyFinishTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <template v-if="caseBackCheckDto.result == '1'">
              <el-col :span="6">
                <el-form-item label="承办单位" prop="executeDepartCode">
                  <DepartTreeSelect
                    :is-immediate="immediate"
                    :is-multiple="false"
                    :params="{
                      childNode: false,
                      currentNode: false,
                      optionList: [],
                      removeList: filterDeptCode,
                    }"
                    ref="executeDepartment"
                    @getDepartCode="executeDepartCode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="反馈期限" prop="deadline">
                  <el-select
                    v-model="caseBackCheckDto.deadline"
                    placeholder="请选择"
                    @change="changeTime"
                  >
                    <el-option
                      v-for="item in timeLimitTypes"
                      :label="item.codeName"
                      :value="item.codeValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="截止时间">
                  <span>{{ caseBackCheckDto.endtime }}</span>
                </el-form-item>
              </el-col>
            </template>
            <template v-else>
              <el-col :span="6">
                <el-form-item label="退单原因" prop="chargeReason">
                  <el-select v-model="caseBackCheckDto.chargeReason" placeholder="请选择">
                    <el-option
                      v-for="item in returnApplyTypes"
                      :label="item.codeName"
                      :value="item.codeValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="退单责任人" prop="chargePerson">
                  <el-input v-model="caseBackCheckDto.applyPerson"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="退单申请人">
                  <span>{{ caseBackCheckDto.applyPerson }}</span>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
          <el-form-item label="意见说明" prop="description">
            <el-input
              @dblclick="showDialog"
              v-model="caseBackCheckDto.description"
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
          <Idiom
          :node-code="props.flowModel.code"
          @idiomContentText="IdiomContent"
        ></Idiom>
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { toRefs, reactive, ref, watch } from "vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/TitleCollapse.vue";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import { useDepartment } from "@/hooks/useDepartment";
import { useCode } from "@/hooks/useCode";
import { getLimitTime } from "@/hooks/getLimitTime";
import dayjs from "dayjs";
import { useIdiom } from "@/hooks/useIdiom";
const disposeService = new DisposeService();
const checkTable = ref();
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
    nodeCode: any;
  }>(),
  {
    taskId: "",
  }
);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const emit = defineEmits(["changeLoading", "changeSubmit", "done"]);
const returnApplyForm = ref();
const { currentDepartmentCode, username, currentDepartmentCodeName } = useDepartment();
const { timeLimitTypes, knottyFinishTypes, returnApplyTypes } = useCode();
const execute = ref("");
const caseBackCheckDto = reactive({
  backId: "",
  nodeCode: props.nodeCode,
  result: "",
  description: "",
  applyPerson: "",
  applyTime: "",
  deadline: "",
  endtime: "",
  chargeReason: "",
});
const dispatchRules = reactive<FormRules>({
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  result: [{ required: true, message: "退单原因不能为空", trigger: "blur" }],
  chargePerson: [{ required: true, message: "退单责任人不能为空", trigger: "blur" }],
});
const immediate = ref(false);
const filterDeptCode = ref<string[]>([]);
let tableData: any = reactive([]);

const changeTime = async (val: any) => {
  const { firstParam, secondParam } = timeLimitTypes.value.find(
    (timeLimit) => timeLimit.codeValue === val
  )!;
  caseBackCheckDto.endtime = (await getLimitTime(firstParam, secondParam)) as any;
};

const handleSelectionChange = (val: any) => {
  if (val.length <= 0) {
    if (tableData.length === 1) {
      checkTable.value.toggleRowSelection(tableData[0], true);
    } else {
      caseBackCheckDto.backId = "";
    }
  } else {
    caseBackCheckDto.backId = val[0].id;
    if (val.length > 1) {
      ElMessage.warning("只能选择一个申请信息！");
      val.forEach(
        (i: any, index: number) =>
          index > 0 && checkTable.value.toggleRowSelection(i, false)
      );
    } else {
      if (
        tableData.some((item: any) => item.executeType == "0") &&
        val[0].executeType == "1"
      ) {
        checkTable.value.toggleRowSelection(val[0], false);
        ElMessage.warning("请先选择协办部门进行审核");
      } else {
        caseBackCheckDto.backId = val[0].id;
      }
    }
  }
};
const save = () => {
  // 退单审核
  const { departmentList } = Session.get("userInfo");
  let params: any = {
    attachmentInfos: cloneDeep(props.attachments),
    caseInfo: cloneDeep(props.caseInfo),
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    departmentVo: cloneDeep(departmentList[0]),
    caseBackCheckDto: cloneDeep(caseBackCheckDto),
  };
  emit("changeLoading", true);
  disposeService
    .backCheck(params)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? "success" : "error",
        message: res.message + "，即将返回列表页",
      });
      emit("done");
    })
    .catch(() => emit("done"));
};
const submit = () => {
  if (caseBackCheckDto.backId) {
    save();
  } else {
    ElMessage.warning("请选择一条申请信息进行操作");
    emit("changeSubmit");
  }
};
const executeDepartCode = ({ val, id }: any) => {
  execute.value = val as string;
};

const init = () => {
  disposeService
    .getReturnList(props.taskId, { deptCode: currentDepartmentCode })
    .then((res) => {
      res.data.forEach((item: any) => {
        tableData.push(item);
      });
      // tableData.length == 1 && checkTable.value.toggleRowSelection(tableData[0],true)
      if (tableData.length > 1) {
        checkTable.value.toggleRowSelection(
          tableData.find((i: any) => i.executeType == "0"),
          true
        );
      } else if (tableData.length == 1) {
        checkTable.value.toggleRowSelection(tableData[0], true);
      }
    });

  caseBackCheckDto.applyPerson = username;
  caseBackCheckDto.applyTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
};
init();

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
  caseBackCheckDto.description = idContent;
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
