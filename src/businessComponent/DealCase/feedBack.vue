<template>
  <div>
    <Title title="次紧急反馈">
      <template #content>
        <el-form :model="formData" class="from" ref="dispatchForm" :rules="dispatchRules" label-width="200px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="次紧急情况是否处置" class="longlabel" prop="isSolved">
                <el-select v-model="formData.isSolved" placeholder="请选择">
                  <el-option v-for="item in emergencyIsSolved" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="未解决原因" prop="unResolvedReasons">
                <el-select v-model="formData.unResolvedReasons" placeholder="请选择">
                  <el-option v-for="item in unresolvedCauses" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否需要联系告知市民" class="longlabel" prop="isContact">
                <el-select v-model="formData.isContact" placeholder="请选择">
                  <el-option v-for="item in emergencyFeedback" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否现场查看" prop="isOsi">
                <el-select v-model="formData.isOsi" placeholder="请选择">
                  <el-option v-for="item in liveTypes" :label="item.codeName" :value="item.codeValue" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="二级单位名称" prop="deptLevel2Name">
                <el-input v-model="formData.deptLevel2Name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="二级负责人" prop="deptLevel2By">
                <el-input v-model="formData.deptLevel2By"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="三级单位名称" prop="deptLevel3">
                <el-input v-model="formData.deptLevel3"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="三级负责人" prop="deptLevel3By">
                <el-input v-model="formData.deptLevel3By"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="办理进度描述" prop="summary">
            <el-input v-model="formData.summary" @dblclick="showDialog" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" maxlength="500"
              show-word-limit />
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
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import Title from "@/components/Title/Title.vue";
import { cloneDeep, debounce } from "lodash-es";
import { Session } from "@/utils/storage";
import { useCode } from "@/hooks/useCode";
import { useIdiom } from "@/hooks/useIdiom";
import { ElMessage, ElForm, FormRules } from "element-plus";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { useDepartment } from "@/hooks/useDepartment";
import { UrgentModel } from "@/api/model/caseModel";

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
const dispatchForm = ref<InstanceType<typeof ElForm>>();
const caseService = new CaseService();
const { emergencyIsSolved, emergencyFeedback, unresolvedCauses, liveTypes } = useCode();
const { departmentList, currentDepartmentCode, currentDepartmentLevel } = useDepartment();

const formData = reactive<UrgentModel>({
  taskId: props.taskId
});

const dispatchRules = reactive<FormRules>({
  summary: [{ required: true, message: "办理进度描述不能为空", trigger: "blur" }],
  isSolved: [{ required: true, message: "请选择", trigger: "blur,change" }],
  isContact: [{ required: true, message: "请选择", trigger: "blur,change" }],
  isOsi: [{ required: true, message: "请选择", trigger: "blur,change" }],
  deptLevel2By: [{ required: true, message: "二级负责人不能为空", trigger: "blur" }],
  deptLevel2Name: [{ required: true, message: "二级单位不能为空", trigger: "blur" }],
  unResolvedReasons: [
  {
      required: false,
      validator(rule, value, callback, source, options) {
        if (formData.isSolved === '0' || value) {
          callback()
        } else {
          callback(new Error('处置情况选择“未解决”和“无需处置”时，未解决原因必填!'))
        }
      },
    },
  ]
});

const save = debounce(() => {
  emit("changeLoading", true);
  caseService.postCaseHotLu({
    attachmentInfos:  cloneDeep(props.attachments),
    caseHotLu: formData,
    department: cloneDeep(departmentList[0])
  }).then((res:any)=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'error' ,
      message: res.message + "，即将返回列表页"
    })
    emit("done");
  }).catch(() => emit("done"));
})

const init = () => {
};
init();
watch(
  () => props.submit,
  (val) => {
    val &&
      dispatchForm.value?.validate((valid: any) => {
        if (valid) {
          save();
        } else {
          emit("changeSubmit");
        }
      });
  }
);
const IdiomContent = (idContent: string) => {
  formData.summary = idContent;
};
</script>
