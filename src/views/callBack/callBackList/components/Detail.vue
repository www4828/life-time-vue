<template>
  <WorkLayout
    class="index"
    :node-name="props.listPrams!.name"
    v-loading="reportLoading"
    element-loading-text="正在提交数据请稍后!"
  >
    <template #baseInfo>
      <!-- <BaseCaseForm ref="baseCaseForm" @getValue="getValue" is-detail :task-id="props.listPrams?.taskId!" /> -->
      <CaseBaseInfo :task-id="props.listPrams?.taskId!" @setCaseInfo="setCaseInfo" />
      <FileAttachments
        :task-id="props.listPrams?.taskId!"
        :node-code="nodeCode"
        ref="fileAttachments"
      />
    </template>
    <template #history>
      <HistoryCase :phone="forms.reportPhone" :taskId="props.listPrams?.taskId!" />
    </template>
    <template #process>
      <Process v-if="props.listPrams?.taskId!" :taskId="props.listPrams?.taskId!" />
    </template>
    <template #actions>
      <div class="dispatchWrapper">
        <div class="formWrapper">
          <Title title="案件回访">
            <template #content>
              <el-form
                :model="callBackForm"
                class="from"
                ref="callBackForms"
                :rules="callBackRules"
              >
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="满意度" prop="myd">
                      <el-select v-model="callBackForm.myd" filterable>
                        <el-option
                          v-for="item in satisfiedTypes"
                          :label="item.codeName"
                          :value="item.codeValue"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="是否先联" prop="sfxl">
                      <el-select v-model="callBackForm.sfxl" filterable>
                        <el-option label="已联" value="已联" />
                        <el-option label="未联" value="未联" />
                        <el-option label="未知" value="未知" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="回访人员" prop="">
                      <span>{{ callBackForm.hfry }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item>
                      <template #label>
                        <el-checkbox v-model="callBackForm.sfdx">典型案例</el-checkbox>
                      </template>
                      <el-input v-model="callBackForm.dxal"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="回访结果" prop="hfjg">
                      <el-select v-model="callBackForm.hfjg" filterable>
                        <el-option
                          v-for="item in callBackResultTypes"
                          :label="item.codeName"
                          :value="item.codeValue"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="回访形式" prop="hfxs">
                      <el-select v-model="callBackForm.hfxs" filterable>
                        <el-option
                          v-for="item in replyTypes"
                          :label="item.codeName"
                          :value="item.codeValue"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="回访时间" prop="">
                      <span>{{ callBackForm.hfsj }}</span>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="回访描述" prop="hfms">
                  <el-input
                    v-model="callBackForm.hfms"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    type="textarea"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>
              </el-form>
            </template>
          </Title>

          <TitleMerage title="办结报告" v-if="forms.eventSourceCode == '1'">
            <template #content>
              <el-form
                :model="comForm.caseDisposeDto"
                class="from"
                ref="caseDisposeDtoForm"
              >
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="处理结果" prop="result">
                      <span>{{ comForm.caseDisposeDto.result }}</span>
                      <!-- <el-select v-model="comForm.caseDisposeDto.result" filterable disabled>
                                                <el-option v-for="item in resultTypes" :label="item.codeName"
                                                    :value="item.codeValue" />
                                            </el-select> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="处理人员" prop="person">
                      <span>{{ comForm.caseDisposeDto.person }}</span>
                      <!-- <el-input v-model="comForm.caseDisposeDto.person" disabled></el-input> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="处理时间" prop="time">
                      <span>{{ comForm.caseDisposeDto.time }}</span>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="事项类别" prop="firstClass">
                      <span>{{
                        comForm.caseDisposeDto.firstClass +
                        "" +
                        comForm.caseDisposeDto.secondClass +
                        "" +
                        comForm.caseDisposeDto.thirdClass
                      }}</span>
                      <!-- <ClassSelect :departmentCode="currentDepartmentCode"
                                                :departmentLevel="currentDepartmentLevel" :showValue="defaultVale"
                                                @getCheckedValue="getCheckedValue" /> -->
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="意见说明" prop="description">
                  <span>{{ comForm.caseDisposeDto.description }}</span>
                  <!-- <el-input v-model="comForm.caseDisposeDto.description"
                                        :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" maxlength="500"
                                        show-word-limit disabled /> -->
                </el-form-item>
              </el-form>
              <el-divider />
              <el-form
                :model="comForm.caseDisposeReportDto"
                class="from"
                ref="caseDisposeReportDto"
              >
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="事实认定" prop="factFinding">
                      <span>{{ comForm.caseDisposeReportDto.factFinding }}</span>
                      <!-- <el-select v-model="comForm.caseDisposeReportDto.factFinding" filterable
                                                placeholder="请选择" disabled>
                                                <el-option v-for="item in factTypes" :label="item.codeName"
                                                    :value="item.codeValue" />
                                            </el-select> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="诉求认定" prop="appealFinding">
                      <span>{{ comForm.caseDisposeReportDto.appealFinding }}</span>
                      <!-- <el-select v-model="comForm.caseDisposeReportDto.appfalFiding" placeholder="请选择"
                                                disabled>
                                                <el-option v-for="item in appealTypes" :label="item.codeName"
                                                    :value="item.codeValue" />
                                            </el-select> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="落款单位" prop="signedUnit">
                      <span>{{ comForm.caseDisposeReportDto.signedUnit }}</span>

                      <!-- <el-input v-model="comForm.caseDisposeReportDto.signedUnit" disabled></el-input> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="现场查看" prop="isXcck">
                      <span>{{ comForm.caseDisposeReportDto.isXcck }}</span>

                      <!-- <el-select v-model="comForm.caseDisposeReportDto.isXcck" placeholder="请选择"
                                                filterable disabled>
                                                <el-option v-for="item in liveTypes" :label="item.codeName"
                                                    :value="item.codeValue" />
                                            </el-select> -->
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="事实认定说明" prop="factExplain">
                  <span>{{ comForm.caseDisposeReportDto.factExplain }}</span>

                  <!-- <el-input v-model="comForm.caseDisposeReportDto.factExplain" type="textarea"
                                        :autosize="{ minRows: 2, maxRows: 4 }" disabled></el-input> -->
                </el-form-item>
                <el-form-item label="诉求认定说明" prop="appealExplain">
                  <span>{{ comForm.caseDisposeReportDto.appealExplain }}</span>
                  <!-- <el-input v-model="comForm.caseDisposeReportDto.appealExplain" type="textarea"
                                        :autosize="{ minRows: 2, maxRows: 4 }" disabled></el-input> -->
                </el-form-item>
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="市民是否满意" prop="isSmmy">
                      <span>{{ comForm.caseDisposeReportDto.isSmmy }}</span>

                      <!-- <el-select v-model="comForm.caseDisposeReportDto.isSmmy" placeholder="请选择"
                                                filterable disabled>
                                                <el-option v-for="item in satisfiedTypes" :label="item.codeName"
                                                    :value="item.codeValue" />
                                            </el-select> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="答复方式" prop="replyType">
                      <span>{{ comForm.caseDisposeReportDto.replyType }}</span>
                      <!-- <el-select v-model="comForm.caseDisposeReportDto.replyType" placeholder="请选择"
                                                filterable disabled>
                                                <el-option v-for="item in replyTypes" :label="item.codeName"
                                                    :value="item.codeValue" />
                                            </el-select> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="答复时间" prop="replyTime">
                      <span>{{ comForm.caseDisposeReportDto.replyTime }}</span>

                      <!-- <el-date-picker v-model="comForm.caseDisposeReportDto.replyTime" type="datetime"
                                                format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" disabled /> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="现场查看时间">
                      <span>{{ comForm.caseDisposeReportDto.xcckTime }}</span>

                      <!-- <el-select v-model="comForm.caseDisposeReportDto.isXcck" placeholder="请选择"
                                                filterable disabled>
                                                <el-option v-for="item in liveTypes" :label="item.codeName"
                                                    :value="item.codeValue" />
                                            </el-select> -->
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="联系市民要点" prop="replyPoint">
                  <span>{{ comForm.caseDisposeReportDto.replyPoint }}</span>
                  <!-- <el-input v-model="comForm.caseDisposeReportDto.replyPoint" type="textarea"
                                        :autosize="{ minRows: 2, maxRows: 4 }" disabled></el-input> -->
                </el-form-item>
                <el-form-item label="市民反馈说明">
                  <span>{{ comForm.caseDisposeReportDto.feedback }}</span>

                  <!-- <el-input v-model="comForm.caseDisposeReportDto.feedback" type="textarea"
                                        :autosize="{ minRows: 2, maxRows: 4 }" disabled></el-input> -->
                </el-form-item>
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="2级经办人">
                      <span>{{ comForm.caseDisposeReportDto.secondaryAgent }}</span>

                      <!-- <el-input v-model="comForm.caseDisposeReportDto.secondaryAgent"
                                                disabled></el-input> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="2级负责人">
                      <span>{{ comForm.caseDisposeReportDto.secondaryPrincipal }}</span>

                      <!-- <el-input v-model="comForm.caseDisposeReportDto.secondaryPrincipal"
                                                disabled></el-input> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="2级部门名称">
                      <span>{{ comForm.caseDisposeReportDto.secondaryDepartment }}</span>

                      <!-- <el-input v-model="comForm.caseDisposeReportDto.secondaryDepartment"
                                                disabled></el-input> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="2级部门电话">
                      <span>{{ comForm.caseDisposeReportDto.secondaryPhone }}</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </template>
          </TitleMerage>
        </div>
      </div>
    </template>
    <template #buttons>
      <div class="btnWrapper">
        <el-button type="primary" @click="jumpToDetail(props.listPrams?.taskId!)"
          >详情</el-button
        >
        <el-button type="primary" @click="buttonClick">确定</el-button>
        <el-button type="info" @click="$emit('back')">返回</el-button>
      </div>
    </template>
  </WorkLayout>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, nextTick } from "vue";

