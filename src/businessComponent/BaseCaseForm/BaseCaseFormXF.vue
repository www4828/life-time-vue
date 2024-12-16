<template>
  <div class="baseCaseFormContent">
    <Title title="基本信息" class="marginB" align="flex-start">
      <CaseIcon :icons="icons" v-if="props.taskId" />
    </Title>
    <el-form
      :model="caseInfo"
      class="from"
      ref="reportForm"
      label-width="110px"
      :rules="rules"
      :validate-on-rule-change="false"
    >
      <el-row>
        <el-col :span="6" v-if="caseInfo.taskId">
          <el-form-item label="工单编号">
            <el-input v-model="caseInfo.taskId" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="事件来源">
            <el-select v-model="caseInfo.eventSourceCode" disabled>
              <el-option
                v-for="type in fromTypes"
                :label="type.codeName"
                :value="type.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="紧急程度">
            <el-select v-model="caseInfo.emergency">
              <el-option
                v-for="type in urgentTypes"
                :label="type.codeName"
                :value="type.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="接报时间">
            <el-date-picker
              disabled
              v-model="caseInfo.reportTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="反映人" prop="reportPerson">
            <el-input v-model="caseInfo.reportPerson" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="来电号码">
            <el-input v-model="caseInfo.reportPhone" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="联系电话">
            <el-input v-model="userPhone" maxlength="11" @input="phoneChange" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="反映来源" prop="reflectSourceCode">
            <el-select
              v-model="caseInfo.reflectSourceCode"
              filterable
              @change="sourceChange"
              :disabled="!!route.query.sourceCode"
            >
              <el-option
                v-for="type in sourceTypeByDeptCode"
                :label="type.codeName"
                :value="type.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="反映区名" prop="district">
            <el-select v-model="caseInfo.district" filterable>
              <el-option
                v-for="type in districtTypes"
                :label="type.codeName"
                :value="type.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="特殊标签">
            <el-select v-model="specialTips" multiple collapse-tags>
              <el-option
                v-for="type in specialTypes"
                :label="type.codeName"
                :value="type.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="工单类型">
            <el-select v-model="caseInfo.caseType" disabled>
              <el-option
                v-for="type in ticketTypes"
                :label="type.codeName"
                :value="type.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="业务类型" prop="businessType">
            <el-select v-model="caseInfo.businessType">
              <el-option
                v-for="type in businessTypes"
                :label="type.codeName"
                :value="type.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="匿名">
            <el-select v-model="caseInfo.isNM">
              <el-option label="是" value="1" />
              <el-option label="否" value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="重复次数">
            <el-input v-model="caseInfo.repeatCount" @input="valChange" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="重复单号">
            <el-input v-model="caseInfo.repeatTaskId" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="事项类别" prop="reflectIndustryCode">
            <ClassSelect
              ref="classSelect"
              :departmentCode="currentDepartmentCode"
              :departmentLevel="currentDepartmentLevel"
              @getCheckedValue="getCheckedValue"
              :show-value="defaultClass"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" v-if="caseInfo.taskId">
          <el-form-item label="退单截止时间">
            <el-input v-model="caseInfo.tdjzTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6" v-if="caseInfo.taskId">
          <el-form-item label="延期截止时间">
            <el-input v-model="caseInfo.yqjzTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6" v-if="caseInfo.eventSourceCode === '1'">
          <el-form-item label="外系统编号">
            <el-link
              type="primary"
              :underline="false"
              @click="jumpToOldDetail(caseInfo.externalNumber!)"
              >{{ caseInfo.externalNumber || "--" }}</el-link
            >
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="caseInfo.eventSourceCode === '1'">
          <el-form-item label="原始分类">
            {{ caseInfo.class1 }} - {{ caseInfo.class2 }} - {{ caseInfo.class3 }} -
            {{ caseInfo.class4 }}
          </el-form-item>
        </el-col>
        <el-form-item label="发生地址" v-if="caseInfo.eventSourceCode !== '0'">
          <el-input v-model="caseInfo.sourceAddress" disabled />
        </el-form-item>
        <el-row class="addressWrapper">
          <el-col :span="18">
            <el-form-item
              :label="caseInfo.eventSourceCode !== '0' ? '定位地址' : '发生地址'"
              prop="address"
            >
              <el-input v-model="caseInfo.address">
                <template #append>
                  <el-icon @click="toLocation"><LocationInformation /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <div class="mapMessage noremLeft">{{ mapMessage }}</div>
          </el-col>
          <el-col :span="6">
            <el-form-item label="关联单号" prop="externalNumber">
              <el-input
                v-model="caseInfo.externalNumber"
                @input="emit('getExternalNumber', $event)"
              >
                <template #append v-if="isCD">
                  <el-button @click="toImport">导入</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="caseInfo.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-row>
    </el-form>
    <div class="caseMarkWrapper">
      <CaseMark :caseMark="caseMark"></CaseMark>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  reactive,
  nextTick,
  watchEffect,
  getCurrentInstance,
  onUnmounted,
  computed,
} from "vue";
import dayjs from "dayjs";
import { cloneDeep } from "lodash-es";
import { useRoute } from "vue-router";
import { useCode } from "@/hooks/useCode";
import type { FormRules } from "element-plus";
import { ElForm, ElMessage } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { AddressCallback } from "@/hooks/useMap";
import { useMarkIcon } from "@/hooks/useMarkIcon";
import { useNodeCode } from "@/hooks/useNodeCode";
import { useTransform } from "@/hooks/useTransform";
import { CodeTreeModel } from "@/api/model/codeModel";
import { useDepartment } from "@/hooks/useDepartment";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import { LocationInformation } from "@element-plus/icons-vue";
import CaseIcon from "@/businessComponent/CaseIcon/CaseIcon.vue";
import CaseMark from "@/businessComponent/CaseMark/CaseMark.vue";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { Icon, MarkIcon } from "@/businessComponent/CaseIcon/type";
import { FileAttachmentModel } from "@/api/model/fileAttachmentModel";
import { SpecialTipsModel, CaseFormModel } from "@/api/model/caseModel";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { CaseService as CaseServiceXF } from "@/api/service/WorkTicket/CaseServiceXF";

