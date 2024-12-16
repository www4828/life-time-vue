<template>
  <div>
    <Title title="申请信息">
      <template #content>
        <el-table
          :data="tableData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          ref="checkTable"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            prop="applyTime"
            label="申请日期"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column prop="applyPerson" label="申请人" min-width="8%" />
          <el-table-column
            prop="applyDepartmentCodeName"
            label="申请部门"
            min-width="12%"
            show-overflow-tooltip
          />
          <el-table-column
            prop="chargeReasonName"
            label="退单原因"
            show-overflow-tooltip
            min-width="12%"
          />
          <el-table-column prop="executeType" label="是否主责" min-width="8%">
            <template #default="scope">
              {{ scope.row.executeType == "1" ? "是" : "否" }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="退单备注" min-width="12%">
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
    <Title title="退单审批">
      <template #content>
        <el-form
          :model="caseBackApproveDto"
          class="from"
          ref="returnApplyForm"
          label-width="120px"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="是否同意" prop="result">
                <el-select
                  v-model="caseBackApproveDto.result"
                  placeholder="请选择"
                  v-if="isAssist"
                >
                  <el-option
                    v-for="item in returnCheckTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
                <el-select
                  v-model="caseBackApproveDto.result"
                  placeholder="请选择"
                  v-else-if="
                    !isAssist &&
                    departmentList[0].departmentLevel == '1' &&
                    currentDepartmentCode == '12319'
                  "
                  @change="changeResult"
                >
                  <el-option
                    v-for="item in approveTypes"
                    :key="item.codeValue"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
                <el-select
                  v-model="caseBackApproveDto.result"
                  placeholder="请选择"
                  @change="changeResult"
                  v-else
                >
                  <el-option
                    v-for="item in returnApproveTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <template v-if="caseBackApproveDto.result == '3'">
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
              <el-col :span="12">
                <el-form-item label="事项类别" prop="firstClass" class="long">
                  <ClassSelect
                    :departmentCode="execute"
                    :departmentLevel="departmentList[0].departmentLevel"
                    :showValue="showValue"
                    @getCheckedValue="getCheckedValue"
                    @getSecondPrams="getSecondPrams"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="截止时间" prop="deadline">
                  <el-date-picker
                    v-model="caseBackApproveDto.deadline"
                    type="datetime"
                    format="YYYY-MM-DD HH:mm"
                    :disabled-date="disabledDate"
                    value-format="YYYY-MM-DD HH:mm"
                  />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
          <el-form-item label="意见说明" prop="description">
            <el-input
              @dblclick="showDialog"
              v-model="caseBackApproveDto.description"
              autofocus
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="500"
              show-word-limit
              type="textarea"
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
    <el-dialog
      custom-class="dialog"
      v-model="state.dialogShow"
      width="70%"
      destroy-on-close
      title="转市级审批，请选择附件（上限3条），不勾选默认不上传文件"
      @close="cancal"
    >
        <FileAttachments
          is-choice
          :is-show="false"
          ref="fileRef"
          :task-id="props.taskId"
          :default-value="props.allFiles"
        />
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancal">取消</el-button>
        <el-button type="primary" @click="fileSave">确定</el-button>
      </span>
    </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, reactive, ref, watch, getCurrentInstance } from "vue";
import { ElMessage, ElMessageBox, FormRules } from "element-plus";
import Title from "@/components/Title/TitleCollapse.vue";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import { useDepartment } from "@/hooks/useDepartment";
import { useCode } from "@/hooks/useCode";
import { useIdiom } from "@/hooks/useIdiom";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { useLimitTime } from "@/hooks/useLimitTime";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";

const disposeService = new DisposeService();
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
    nodeCode: string;
    allFiles: any;
  }>(),
  {
    taskId: "",
  }
);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const { proxy } = <any>getCurrentInstance()!;
const immediate = ref(false);
const { disabledDate, timeLimit } = useLimitTime();
const showValue = ref<string[]>([]);
const emit = defineEmits(["done", "changeSubmit", "changeLoading"]);
const returnApplyForm = ref();
const { currentDepartmentCode, departmentList } = useDepartment();
const { returnCheckTypes, approveTypes, timeLimitTypes, returnApproveTypes } = useCode();
const execute = ref("");
const departmentCode = ref("");
const filterDeptCode = ref<string[]>([]);
const caseBackApproveDto: any = reactive({
  backId: "",
  nodeCode: props.nodeCode,
  result: "",
  description: "",
  disposeTime: "",
  deadline: "",
});
const dispatchForm = reactive({
  type: "",
  taskId: props.taskId,
  disposeTime: "10",
  disposeDepartmentCode: "",
  dispatchDepartmentCode: currentDepartmentCode,
  description: "",
  deadline: "",
  firstClass: "",
  secondClass: "",
  fourthClass: undefined as any,
  thirdClass: undefined as any,
});
const validatePass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (execute.value) {
      callback();
    } else {
      callback(new Error("承办单位不能为空!"));
    }
  });
};
const validateClass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if(caseBackApproveDto.result === '3' && currentDepartmentCode === '12319'  ){
      if(dispatchForm.firstClass || dispatchForm.secondClass){
        callback();
      }else{
        callback(new Error("请选择事项类别!"));
      }
    }else{
      callback();
    }
  });
};
const dispatchRules = reactive<FormRules>({
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  result: [{ required: true, message: "请选择审批结果", trigger: "blur" }],
  executeDepartCode: [
    {
      required: true,
      message: "承办单位不能为空",
      trigger: "change",
      validator: validatePass,
    },
  ],
  deadline: [{ required: true, message: "截止时间不能为空", trigger: "blur,change" }],
  // firstClass: [{ required: true, message: "事项类别不能为空", trigger: "blur,change",validator: validateClass, }],
});

