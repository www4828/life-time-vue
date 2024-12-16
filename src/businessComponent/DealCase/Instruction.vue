<template>
  <div>
    <Title title="发起批示">
      <template #content>
        <el-form
          :model="formData"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <!-- <el-row>
            <el-col :span="6">
            </el-col>
          </el-row> -->
          <el-form-item label="批示" prop="comment">
            <el-input
              @dblclick="showDialog"
              v-model="formData.comment"
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
import { ElMessage, FormRules } from "element-plus";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import Title from "@/components/Title/Title.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { cloneDeep } from "lodash-es";
import { Session } from "@/utils/storage";
import { useCode } from "@/hooks/useCode";
import { useIdiom } from "@/hooks/useIdiom";
import { getLimitTime } from "@/hooks/getLimitTime";
import { EmitProps } from "@/businessComponent/ClassSelect/type";


const disposeService = new DisposeService();
const { timeLimitTypes } = useCode();
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
const emit = defineEmits(["changeLoading", "changeSubmit", "done"]);
const { departmentList } = Session.get("userInfo");

const returnApplyForm = ref();
const formData = reactive({
  "comment": "",
  "deptCode": departmentList[0].departmentCode,
  "taskId": props.taskId
});

const dispatchRules = reactive<FormRules>({
  comment: [{ required: true, message: "批示内容不能为空", trigger: "blur" }],
});

const save = () => {
  // emit('changeSubmit')
  // console.log(formData);
  // 发起批示
  emit("changeLoading", true);
  disposeService
    .sendToDept(formData)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? "success" : "error",
        message: res.message + "，即将返回列表页",
      });
      emit("done");
    })
    .catch(() => emit("done"));
};


const init = () => {
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
  formData.comment = idContent;
};
</script>
