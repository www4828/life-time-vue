<template>
  <Title title="退单解锁">
    <template #content>
      <el-form
        :model="formData.backUnLockDto"
        class="from"
        ref="backUnlockRef"
        :rules="backUnlockRules"
      >
        <el-form-item label="解锁分类" prop="type">
          <el-select v-model="formData.backUnLockDto.type" placeholder="请选择">
            <el-option
              v-for="item in backUnlockTypes"
              :label="item.codeName"
              :value="item.codeValue"
            />
          </el-select>
        </el-form-item>
        <!-- <el-row>
          <el-col :span="12">
            <el-form-item label="解锁分类" prop="type">
              <el-select v-model="formData.backUnLockDto.type" placeholder="请选择">
                <el-option
                  v-for="item in backUnlockTypes"
                  :label="item.codeName"
                  :value="item.codeValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="解锁分类" prop="type">
              <el-select
                v-model="formData.backUnLockDto.type"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择"
              >
                <el-option
                  v-for="item in dispatchDept"
                  :label="item.disposeDeptName"
                  :value="item.id!"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-form-item label="解锁备注" prop="description">
          <el-input
            @dblclick="showDialog"
            v-model="formData.backUnLockDto.description"
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
</template>
<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useCode } from "@/hooks/useCode";
import { ElMessage, FormRules } from "element-plus";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import type { FormInstance } from "element-plus";
import { useDepartment } from "@/hooks/useDepartment";
import Title from "@/components/Title/TitleCollapse.vue";
import { CaseDispatchModel } from "@/api/model/caseModel";
import { BackUnlockModel } from "@/api/model/backUnlockModel";
import { BackUnlockService } from "@/api/service/BackUnlock/BackUnlockService";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { useIdiom } from "@/hooks/useIdiom";
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
const { backUnlockTypes } = useCode();
const backUnlockRef = ref<FormInstance>();
const disposeService = new DisposeService();
const { currentDepartmentCode } = useDepartment();
const dispatchDept = ref<CaseDispatchModel[]>([]);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const emit = defineEmits(["changeSubmit", "changeLoading", "done"]);
const backUnlockRules = reactive<FormRules>({
  description: [{ required: true, message: "解锁备注不能为空", trigger: "blur" }],
  type: [{ required: true, message: "解锁分类不能为空", trigger: "change" }],
});
const formData: BackUnlockModel = reactive({
  attachmentInfos: [],
  backUnLockDto: {
    currentDepartment: currentDepartmentCode,
    description: "",
    taskId: props.taskId,
    type: "",
  },
});

const backUnlockService = new BackUnlockService();

const save = () => {
  emit("changeLoading", true);
  formData.attachmentInfos = props.attachments;
  console.log(props.attachments);
  backUnlockService
    .save(formData)
    .then((res) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
      emit("done");
    })
    .catch(() => emit("done"));
};
const getDispatchDeptList = () => {
  disposeService.getDispatchDeptList(currentDepartmentCode, props.taskId).then((res) => {
    if (res.code === 200) {
      dispatchDept.value = res.data;
    }
  });
};
getDispatchDeptList();
watch(
  () => props.submit,
  (val) => {
    val &&
      backUnlockRef.value?.validate((valid: any) => {
        if (valid) {
          save();
        } else {
          emit("changeSubmit");
        }
      });
  },
  { deep: true }
);
const IdiomContent = (idContent: string) => {
  formData.backUnLockDto.description = idContent;
};
</script>

<style lang="scss" scoped></style>