const sourceCodeMap = {
  "110": {
    firstParam: "14",
    secondParam: "work",
  },
  "111": {
    firstParam: "14",
    secondParam: "work",
  },
  "112": {
    firstParam: "14",
    secondParam: "work",
  },
};

const props = defineProps<{
  taskId?: string;
  isDetail: boolean;
}>();
const emit = defineEmits([
  "saveVoiceFile",
  "isShowPersonalForm",
  "getValue",
  "sourceChange",
  "getAcceptDeptCode",
  "isCD",
  "getExternalNumber",
]);
const icons = ref<Icon[]>([]);
const caseMark = ref<MarkIcon[]>([]);
const specialTips = ref<string[]>([]);
const filterSpecialTips = ref<string[]>([]);
let hotlineCaseInfo = reactive<any>({});
const caseService = new CaseService();
const caseServiceXF = new CaseServiceXF();
const { jumpToOldDetail } = useCaseDetail();
const { transformToHex } = useTransform();
const route = useRoute();
const {
  urgentTypes,
  districtTypes,
  fromTypes,
  specialTypes,
  ticketTypes,
  urbanTypes,
  businessTypes,
  hotlineTypes,
  gridTypes,
  getEventSource,
} = useCode();
const { nodeCode } = useNodeCode();
const mapMessage = ref("");
const isCD = computed(() => {
  return caseInfo.reflectSourceCode === "CD01" || caseInfo.reflectSourceCode === "CD02";
});
if (props.taskId) {
  const { markIcons } = useMarkIcon(props.taskId);
  icons.value = markIcons.icons;
  caseMark.value = markIcons.caseMark;
}
const classSelect = ref();
const userPhone = computed(() => {
  return caseInfo.contactPhone || caseInfo.reportPhone;
});
const sourceTypes = ref<CodeTreeModel[]>([]);
const {
  name,
  currentDepartmentCode,
  currentDepartmentCodeName,
  currentDepartmentLevel,
} = useDepartment();
const validatePass = (rule: any, value: any, callback: any) => {
  nextTick(() => {
    if (caseInfo.reflectIndustryCode === "") {
      callback(new Error("事项类别不能为空!"));
    } else {
      callback();
    }
  });
};
const rules = reactive<FormRules>({
  emergency: [{ required: true, message: "紧急程度不能为空", trigger: "change" }],
  reportPerson: [
    { required: true, message: "反映人不能为空", trigger: ["blur", "change"] },
  ],
  reflectSourceCode: [{ required: true, message: "反映来源不能为空", trigger: "change" }],
  district: [{ required: true, message: "反映区名不能为空", trigger: "change" }],
  reflectClassCode: [{ required: true, message: "反映类别不能为空", trigger: "change" }],
  reflectContentCode: [
    { required: true, message: "反映内容不能为空", trigger: "change" },
  ],
  address: [
    {
      required: true,
      trigger: ["blur", "change"],
      message: "发生地址不能为空",
    },
  ],
  reflectIndustryCode: [
    {
      required: true,
      message: "事项类别不能为空",
      trigger: "change",
      validator: validatePass,
    },
  ],
  description: [
    { required: true, message: "问题描述不能为空", trigger: ["blur", "change"] },
  ],
  businessType: [{ required: true, message: "业务类型不能为空", trigger: "change" }],
});
const defaultClass = ref<string[]>([]);
const sourceTypeByDeptCode = ref<CodeTreeModel[]>([]);
const { proxy } = <any>getCurrentInstance()!;
const reportForm = ref<InstanceType<typeof ElForm>>();
const caseInfo = reactive<CaseFormModel>({
  taskId: 0,
  eventSourceCode: "0",
  eventSource: "12319",
  repeatCount: 0,
  emergency: "1",
  reportTime: dayjs().format("YYYY-MM-DD HH:mm"),
  reportPerson: "",
  repeatTaskId: "",
  address: "",
  reportPhone: "",
  district: "",
  reflectSourceCode: "",
  caseType: "0",
  reflectIndustryCode: "",
  reflectIndustry: "",
  reflectClassCode: 0,
  reflectClass: "",
  reflectContentCode: 0,
  reflectContent: "",
  description: "",
  contactPhone: "",
  isNM: "",
  businessType: "",
  reportDepartmentCode: currentDepartmentCode,
  class1: "",
  class2: "",
  class3: "",
  class4: "",
  id: "",
  externalNumber: "",
  lon: "",
  lat: "",
  locationAddress: "",
  locationDistrict: "",
  locationStreet: "",
  locationRoad: "",
  sort: "",
  status: "",
  tdjzTime: "",
  yqjzTime: "",
  sourceAddress: "",
});
if (
  route.query.voiceId &&
  route.query.voiceId !== "" &&
  route.query.phone &&
  route.query.phone !== ""
) {
  // 插入一条附件记录
  caseInfo.reportPhone = caseInfo.contactPhone = route.query.phone as string;
  nextTick(async () => {
    const file: FileAttachmentModel = {
      type: "voice",
      nodeCode: nodeCode,
      fileName: "录音文件",
      taskId: "",
      url: "",
      fileId: (await transformToHex(route.query.voiceId as string)) as string,
      departmentCode: currentDepartmentCode,
      departmentName: currentDepartmentCodeName,
      fileSize: 0,
      userName: name,
      fileNewName: "",
      fileIndex: 1,
      fileShowName: "录音文件_1",
    };
    emit("saveVoiceFile", file);
  });
}