const tableData: any = reactive([]);
const checkTable = ref();
const isAssist = ref(true);
let timeLimits: any = ref([]);
const state = reactive({
  showValue: [] as any,
  dialogShow: false,
  attachments:[]
});
let applyDepartmentCode: any = ref("");
const fileRef = ref()

const fileSave = ()=>{
  state.attachments = fileRef.value.getChoiceFiles()
  state.dialogShow = false

  save();
}
const handleSelectionChange = (val: any) => {
  // console.log('handleSelectionChange',val);
  if (val.length <= 0) {
    if (tableData.length === 1) {
      checkTable.value.toggleRowSelection(tableData[0], true);
    } else {
      caseBackApproveDto.backId = "";
      applyDepartmentCode.value = "";
    }
  } else {
    if (val.length > 1) {
      ElMessage.warning("只能选择一个申请信息！");
      val.forEach(
        (i: any, index: number) =>
          index > 0 && checkTable.value.toggleRowSelection(i, false)
      );
      isAssist.value = false;
    } else {
      if (
        tableData.some((item: any) => item.executeType == "0") &&
        val[0]?.executeType == "1"
      ) {
        checkTable.value.toggleRowSelection(val[0], false);
        ElMessage.warning("请先选择协办部门进行审批");
      } else {
        caseBackApproveDto.backId = val[0].id;
        applyDepartmentCode.value = val[0].applyDepartmentCode;
        isAssist.value = val[0].executeType == "1" ? false : true;
      }
    }
  }
};
const save = () => {
  // 退单审批
  const { departmentList } = Session.get("userInfo");

  dispatchForm.disposeTime = caseBackApproveDto.disposeTime;
  delete caseBackApproveDto.disposeTime;
  let params: any = {
    attachmentInfos: state.attachments,
    caseInfo: {
      ...props.caseInfo,
      reflectIndustryCode: dispatchForm.firstClass,
      reflectClassCode: dispatchForm.secondClass,
      reflectContentCode: dispatchForm.thirdClass,
    },
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    departmentVo: cloneDeep(departmentList[0]),
    caseBackApproveDto: cloneDeep(caseBackApproveDto),
    mcaseDispatchEntities: [],
  };
  
  
  if (execute.value) {
    // 承办单位不为空
    dispatchForm.type = "1";
    dispatchForm.disposeDepartmentCode = execute.value;
    dispatchForm.description = caseBackApproveDto.description;
    params.mcaseDispatchEntities[0] = cloneDeep(dispatchForm);
    // if(dispatchForm.taskId != params.caseInfo.taskId){
    //   ElMessage.error('派遣单号与案件详情单号不一致，请重新操作')
    //   emit("changeLoading", false);
    //   emit("changeSubmit");
    //   return
    // }
  }
  // emit('changeSubmit')
  // console.log(params);
  
  
  emit("changeLoading", true);
  disposeService
    .backApprove(params,props.taskId)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? "success" : "error",
        message: res.message + "，即将返回列表页",
      });
      emit("done");
    })
    .catch(() => emit("done"));
};
const getIsEnableBack = () => {
  emit("changeLoading", true);
  disposeService
    .getIsEnableBack(props.taskId, currentDepartmentCode)
    .then((res) => {
      emit("changeSubmit");
      if (res.code == 200) {
        save();
      } else {
        emit("changeLoading", false);
        emit("changeSubmit");
        ElMessage.warning(res.message);
      }
    })
    .catch(() => {
      emit("changeLoading", false);
      emit("changeSubmit");
    });
};
const findCooperation = () => {
  emit('changeLoading', true)
  disposeService
    .findCooperation(props.taskId, execute.value)
    .then((res) => {
      if (res.data) {
        save();
      } else {
        ElMessageBox.confirm('该承办部门已经派过协办，请进行收单重派', '提示', {
          confirmButtonText: '确定',
        }).finally(() => {
          emit('changeLoading', false)
          emit('changeSubmit')
        })
      }
    })
    .catch(() => {
      emit('changeLoading', false)
      emit('changeSubmit')
    })
}
const submit = () => {
  if (caseBackApproveDto.backId) {
    
    switch(caseBackApproveDto.result){
      case '5': // 向12345退单需要勾选附件
        state.dialogShow = true;
        break;
      case '4': // 二级及以下
        state.attachments = cloneDeep(props.attachments);
        if(departmentList[0].departmentLevel == '1' && currentDepartmentCode == '12319'){
          save()
        }else{
          getIsEnableBack()
        }
        break;
      case '3': // 重新派遣验证事项类别是否为空
        state.attachments = cloneDeep(props.attachments);
        if(currentDepartmentCode === '12319'){
          if(dispatchForm.firstClass && dispatchForm.secondClass){
            findCooperation();
          }else{
            ElMessage.warning("请选择事项类别");
            emit("changeSubmit");
          }
        }else{
          findCooperation()
        }
        break;
      default:
        state.attachments = cloneDeep(props.attachments);
        save()
    }
  } else {
    ElMessage.warning("请选择一条申请信息进行操作");
    emit("changeSubmit");
  }
};
const executeDepartCode = ({ val, id }: any) => {
  execute.value = departmentCode.value = val as string;
};

