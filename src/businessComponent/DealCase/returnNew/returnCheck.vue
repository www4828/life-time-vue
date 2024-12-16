<template>
  <div>
    <Title title="申请信息" />
    <returnTable :taskId="props.taskId" @changeCheck="changeCheck" />
    <returnApply 
      v-if="caseBackCheckDto.backId"
      :taskId="props.taskId"
      :flowModel="{}"
      :submit="false"
      :attachments="[]"
      :allFiles="[]"
      :caseInfo="props.caseInfo"
      :nodeCode="''"
      :backId="caseBackCheckDto.backId"
      :applyDetail="mcaseHotBackDto"
      ref="returnApplyRef"
    />
    <Title title="退单审核">
      <template #content>
        <el-form
          :model="caseBackCheckDto"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="是否同意" prop="result">
                <el-select v-model="caseBackCheckDto.result" placeholder="请选择">
                  <el-option
                    v-for="item in returnCheckTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
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
            @get-idiom-content="IdiomContent"
            @close-dialog="closeDialog"
            ref="idiomRef"
          />
          <Idiom :node-code="props.flowModel.code" @idiomContentText="IdiomContent"></Idiom>
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import { useDepartment } from "@/hooks/useDepartment";
import { useCode } from "@/hooks/useCode";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { useIdiom } from "@/hooks/useIdiom";
import returnTable from './table.vue'
import { ReturnModel } from '@/api/model/caseModel'
import returnApply from './returnApply.vue';

const disposeService = new DisposeService();

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
const { currentDepartmentCode } = useDepartment();
const { returnCheckTypes } = useCode();
const returnApplyRef = ref()

const caseBackCheckDto = reactive({
  backId: "",
  nodeCode: props.nodeCode,
  result: "",
  description: ""
});
const dispatchRules = reactive<FormRules>({
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  result: [{ required: true, message: "退单原因不能为空", trigger: "blur" }],
  chargePerson: [{ required: true, message: "退单责任人不能为空", trigger: "blur" }],
});
const mcaseHotBackDto = ref<any>({})

const changeCheck = (id:string,detail:ReturnModel)=>{
  caseBackCheckDto.backId = id;
  Object.keys(detail).forEach(key=>{
    mcaseHotBackDto.value[key] = detail[key]
  })
  delete mcaseHotBackDto.value.chargeReason2Name
  delete mcaseHotBackDto.value.chargeReasonName
  delete mcaseHotBackDto.value.nextSourceName
}
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
    mcaseHotBackDto: cloneDeep(mcaseHotBackDto.value)
  };
  // emit("changeLoading", false);
  // console.log(params);

  emit("changeLoading", true);
  disposeService
    .backHotCheck(params)
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
const submit = () => {
  if (caseBackCheckDto.backId) {
    if(caseBackCheckDto.result == '1' ){
      returnApplyRef.value.checkForm().then((res:boolean)=>{
        if(res){
          let detail = returnApplyRef.value.getFormData()
          Object.keys(detail).forEach(key=>{
            mcaseHotBackDto.value[key] = detail[key]
          })
          delete mcaseHotBackDto.value.chargeReason2Name
          delete mcaseHotBackDto.value.chargeReasonName
          delete mcaseHotBackDto.value.nextSourceName
          getIsEnableBack()
        }else{
          emit("changeSubmit");
        }
      })
    }else{
      save();
    }
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