import Title from "@/components/Title/TitleCollapse.vue";
import TitleMerage from "@/components/Title/TitleMerage.vue";

import WorkLayout from "@/components/Layout/WorkLayout.vue";
import HistoryCase from "@/businessComponent/HistoryCase/HistoryCase.vue";
import CaseBaseInfo from "@/businessComponent/CaseInfo/CaseBaseInfo.vue";
import Process from "@/businessComponent/Process/Process.vue";

import FileAttachments from "@/businessComponent/FileAttachments/FileAttachments.vue";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import { useDepartment } from "@/hooks/useDepartment";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
import type { FormRules } from "element-plus";
import { useCode } from "@/hooks/useCode";
import { CodeService } from "@/api/service/System/CodeService";
import { CallBackService } from "@/api/service/CaseCallBack/CallBackService";

import { CodeModel } from "@/api/model/codeModel";
import { CallBackCaseModel } from "@/api/model/callBackModel";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import dayjs from "dayjs";
import { Session } from "@/utils/storage";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import { useNodeCode } from "@/hooks/useNodeCode";

import {
  CaseModel,
  DispatchFormModel,
  DepartmentModel,
  CaseFormModel,
} from "@/api/model/caseModel";
import { getLimitTime } from "@/hooks/getLimitTime";

interface ListPrams {
  id: string;
  taskId: string;
  name: string;
}
interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
}
const emit = defineEmits(["back"]);
const props = defineProps<{
  listPrams?: ListPrams;
}>();
const { jumpToDetail } = useCaseDetail();