const getCheckedValue = ({ checkedValue, secondParams }: EmitProps) => {
  if(checkedValue.length>0){
    const [firstClass, secondClass] = checkedValue;
    dispatchForm.firstClass = firstClass;
    dispatchForm.secondClass = secondClass;
    if (checkedValue[2]) {
      dispatchForm.thirdClass = checkedValue[2];
    }
    if (checkedValue[3]) {
      dispatchForm.fourthClass = checkedValue[3];
    }
  }else{
    dispatchForm.firstClass = '';
    dispatchForm.secondClass = '';
    dispatchForm.thirdClass = '';
    dispatchForm.fourthClass = '';
  }
  timeLimits.value = secondParams
    ? timeLimitTypes.value.filter((item) => item.codeValue === secondParams)
    : timeLimitTypes.value;
};
const getSecondPrams = (secondParams: string) => {
  timeLimits.value = secondParams
    ? timeLimitTypes.value.filter((item) => item.codeValue === secondParams)
    : timeLimitTypes.value;
};
const getReturnList = () => {
  disposeService
    .getReturnList(props.taskId, { deptCode: currentDepartmentCode })
    .then((res) => {
      res.data &&
        res.data?.length > 0 &&
        res.data?.forEach((item: any) => {
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
};
const cancal = ()=>{
  emit("changeSubmit");
  state.dialogShow = false
}


const init = ()=>{
  getReturnList();
  if(currentDepartmentCode === '12319'){
    dispatchRules.firstClass = [{ required: true, message: "事项类别不能为空", trigger: "blur,change",validator: validateClass, }]
  }
}
init()
const getSynergyDepartment = () => {
  return new Promise(resolve=>{
    disposeService
      .getSynergyDepartment(props.taskId)
      .then((res) => {
        let deptCode = [] as Array<string>;
        if(res.data){
          deptCode = res.data?.split(",")
          props.caseInfo.acceptDepartment && deptCode.push(props.caseInfo.acceptDepartment)
        }
          resolve(deptCode)
      })
      .catch(() => resolve([]));
  })
};
const changeResult = async (val: any) => {
  if (val == 3) {
    const { getLimitTime } = useLimitTime();
    getLimitTime(props.taskId).then((time) => {
      timeLimit.value = caseBackApproveDto.deadline = dispatchForm.deadline = time;
    });
    // filterDeptCode.value = await getSynergyDepartment() as Array<string>
    // console.log(filterDeptCode.value);
    if (props.caseInfo.acceptDepartment) {
      filterDeptCode.value = [
        props.caseInfo.acceptDepartment,
        applyDepartmentCode?.value
      ];
      immediate.value = true
      // nextTick(() => {
      // });
    } else {
      filterDeptCode.value = [applyDepartmentCode?.value];
      immediate.value = true;
    }
    state.showValue = [
      props.caseInfo.reflectIndustryCode,
      props.caseInfo.reflectClassCode,
    ];
  }
};
watch(
  () => props.caseInfo,
  (val) => {
    // if(props.caseInfo.taskId){
    //   getReturnList();
    // }
    if (val.eventSourceCode) {
      
      if(String(val.eventSourceCode) !== "2"){
        // 其他来源不能退单转网格
        approveTypes.value = approveTypes.value.filter((item) => item.codeValue !== "6");
      }
      if(String(val.eventSourceCode) !== "1"){
        // 其他来源不能转市级审批
        approveTypes.value = approveTypes.value.filter((item) => item.codeValue !== "5");
      }
    }
    if (val.reportDepartmentCode && val.reportDepartmentCode === currentDepartmentCode) {
      returnApproveTypes.value = returnApproveTypes.value.filter(
        (item) => item.codeValue != "4"
      );
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
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
  caseBackApproveDto.description = idContent;
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