const setDefaultValue = async () => {
  if (route.query.caseType) {
    caseInfo.caseType = route.query.caseType as string;
    caseInfo.reflectSourceCode = route.query.sourceCode as string;
    caseInfo.businessType = "";
    emit(
      "sourceChange",
      sourceCodeMap[caseInfo.reflectSourceCode as keyof typeof sourceCodeMap]
    );
  } else {
    sourceTypeByDeptCode.value = [];
    const codes = await getEventSource(currentDepartmentCode);
    codes.forEach((code) => {
      sourceTypeByDeptCode.value.push({
        codeParent: code.parentCode,
        codeType: code.typeCode,
        status: code.status!,
        firstParam: code.firstParam,
        secondParam: code.secondParam,
        thirdParam: code.thirdParam,
        codeName: code.name,
        codeValue: code.code,
        fourthParam: code.fourthParam,
      });
    });

    caseInfo.caseType = "0";
    caseInfo.reflectSourceCode = "";
  }
};
setDefaultValue();
const sourceChange = (value: string) => {
  if (value === "CD01" || value === "CD02") {
    rules.externalNumber = [
      { required: true, message: "关联单号不能为空", trigger: "change" },
    ];
  } else {
    rules.externalNumber = [
      { required: false, message: "关联单号不能为空", trigger: "change" },
    ];
  }
  emit("isCD", isCD.value);
};
const toQueryListByNum = () => {
  const externalNumber = caseInfo.externalNumber!.trim();
  emit("getExternalNumber", externalNumber);
  caseServiceXF.getTaskInfo(externalNumber).then((res) => {
    if (res.code === 200) {
      if (res.data) {
        const data = res.data;
        caseInfo.emergency = data.emergency;
        caseInfo.reportPerson = data.reportPerson;
        caseInfo.district = data.district;
        specialTips.value = data.specialCode !== "" ? data.specialCode.split(",") : "";
        caseInfo.caseType = data.caseType;
        caseInfo.businessType = data.businessType;
        caseInfo.isNM = data.isNM;
        caseInfo.repeatCount = data.repeatCount;
        caseInfo.repeatTaskId = data.repeatTaskId;
        caseInfo.reflectIndustryCode = data.reflectIndustryCode;
        caseInfo.reflectClassCode = data.reflectClassCode;
        caseInfo.reflectContentCode = data.reflectContentCode;
        caseInfo.contactPhone = data.contactPhone;
        defaultClass.value = [
          data.reflectIndustryCode + "",
          data.reflectClassCode + "",
          data.reflectContentCode + "",
        ];

        if (defaultClass.value.every((t) => t !== "")) {
          reportForm.value!.clearValidate("reflectIndustryCode");
        }
        caseInfo.address = data.address;
        caseInfo.description = data.description;
        emit("getAcceptDeptCode", res.data.acceptDepartment);
      } else {
        ElMessage.error("未查询到相关工单");
      }
    } else {
      ElMessage.error("未查询到相关工单");
    }
  });
};
const toImport = () => {
  if (caseInfo.externalNumber !== "") {
    toQueryListByNum();
  } else {
    ElMessage.error("关联单号不能为空");
  }
};
const valChange = (value: string) => {
  caseInfo.repeatCount = Number(value.replace(/\D/g, ""));
};
const phoneChange = (value: string) => {
  if (value === "") {
    caseInfo.contactPhone = "";
  } else {
    caseInfo.contactPhone = Number(value.replace(/\D/g, ""));
  }
};
const getTaskInfo = () => {
  caseService.getTaskInfo(props.taskId!).then((res) => {
    if (res.code === 200) {
      hotlineCaseInfo = res.data;
      Object.keys(caseInfo).forEach((key) => {
        caseInfo[key] = res.data[key];
      });
      if (res.data.eventSourceCode === "1") {
        // 12345
        sourceTypes.value = hotlineTypes.value;
      } else if (res.data.eventSourceCode === "2") {
        // 网格
        sourceTypes.value = gridTypes.value;
      }
      filterSpecialTips.value = specialTips.value =
        res.data.specialCode === "" ? "" : res.data.specialCode?.split(",");
      emit("getValue", [
        res.data.reflectIndustryCode,
        res.data.reflectClassCode,
        res.data.reportPhone,
        res.data.contactPhone,
        res.data.reportPerson,
        res.data.eventSourceCode,
        res.data.acceptDepartment,
        res.data.taskId,
      ]);
    }
  });
};
const setMapInfo = (res: AddressCallback) => {
  if (res.code === 200) {
    mapMessage.value =
      res.resultMessage +
      "坐标X:" +
      res.result?.lon +
      " 坐标Y:" +
      res.result?.lat +
      " 地址:" +
      res.result!.locationAddress;
    caseInfo.locationAddress = res.result?.locationAddress;
    caseInfo.locationDistrict = res.result?.locationDistrict;
    caseInfo.locationRoad = res.result?.locationRoad;
    caseInfo.locationStreet = res.result?.locationStreet;
    caseInfo.lon = res.result?.lon;
    caseInfo.lat = res.result?.lat;
    caseInfo.address = caseInfo.locationAddress;
    if (caseInfo.locationDistrict !== "上海市") {
      const { codeValue } = districtTypes.value.find(
        ({ codeName }) => codeName === caseInfo.locationDistrict
      )!;
      caseInfo.district = codeValue;
    }
  } else {
    mapMessage.value = res.resultMessage;
  }
};
onUnmounted(() => {
  proxy.mittBus.off("mapClick");
});
proxy.mittBus.on("mapClick", (res: AddressCallback) => {
  setMapInfo(res);
});
const getCheckedValue = ({ checkedValue, secondParams }: EmitProps) => {
  const [firstClass, secondClass] = checkedValue;
  caseInfo.reflectIndustryCode = firstClass;
  caseInfo.reflectClassCode = secondClass;
  if (checkedValue[2]) {
    caseInfo.reflectContentCode = checkedValue[2];
  }
};
const toLocation = () => {
  if (caseInfo.address === "") {
    ElMessage.error("地址不能为空.");
    return;
  }
  reportForm.value!.clearValidate("address");
  proxy.mittBus.emit("tabClick");
  proxy.mittBus.emit("toLocation", caseInfo.address);
  /*  mapMessage.value = "地址信息解析中,请稍后";
  getAreaInfoByAddress(caseInfo.address).then((data) => {
    setMapInfo(data);
  }); */
};
if (props.isDetail) {
  getTaskInfo();
}