const callBackService = new CallBackService();
const { departmentList, currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const disposeService = new DisposeService();

const forms: any = reactive({}); // 详情
const form = reactive<CaseModel>({
  caseInfo: {} as CaseFormModel,
  specialFlags: [],
  dispatchInfos: [],
  attachmentInfos: [],
  isAuto: "",
  department: departmentList[0] as DepartmentModel,
});
const comForm = reactive({
  caseDisposeDto: {
    content: "",
    description: "",
    person: "",
    result: "",
    taskId: "",
    time: "",
    type: "",
    id: "",
    firstClass: "",
    secondClass: "",
    thirdClass: "",
    fourthClass: "",
    status: "",
    departmentCode: "",
  },
  caseDisposeReportDto: {
    appealExplain: "",
    appealFinding: "",
    factExplain: "",
    factFinding: "",
    feedback: "",
    isSmmy: "",
    isXcck: "",
    replyPoint: "",
    replyTime: "",
    replyType: "",
    secondaryAgent: "",
    secondaryDepartment: "",
    secondaryPrincipal: "",
    signedUnit: "",
    taskId: "",
    xcckTime: "",
    secondaryPhone: "",
  },
});
let { username } = Session.get("userInfo");
const callBackForm = reactive<CallBackCaseModel>({
  callbackId: "",
  dxal: "",
  hfjg: "",
  hfry: username,
  hfsj: dayjs().format("YYYY-MM-DD HH:mm"),
  hfxs: "",
  myd: "",
  recordId: "",
  sfdx: false,
  sfxl: "",
  taskId: props.listPrams?.taskId!,
  departmentVo: departmentList[0],
  hfms: "",
  attachmentInfos: [],
});

const callBackRules = reactive<FormRules>({
  myd: [{ required: true, message: "满意度不能为空", trigger: "change" }],
  sfxl: [{ required: true, message: "是否先联不能为空", trigger: "change" }],
  hfjg: [{ required: true, message: "回访结果不能为空", trigger: "change" }],
  hfxs: [{ required: true, message: "回访形式不能为空", trigger: "change" }],
  hfms: [{ required: true, message: "回访描述不能为空", trigger: "blur" }],
});

const { nodeCode } = useNodeCode();
const reportLoading = ref(false);
const fileAttachments = ref();
const getDisposeReport = () => {
  disposeService.getOneReport(props.listPrams?.taskId!).then((res) => {
    if (res.code == 200) {
      if (res.data != "") {
        // comForm.caseDisposeDto.content = res.data.content;
        // comForm.caseDisposeDto.description = res.data.description;
        // comForm.caseDisposeDto.person = res.data.person;
        // comForm.caseDisposeDto.result = res.data.result;
        // comForm.caseDisposeDto.taskId = res.data.taskId;
        // comForm.caseDisposeDto.time = res.data.time;
        // comForm.caseDisposeDto.type = res.data.type;
        // comForm.caseDisposeDto.id = res.data.id;
        // comForm.caseDisposeDto.firstClass = res.data.firstClass;
        // comForm.caseDisposeDto.secondClass = res.data.secondClass;
        // comForm.caseDisposeDto.thirdClass = res.data.thirdClass;
        // comForm.caseDisposeDto.fourthClass = res.data.fourthClass;
        // comForm.caseDisposeDto.status = res.data.status;
        // comForm.caseDisposeDto.departmentCode = res.data.departmentCode;

        comForm.caseDisposeReportDto.appealExplain =
          res.data.appealExplain;
        comForm.caseDisposeReportDto.appealFinding =
          res.data.appealFinding;
        comForm.caseDisposeReportDto.factExplain =
          res.data.factExplain;
        comForm.caseDisposeReportDto.factFinding =
          res.data.factFinding;
        comForm.caseDisposeReportDto.feedback = res.data.feedback;
        comForm.caseDisposeReportDto.isSmmy = res.data.isSmmy;
        comForm.caseDisposeReportDto.isXcck = res.data.isXcck;
        comForm.caseDisposeReportDto.replyPoint =
          res.data.replyPoint;
        comForm.caseDisposeReportDto.replyTime = res.data.replyTime;
        comForm.caseDisposeReportDto.replyType = res.data.replyType;
        comForm.caseDisposeReportDto.secondaryAgent =
          res.data.secondaryAgent;
        comForm.caseDisposeReportDto.secondaryDepartment =
          res.data.secondaryDepartment;
        comForm.caseDisposeReportDto.secondaryPrincipal =
          res.data.secondaryPrincipal;
        comForm.caseDisposeReportDto.signedUnit =
          res.data.signedUnit;
        comForm.caseDisposeReportDto.taskId = res.data.taskId;
        comForm.caseDisposeReportDto.xcckTime = res.data.xcckTime;
        comForm.caseDisposeReportDto.secondaryPhone =
          res.data.secondaryPhone;
      }
    }
  });
};
getDisposeReport();
const { satisfiedTypes, replyTypes, callBackResultTypes } = useCode();
const setCaseInfo = (data: any) => {
  // 案件详情
  Object.keys(data).forEach((key) => {
    forms[key] = data[key];
  });
  // console.log('forms', forms)
};
const buttonClick = () => {
  callBackForm.attachmentInfos = fileAttachments.value.getFiles();
  callBackService
    .saveCallBackCase(callBackForm)
    .then((res) => {
      if (res.code == 200) {
        ElMessage({
          message: res.message,
          type: res.code == 200 ? "success" : "error",
        });
      }
    })
    .finally(() => {
      emit("back");
    });
};
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
