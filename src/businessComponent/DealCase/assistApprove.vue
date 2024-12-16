<template>
  <div>
    <Title title="申请信息" v-if="tableData.checkData.length === 0">
      <template #content>
        <el-table
          :data="tableData.applyData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          ref="applyTable"
        >
          <el-table-column
            type="selection"
            width="55"
            v-if="tableData.checkData.length == 0"
          />
          <el-table-column
            prop="applyDepartmentName"
            label="申请单位"
            show-overflow-tooltip
            min-width="12%"
          />
          <el-table-column
            prop="departmentName"
            label="协办单位"
            show-overflow-tooltip
            min-width="12%"
          />
          <el-table-column prop="reason" label="申请原因" min-width="8%" />
          <el-table-column prop="deadlineName" label="反馈期限" min-width="8%" />
          <el-table-column
            prop="endtime"
            label="截止时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column prop="createUser" label="申请人" min-width="8%" />
          <!-- <el-table-column prop="content" label="意见说明" show-overflow-tooltip min-width="10%" /> -->
          <el-table-column prop="content" label="意见说明" min-width="12%">
            <template #default="scope">
              <el-popover
                placement="left"
                :popper-style="{ letterSpacing: '3px' }"
                :width="500"
                trigger="hover"
                :content="scope.row.content"
              >
                <template #reference>
                  <span class="ellipsis">
                    {{ scope.row.content }}
                  </span>
                </template>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </Title>
    <Title title="审核信息" v-if="tableData.checkData.length > 0">
      <template #content>
        <el-table
          :data="tableData.checkData"
          style="width: 100%"
          @selection-change="handleCheckSelectionChange"
          ref="checkTable"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            prop="applyDepartmentName"
            label="申请单位"
            show-overflow-tooltip
            min-width="12%"
          />
          <el-table-column
            prop="departmentName"
            label="协办单位"
            show-overflow-tooltip
            min-width="12%"
          />
          <el-table-column prop="reason" label="申请原因" min-width="8%" />
          <el-table-column prop="deadlineName" label="反馈期限" min-width="8%" />
          <el-table-column
            prop="endtime"
            label="截止时间"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column prop="createUser" label="申请人" min-width="8%" />
          <el-table-column
            prop="content"
            label="意见说明"
            show-overflow-tooltip
            min-width="10%"
          />
        </el-table>
      </template>
    </Title>
    <Title title="协办审批">
      <template #content>
        <el-form
          :model="caseSynergyDto"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="是否同意" prop="result">
                <el-radio-group v-model="caseSynergyDto.result">
                  <el-radio :label="1" :style="{ marginRight: '10px' }">同意</el-radio>
                  <el-radio :label="2">不同意</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <div v-show="caseSynergyDto.result == 1">
            <el-row>
              <el-col :span="12">
                <el-form-item label="协办单位" prop="assistantDepartCode">
                  <DepartTreeSelect
                    ref="assDepartment"
                    :is-immediate="true"
                    is-multiple
                    :params="{
                      childNode: false,
                      currentNode: false,
                      optionList: [],
                      removeList: [execute],
                    }"
                    @getDepartCode="assistantDepartCode"
                    :defaultList="defaultList"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="assDept.show">
                <el-form-item label="事项类别" prop="firstClass">
                  <ClassSelect
                    ref="classSelect"
                    :departmentCode="assDept.assDeptCode"
                    :departmentLevel="assDept.assDeptlevel"
                    @getCheckedValue="getCheckedValueAss"
                    :showValue="classDefaultList"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="反馈期限" prop="deadline">
                  <el-select
                    v-model="caseSynergyDto.deadline"
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
                  <span>{{ caseSynergyDto.endtime }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <el-form-item label="意见说明" prop="content">
            <el-input
              @dblclick="showDialog"
              v-model="caseSynergyDto.content"
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
import { toRefs, reactive, ref, watch, nextTick } from "vue";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/TitleCollapse.vue";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import dayjs from "dayjs";
import { useIdiom } from "@/hooks/useIdiom";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import { useDepartment } from "@/hooks/useDepartment";
import { useCode } from "@/hooks/useCode";
import { getLimitTime } from "@/hooks/getLimitTime";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";

const disposeService = new DisposeService();
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
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const emit = defineEmits(["done", "changeSubmit", "changeLoading"]);
const returnApplyForm = ref();
const { currentDepartmentCode, username } = useDepartment();
const { timeLimitTypes } = useCode();
const defaultList = ref<string[]>([]);
const caseSynergyDto = reactive({
  content: "",
  deadline: "",
  departmentCode: "",
  endtime: "",
  result: 1,
  taskId: props.taskId,
  synergyId: "",
  firstClass:'',
  secondClass: '',
  thirdClass: '',
  fourthClass: '',
  firstClassName: '',
  secondClassName: '',
  thirdClassName: '',
  fourthClassName: ''
});
let assDept:any = reactive({
  show: false,
  assDeptCode:'',
  assDeptlevel:''
})
const classDefaultList = ref<string[]>([]);
const validatePass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (assistant.value.length === 0) {
      callback(new Error("协办单位不能为空!"));
    } else {
      callback();
    }
  });
};
const validateSecondClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (!caseSynergyDto.firstClassName) {
      callback(new Error("不能为空!"));
    } else {
      callback();
    }
  });
};
const dispatchRules = reactive<FormRules>({
  content: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  deadline: [{ required: true, message: "反馈期限不能为空", trigger: "blur" }],
  firstClass: [{ required: true, message: "不能为空", trigger: "change",validator: validateSecondClass, }],
  assistantDepartCode: [
    {
      required: true,
      message: "协办单位不能为空",
      trigger: "change",
      validator: validatePass,
    },
  ],
});