const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    reportForm.value!.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const clearForm = () => {
  caseInfo.taskId = 0;
  caseInfo.eventSourceCode = "0";
  caseInfo.eventSource = "12319";
  caseInfo.repeatCount = 0;
  caseInfo.emergency = "1";
  caseInfo.reportTime = dayjs().format("YYYY-MM-DD HH:mm");
  caseInfo.reportPerson = "";
  caseInfo.repeatTaskId = "";
  caseInfo.address = "";
  caseInfo.reportPhone = "";
  caseInfo.district = "";
  caseInfo.reflectIndustryCode = "";
  caseInfo.reflectIndustry = "";
  caseInfo.reflectClassCode = 0;
  caseInfo.reflectClass = "";
  caseInfo.reflectContentCode = 0;
  caseInfo.reflectContent = "";
  caseInfo.description = "";
  caseInfo.contactPhone = "";
  caseInfo.isNM = "";
  caseInfo.externalNumber = "";
  mapMessage.value = "";
  caseInfo.businessType = "";
  caseInfo.reportDepartmentCode = currentDepartmentCode;
  specialTips.value = [];
  rules.externalNumber = [
    { required: false, message: "关联单号不能为空", trigger: "change" },
  ];
  setDefaultValue();
  classSelect.value.resetValue();
  nextTick(() => {
    reportForm.value!.resetFields();
  });
};
const getSpecialTips = () => {
  if (specialTips.value.length === 0) {
    return [];
  }
  const tips = cloneDeep(specialTypes.value);
  const filterTips: SpecialTipsModel[] = tips
    .filter((tip) => specialTips.value.some((special) => special === tip.codeValue))
    .map((special) => {
      return {
        specialCode: Number(special.codeValue),
        specialName: special.codeName,
        taskId: 0,
      };
    });
  return filterTips.filter(
    ({ specialCode }) => !filterSpecialTips.value.includes(String(specialCode))
  );
};
watchEffect(() => {
  if (urbanTypes) {
    sourceTypes.value = urbanTypes.value;
  }
});
defineExpose({
  getFormData() {
    return caseInfo;
  },
  checkForm,
  getSpecialTips,
  clearForm,
  getCaseInfo() {
    return hotlineCaseInfo;
  },
});
</script>

<style lang="scss" scoped>
.from {
  position: relative;
  height: 100%;
  ::v-deep(.el-select) {
    width: 100%;
  }
  .processWrapper {
    padding: 10px;
  }
  .caseMarks {
    position: absolute;
    z-index: 2;
    top: -45px;
    left: 50%;
    transform: translateX(-50%);
  }

  ::v-deep(.el-link) {
    .el-link__inner {
      display: inline-block;
      width: 100%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  .addressWrapper {
    position: relative;
    width: 100%;
    .mapMessage {
      position: absolute;
      bottom: 0;
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-12,
        var(--sh3h-locationAddress-color)
      );
      font-weight: bold;
      &.noremLeft {
        left: 110px;
      }
    }
  }
}
.baseCaseFormContent {
  position: relative;
  .caseMarkWrapper {
    display: flex;
    position: absolute;
    top: 49%;
    right: 30px;
    width: auto;
  }
}
</style>
