<template>
  <WorkLayout
    class="index"
    :node-name="props.listPrams!.name"
    v-loading="reportLoading"
    element-loading-text="正在提交数据请稍后!"
  >
    <template #baseInfo>
      <CaseBaseInfo :task-id="props.listPrams?.taskId!" @setCaseInfo="setCaseInfo"/>
      <DBForm :task-id="props.listPrams?.taskId!" ref="dbFormRef" v-if="isDB" />
      <FileAttachments
        :task-id="props.listPrams?.taskId!"
        node-code="C219"
        ref="fileAttachments"
      />
    </template>
    <template #history>
      <HistoryCase :phone="tel" :task-id="props.listPrams?.taskId!" />
    </template>
    <template #process>
      <Process v-if="props.listPrams?.taskId" :taskId="props.listPrams?.taskId" />
    </template>
    <template #actions>
      <div class="dispatchWrapper">
        <div class="formWrapper">
          <el-form
            :model="formData"
            class="from"
            ref="dispatchForm"
            :rules="dispatchRules"
            label-width="200px"
            >
            <Title title="反馈" />
            <el-row>
              <el-col :span="12">
                <el-form-item label="次紧急情况是否处置" class="longlabel" prop="isSolved">
                  <el-select
                    v-model="formData.isSolved"
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in emergencyIsSolved"
                      :label="item.codeName"
                      :value="item.codeValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="未解决原因" prop="unResolvedReasons">
                  <el-select
                    v-model="formData.unResolvedReasons"
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in unresolvedCauses"
                      :label="item.codeName"
                      :value="item.codeValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否需要联系告知市民"  class="longlabel" prop="isContact">
                  <el-select
                    v-model="formData.isContact"
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in emergencyFeedback"
                      :label="item.codeName"
                      :value="item.codeValue"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否现场查看" prop="isOsi">
                  <el-select
                    v-model="formData.isOsi"
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in liveTypes"
                      :label="item.codeName"
                      :value="item.codeValue"
                    />
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
              <el-input
                v-model="formData.summary"
                :autosize="{ minRows: 2, maxRows: 4 }"
                type="textarea"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </template>
    <template #buttons>
      <div class="btnWrapper">
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button type="info" @click="emit('back')">返回</el-button>
      </div>
    </template>
  </WorkLayout>
</template>
<script lang="ts" setup>
import { useCode } from "@/hooks/useCode";
import type { FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { useDepartment } from "@/hooks/useDepartment";
import { ref, reactive, computed, nextTick } from "vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import WorkLayout from "@/components/Layout/WorkLayout.vue";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import { LettersVisitService } from "@/api/service/LettersVisit/LettersVisitService";
import DBForm from "@/views/workEntry/dbReport/components/dbForm.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import CaseBaseInfo from "@/businessComponent/CaseInfo/CaseBaseInfoXF.vue";
import Process from "@/businessComponent/Process/ProcessXF.vue";
import { debounce, cloneDeep } from "lodash-es";
import { useLock } from "@/hooks/useLock";
import {
  UrgentModel,
  CaseModel,
  DispatchFormModel,
  DepartmentModel,
  CaseFormModel,
} from "@/api/model/caseModel";

interface ListPrams {
  id: string;
  taskId: string;
  name: string;
}
interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
  nodes: Array<DepartmentModel>;
}
const emit = defineEmits(["changeName", "back"]);
const props = defineProps<{
  listPrams?: ListPrams;
  buttons: ButtonInfoModel[];
}>();
const lettersVisitService = new LettersVisitService();
const dbFormRef = ref();
const tel = ref("");
const { unlockCase } = useLock();

const isDB = ref(false);
const reportLoading = ref(false);
const { emergencyIsSolved, emergencyFeedback, unresolvedCauses, liveTypes } = useCode();
const { departmentList, currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const departmentCode = ref(currentDepartmentCode);
const fileAttachments = ref();
const dispatchForm = ref<InstanceType<typeof ElForm>>();
const caseInfo = reactive({}) as CaseFormModel; // 详情
const formData = reactive<UrgentModel>({
  taskId: props.listPrams?.taskId
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

const setCaseInfo = (data: any) => {
  // 案件详情
  Object.keys(data).forEach((key) => {
    caseInfo[key] = data[key];
  });
};

const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    dispatchForm.value!.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const back = () => {
  unlockCase(props.listPrams?.taskId!).then((status) => {
    if (status) {
      emit("back");
    } else {
      ElMessage.error("解锁失败！");
    }
  });
};
const submit = debounce(() => {
  checkForm().then(valid=>{
    if(valid){
      reportLoading.value = true;
      lettersVisitService.postXfCaseHotLu({
        attachmentInfos: fileAttachments.value.getFiles(),
        caseHotLu: formData,
        department: cloneDeep(departmentList[0])
      }).then((res:any)=>{
        reportLoading.value = false
        ElMessage({
          type: res.code == 200 ? 'success' : 'error' ,
          message: res.message
        })
        if (res.code === 200) {
          back()
        }
      })
    }
  })
})

</script>

<style lang="scss" scoped>
.dispatchWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  .formWrapper {
    flex: 1;
  }
}
</style>