let execute = ref("");
const assistant = ref<string[]>([]);
const assistantDepartCode = ({ val, id ,nodes}: any) => {
  assistant.value = val as string[];
  caseSynergyDto.departmentCode = assistant.value?.join(",");
  if(nodes?.filter((node:any)=>node.departmentGroup === "7013").length>0){
    assDept.assDeptCode = String(nodes?.filter((node:any)=>node.departmentGroup === "7013")[0].departmentCode)
    assDept.assDeptlevel = String(nodes?.filter((node:any)=>node.departmentGroup === "7013")[0].departmentLevel)
    assDept.show = true
  }else{
    assDept.show = false
    caseSynergyDto.firstClass = '';
    caseSynergyDto.secondClass = '';
    caseSynergyDto.firstClassName = ''
    caseSynergyDto.secondClassName = ''
    caseSynergyDto.thirdClass = '';
    caseSynergyDto.thirdClassName = ''
    caseSynergyDto.fourthClass = '';
    caseSynergyDto.fourthClassName = ''
  }
};
const getCheckedValueAss = ({labels, checkedValue, secondParams }: EmitProps) => {
  if(labels.length>0){
    const [firstClass, secondClass] = checkedValue;
    caseSynergyDto.firstClass = firstClass;
    caseSynergyDto.secondClass = secondClass;
    caseSynergyDto.firstClassName = labels[0]
    caseSynergyDto.secondClassName = labels[1]
    if (checkedValue[2]) {
      caseSynergyDto.thirdClass = checkedValue[2];
      caseSynergyDto.thirdClassName = labels[2]
    }
    if (checkedValue[3]) {
      caseSynergyDto.fourthClass = checkedValue[3];
      caseSynergyDto.fourthClassName = labels[3]
    }
  }else{
    caseSynergyDto.firstClass = '';
    caseSynergyDto.secondClass = '';
    caseSynergyDto.firstClassName = ''
    caseSynergyDto.secondClassName = ''
    caseSynergyDto.thirdClass = '';
    caseSynergyDto.thirdClassName = ''
    caseSynergyDto.fourthClass = '';
    caseSynergyDto.fourthClassName = ''
  }
};
const tableData: any = reactive({
  applyData: [],
  checkData: [],
  flagArr: {
    apply: false,
    check: false
  },
});
const checkTable = ref();
const applyTable = ref();

