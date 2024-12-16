<template>
  <div>
    <Title title="申请退单">
      <template #content>
        <el-form
          :model="dispatchForm"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="退单原因" prop="chargeReason">
                <el-select v-model="dispatchForm.chargeReason" placeholder="请选择">
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
                <el-input v-model="dispatchForm.chargePerson"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申请时间">
                <span>{{ dispatchForm.applyTime }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="退单申请人">
                <span>{{ dispatchForm.applyPerson }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="意见说明" prop="description">
            <el-input
              @dblclick="showDialog"
              v-model="dispatchForm.description"
              autofocus
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <Idiom :node-code="props.flowModel.code" @idiomContentText="IdiomContent"></Idiom>
          <IdiomDialog
            :node-code="props.flowModel.code"
            :show-flag="idiomControl"
            @close-dialog="closeDialog"
            @get-idiom-content="IdiomContent"
            ref="idiomRef"
          />
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
import dayjs from "dayjs";
import { useCode } from "@/hooks/useCode";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { useDepartment } from "@/hooks/useDepartment";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { useIdiom } from "@/hooks/useIdiom";
const { returnApplyTypes } = useCode();
const disposeService = new DisposeService();
const { currentDepartmentCode } = useDepartment();
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
const emit = defineEmits(["changeLoading", "changeSubmit", "done"]);
const returnApplyForm = ref();
const dispatchForm = reactive({
  chargeReason: "",
  chargePerson: "",
  applyTime: "",
  applyPerson: "",
  description: "",
  nodeCode: props.nodeCode,
});
const dispatchRules = reactive<FormRules>({
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  chargeReason: [{ required: true, message: "退单原因不能为空", trigger: "blur" }],
  chargePerson: [{ required: true, message: "退单责任人不能为空", trigger: "blur" }],
});

const checkForm = () => {
  return returnApplyForm.value.validate();
};
defineExpose({
  checkForm,
});
const save = () => {
  // 退单shenqing
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
    caseBackApplyDto: cloneDeep(dispatchForm),
  };
  //  emit("changeLoading", false);
  // console.log(params);
  
  emit("changeLoading", true);
  disposeService
    .returnApply(params)
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
const submit = () => {
  emit("changeLoading", true);
  disposeService
    .getIsEnableBack(props.taskId, currentDepartmentCode)
    .then((res) => {
      // console.log('getIsEnableBack',res);
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
const init = () => {
  const { name } = Session.get("userInfo");
  dispatchForm.applyPerson = name;
  dispatchForm.applyTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
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
  dispatchForm.description = idContent;
};
</script>
