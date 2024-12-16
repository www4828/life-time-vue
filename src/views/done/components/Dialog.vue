<template>
  <el-dialog
    v-model="props.dialogControl.control"
    custom-class="dialog"
    :title="props.is12345 ? '办结确认信息' : '请选择需要上传的文件，不勾选默认不上传文件'"
    width="70%"
    destroy-on-close
  >
    <Title title="办结信息" v-if="props.is12345">
      <template #content>
        <el-form
          :model="props.dialogControl.caseDisposeReportDto"
          class="from"
          ref="caseDisposeReportRef"
          label-width="120px"
          disabled
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="事实认定" prop="factFinding">
                {{ props.dialogControl.caseDisposeReportDto.factFindingName }}
              </el-form-item>
            </el-col>
            <el-col :span="6" v-show="isShow">
              <el-form-item label="诉求认定" prop="appealFinding">
                {{ props.dialogControl.caseDisposeReportDto.appealFindingName }}
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="落款单位" prop="signedUnit">
                {{ props.dialogControl.caseDisposeReportDto.signedUnit }}
              </el-form-item>
            </el-col>
            <el-col :span="6" v-show="isShow">
              <el-form-item label="现场查看" prop="isXcck">
                {{ props.dialogControl.caseDisposeReportDto.isXcckName }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="事实认定说明" prop="factExplain">
                {{ props.dialogControl.caseDisposeReportDto.factExplain }}
              </el-form-item>
            </el-col>
            <el-col :span="12" v-show="isShow">
              <el-form-item label="诉求认定说明" prop="appealExplain">
                {{ props.dialogControl.caseDisposeReportDto.appealExplain }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-form-item label="市民是否满意" prop="isSmmy">
                {{ props.dialogControl.caseDisposeReportDto.isSmmyName }}
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="答复方式" prop="replyType">
                {{ props.dialogControl.caseDisposeReportDto.replyTypeName }}
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="答复时间" prop="replyTime">
                {{ props.dialogControl.caseDisposeReportDto.replyTime }}
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="现场查看时间" prop="xcckTime">
                {{ props.dialogControl.caseDisposeReportDto.xcckTime }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系市民要点" prop="replyPoint">
                {{ props.dialogControl.caseDisposeReportDto.replyPoint }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="市民反馈说明">
                {{ props.dialogControl.caseDisposeReportDto.feedback }}
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="isLevel2">
            <el-col :span="6">
              <el-form-item label="2级经办人" prop="secondaryAgent">
                {{ props.dialogControl.caseDisposeReportDto.secondaryAgent }}
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="2级负责人">
                {{ props.dialogControl.caseDisposeReportDto.secondaryPrincipal }}
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="2级部门名称" prop="secondaryDepartment">
                {{ props.dialogControl.caseDisposeReportDto.secondaryDepartment }}
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="2级部门电话" prop="secondaryPhone">
                {{ props.dialogControl.caseDisposeReportDto.secondaryPhone }}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <ContactFirst
          :task-id="props.dialogControl.taskId"
          :default-value="props.dialogControl.contacts"
          is-choice
          type="联系市民"
          @get-result="getResult"
        />
        <FileAttachments
          is-choice
          :is-show="false"
          ref="fileRef"
          :default-value="props.dialogControl.files"
          :task-id="props.dialogControl.taskId"
        />
      </template>
    </Title>
    <FileAttachments
      v-else
      is-choice
      :is-show="false"
      ref="fileRef"
      :default-value="props.dialogControl.files"
      :task-id="props.dialogControl.taskId"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('closeDialog')">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { isEmpty } from "lodash-es";
import { useDepartment } from "@/hooks/useDepartment";
import ContactFirst from "./ContactFirst.vue";
import { ElMessage } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { ContactModel } from "@/api/model/disposeModel";
import { FileAttachmentModel } from "@/api/model/fileAttachmentModel";
import { ref, computed, getCurrentInstance, onBeforeUnmount } from "vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
interface Result {
  row: ContactModel;
  sourceData: ContactModel[];
}
const props = defineProps<{
  dialogControl: {
    control: boolean;
    taskId: string;
    caseDisposeReportDto: { [index: string]: string };
    files: FileAttachmentModel[];
    contacts: ContactModel[]
  };
  is12345: Boolean
}>();
const emit = defineEmits(["save", "closeDialog"]);
const { proxy } = <any>getCurrentInstance();
const { currentDepartmentLevel } = useDepartment();
let concatForm = ref<ContactModel[]>([]);
const fileRef = ref();
const isShow = ref(false);
const isLevel2 = computed(() => {
  return currentDepartmentLevel === "2";
});
proxy.mittBus.on("getStatus", (status: boolean) => {
  isShow.value = status;
});
onBeforeUnmount(() => {
  proxy.mittBus.off("getStatus");
});
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
    concatForm.value = sourceData;
  } else {
    concatForm.value = [];
  }
};
const save = () => {
  if (props.is12345 && concatForm.value.length === 0) {
    ElMessage.error("请选择一条先联信息！");
    return;
  }
  
  emit("save", { files: fileRef.value.getChoiceFiles(), concatForm: concatForm.value });
};
</script>

<style lang="scss" scoped>
.from {
  ::v-deep(.el-form-item) {
    margin-bottom: 5px;
  }
}
</style>