const setData = (val: any) => {
  assistant.value = val[0].applyDepartmentCode?.split(",");
  caseSynergyDto.departmentCode = val[0].departmentCode;
  defaultList.value = val[0].departmentCode.split(",");
  caseSynergyDto.deadline = val[0].deadline;
  changeTime(val[0].deadline);
};
const handleSelectionChange = (val: any) => {
  if (val.length <= 0) {
    if (tableData.applyData.length === 1) {
      applyTable.value.toggleRowSelection(tableData.applyData[0], true);
    } else {
      caseSynergyDto.synergyId = "";
      caseSynergyDto.deadline = "";
      caseSynergyDto.endtime = "";
      caseSynergyDto.departmentCode = "";
      assistant.value = [];
      defaultList.value = [];
    }
  } else {
    if (val.length > 1) {
      ElMessage.warning("只能选择一个申请信息！");
      val.forEach(
        (i: any, index: number) =>
          index > 0 && applyTable.value.toggleRowSelection(i, false)
      );
      return
    }
    caseSynergyDto.synergyId = val[0].id;
    caseSynergyDto.firstClass = val[0].firstClass;
    caseSynergyDto.secondClass = val[0].secondClass;
    caseSynergyDto.firstClassName = val[0].firstClassName;
    caseSynergyDto.secondClassName = val[0].secondClassName;
    caseSynergyDto.thirdClass = val[0].thirdClass;
    caseSynergyDto.thirdClassName = val[0].thirdClassName;
    caseSynergyDto.fourthClass = val[0].fourthClass;
    caseSynergyDto.fourthClassName = val[0].fourthClassName;
    classDefaultList.value = val[0].thirdClass ? [val[0].firstClass,val[0].secondClass,val[0].thirdClass] : [val[0].firstClass,val[0].secondClass]
    setData(val);
  }
};
const handleCheckSelectionChange = (val: any) => {
  console.log(val);
  
  if (val.length <= 0) {
    if (tableData.checkData.length === 1) {
      checkTable.value.toggleRowSelection(tableData.checkData[0], true);
    } else {
      caseSynergyDto.synergyId = "";
      caseSynergyDto.deadline = "";
      caseSynergyDto.endtime = "";
      caseSynergyDto.departmentCode = "";
      assistant.value = [];
      defaultList.value = [];
    }
  } else {
    if (val.length > 1) {
      ElMessage.warning("只能选择一个申请信息！");
      val.forEach(
        (i: any, index: number) =>
          index > 0 && checkTable.value.toggleRowSelection(i, false)
      );
      return
    }
    caseSynergyDto.synergyId = val[0].synergyId;
    caseSynergyDto.firstClass = val[0].firstClass;
    caseSynergyDto.secondClass = val[0].secondClass;
    caseSynergyDto.firstClassName = val[0].firstClassName;
    caseSynergyDto.secondClassName = val[0].secondClassName;
    caseSynergyDto.thirdClass = val[0].thirdClass;
    caseSynergyDto.thirdClassName = val[0].thirdClassName;
    caseSynergyDto.fourthClass = val[0].fourthClass;
    caseSynergyDto.fourthClassName = val[0].fourthClassName;
    classDefaultList.value = val[0].thirdClass ? [val[0].firstClass,val[0].secondClass,val[0].thirdClass] : [val[0].firstClass,val[0].secondClass]
    setData(val);
  }
};
const save = () => {
  // 协办审批
  const { departmentList } = Session.get("userInfo");
  let params: any = {
    attachmentInfos: cloneDeep(props.attachments),
    // caseInfo: cloneDeep(props.caseInfo),
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    departmentVo: cloneDeep(departmentList[0]),
    caseSynergyDto: cloneDeep(caseSynergyDto),
  };
  emit("changeLoading", true);
  disposeService
    .synergyApprove(params)
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
const changeTime = async (val: any) => {
  const { firstParam, secondParam } = timeLimitTypes.value.find(
    (timeLimit) => timeLimit.codeValue === val
  )!;
  caseSynergyDto.endtime = (await getLimitTime(firstParam, secondParam)) as any;
};
const { departmentList } = Session.get("userInfo");
const setChecked = () => {
  if (Object.values(tableData.flagArr).every(item=>item)) {
    if (tableData.checkData.length > 0) {
      checkTable.value.toggleRowSelection(tableData.checkData[0], true);
    } else {
      tableData.applyData.length > 0 &&
        applyTable.value.toggleRowSelection(tableData.applyData[0], true);
    }
  }
};
const getSynergyApplyInfo = () => {
  disposeService
    .getSynergyApplyInfo(props.taskId)
    .then((res) => {
      res.data.forEach((item: any) => {
        tableData.applyData.push(item);
      });
      tableData.flagArr.apply = true
      setChecked();
    })
    .catch(() => {
      tableData.flagArr.apply = true
      setChecked();
    });
};
const getSynergyCheckInfo = () => {
  disposeService
    .getSynergyCheckInfo(props.taskId)
    .then((res) => {
      res.data.forEach((item: any) => {
        tableData.checkData.push(item);
      });
      tableData.flagArr.check = true
      setChecked();
    })
    .catch(() => {
      tableData.flagArr.check = true
      setChecked();
    });
};
const init = () => {
  execute.value = departmentList[0].departmentCode;
  getSynergyCheckInfo();
  getSynergyApplyInfo();
};
init();

watch(
  () => props.submit,
  (val) => {
    val &&
      returnApplyForm.value?.validate((valid: any) => {
        if (valid) {
          save();
        } else {
          emit("changeSubmit");
        }
      });
  }
);
const IdiomContent = (idContent: string) => {
  caseSynergyDto.content = idContent;
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
