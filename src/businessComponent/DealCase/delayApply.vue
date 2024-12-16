<template>
  <div>
    <Title title="申请延期">
      <template #content>
        <el-form
          :model="caseDelayApplyDto"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="延期原因" prop="delayReason">
                <el-select v-model="caseDelayApplyDto.delayReason" placeholder="请选择">
                  <el-option
                    v-for="item in useCode().delayApplyTypes.value"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申请天数" prop="applyDay">
                <el-select v-model="caseDelayApplyDto.applyDay" placeholder="请选择">
                  <el-option
                    v-for="item in useCode().applyDaysTypes.value"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申请时间">
                <span>{{ caseDelayApplyDto.applyTime }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="延期申请人">
                <span>{{ caseDelayApplyDto.applyPerson }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="意见说明" prop="description">
            <el-input
              @dblclick="showDialog"
              v-model="caseDelayApplyDto.description"
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
import { reactive, ref, watch } from "vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import dayjs from "dayjs";
import { useCode } from "@/hooks/useCode";
import { useIdiom } from "@/hooks/useIdiom";
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
const emit = defineEmits(["changeLoading", "done", "changeSubmit"]);
const returnApplyForm = ref();
const caseDelayApplyDto = reactive({
  delayReason: "",
  applyDay: "",
  applyTime: "",
  applyPerson: "",
  description: "",
});
const dispatchRules = reactive<FormRules>({
  description: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  delayReason: [{ required: true, message: "延期原因不能为空", trigger: "blur" }],
  applyDay: [{ required: true, message: "退单责任人不能为空", trigger: "blur" }],
});

const checkForm = () => {
  return returnApplyForm.value.validate();
};
defineExpose({
  checkForm,
});
const save = () => {
  // 申请延期
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
    caseDelayApplyDto: cloneDeep(caseDelayApplyDto),
  };

  emit("changeLoading", true);
  disposeService
    .delayApply(params)
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

const init = () => {
  const { name } = Session.get("userInfo");
  caseDelayApplyDto.applyPerson = name;
  caseDelayApplyDto.applyTime = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
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
  caseDelayApplyDto.description = idContent;
};
</script>
