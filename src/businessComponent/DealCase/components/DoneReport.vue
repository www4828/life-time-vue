<template>
  <el-form
    :model="caseDisposeReportDto"
    class="from"
    ref="caseDisposeReportRef"
    :rules="disReportRules"
    label-width="120px"
  >
    <el-row>
      <el-col :span="6">
        <el-form-item label="事实认定" prop="factFinding">
          <el-select
            v-model="caseDisposeReportDto.factFinding"
            filterable
            placeholder="请选择"
            @change="factFindChange"
          >
            <el-option
              v-for="item in factFinding"
              :label="item.name"
              :value="item.code"
            />
              <!-- v-if="!props.isReasonable" -->
            <!-- <el-option
              v-for="item in factTypes"
              v-else
              :label="item.codeName"
              :value="item.codeValue"
            /> -->
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6" v-if="isViews">
        <el-form-item label="诉求认定" prop="appealFinding">
          <el-select
            v-model="caseDisposeReportDto.appealFinding"
            placeholder="请选择"
            @change="appealChange"
          >
            <el-option
              v-for="item in appealTypes"
              :label="item.codeName"
              :value="item.codeValue"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="落款单位" prop="signedUnit">
          <el-input v-model="caseDisposeReportDto.signedUnit"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6" v-if="isViews">
        <el-form-item label="现场查看" prop="isXcck">
          <el-select
            v-model="caseDisposeReportDto.isXcck"
            @change="xcckChange"
            placeholder="请选择"
            filterable
          >
            <el-option
              v-for="item in liveTypes"
              :label="item.codeName"
              :value="item.codeValue"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="事实认定说明" prop="factExplain">
      <el-input
        v-model="caseDisposeReportDto.factExplain"
        type="textarea"
        maxlength="500"
        show-word-limit
        :autosize="{ minRows: 2, maxRows: 4 }"
      ></el-input>
    </el-form-item>
    <el-form-item label="诉求认定说明" prop="appealExplain" v-if="isViews">
      <el-input
        v-model="caseDisposeReportDto.appealExplain"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        maxlength="500"
        show-word-limit
      ></el-input>
    </el-form-item>
    <el-row>
      <el-col :span="6">
        <el-form-item label="市民是否满意" prop="isSmmy">
          <el-select
            v-model="caseDisposeReportDto.isSmmy"
            placeholder="请选择"
            @change="smmyChange"
            filterable
          >
            <el-option
              v-for="item in satisfiedTypes"
              :label="item.codeName"
              :value="item.codeValue"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="答复方式" prop="replyType">
          <el-select
            v-model="caseDisposeReportDto.replyType"
            placeholder="请选择"
            @change="replyTypeChange"
            filterable
          >
            <el-option
              v-for="item in replyTypes"
              :label="item.codeName"
              :value="item.codeValue"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="答复时间" prop="replyTime">
          <el-date-picker
            v-model="caseDisposeReportDto.replyTime"
            type="datetime"
            :editable="false"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="现场查看时间" prop="xcckTime">
          <el-date-picker
            v-model="caseDisposeReportDto.xcckTime"
            type="datetime"
            :editable="false"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="答复市民要点" prop="replyPoint">
      <el-input
        v-model="caseDisposeReportDto.replyPoint"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        maxlength="500"
        show-word-limit
      ></el-input>
    </el-form-item>
    <el-form-item label="市民反馈说明">
      <el-input
        v-model="caseDisposeReportDto.feedback"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        maxlength="500"
        show-word-limit
      ></el-input>
    </el-form-item>
    <el-row v-if="isLevel2">
      <el-col :span="6">
        <el-form-item label="2级经办人" prop="secondaryAgent">
          <el-input v-model="caseDisposeReportDto.secondaryAgent"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="2级负责人">
          <el-input v-model="caseDisposeReportDto.secondaryPrincipal"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="2级部门名称" prop="secondaryDepartment">
          <el-input v-model="caseDisposeReportDto.secondaryDepartment"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="2级部门电话" prop="secondaryPhone">
          <el-input
            v-model="caseDisposeReportDto.secondaryPhone"
            max-length="30"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import { ref, reactive, getCurrentInstance, computed, nextTick, watch } from "vue";
import { useCode } from "@/hooks/useCode";
import { FormRules } from "element-plus";
import type { FormInstance } from "element-plus";
import { CodeModel } from "@/api/model/codeModel";
import { useDepartment } from "@/hooks/useDepartment";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { CodeService } from "@/api/service/System/CodeService";
import { DisposeService } from "@/api/service/Dispose/DisposeService";

const props = defineProps<{
  taskId: string;
  isCheckOrApprove?: boolean;
  caseInfo: CaseInfoModel;
  isReasonable: boolean;
  businessType?: string
}>();
const FACT_FILTER = ["1", "2", "12", "13", "21", "22"];
const VIEWS = ["4", "5"];
const isViews = ref(false);
const factFinding = ref<CodeModel[]>([]);
const { proxy } = <any>getCurrentInstance();
const caseDisposeReportRef = ref<FormInstance>();
const isFH = ref(false);
const {
  appealTypes,
  satisfiedTypes,
  replyTypes,
  liveTypes,
  sourceTypes,
  factTypes,
} = useCode();
const { currentDepartmentLevel, name, currentDepartmentCodeName } = useDepartment();
const disReportRules = reactive<FormRules>({
  factFinding: [{ required: true, message: "事实认定不能为空", trigger: "change" }],
  appealFinding: [{ required: false, message: "诉求认定不能为空", trigger: "change" }],
  signedUnit: [{ required: true, message: "落款单位不能为空", trigger: "change" }],
  factExplain: [
    { required: false, message: "事实认定说明不能为空", trigger: ["blur", "change"] },
  ],
  appealExplain: [
    { required: false, message: "诉求认定说明不能为空", trigger: ["blur", "change"] },
  ],
  isSmmy: [{ required: true, message: "市民是否满意不能为空", trigger: "change" }],
  replyType: [{ required: true, message: "市答复方式不能为空", trigger: "change" }],
  replyTime: [{ required: true, message: "答复时间不能为空", trigger: "change" }],
  isXcck: [{ required: false, message: "现场查看不能为空", trigger: ["blur", "change"] }],
  replyPoint: [
    { required: true, message: "联系市民要点不能为空", trigger: ["blur", "change"] },
  ],
});
const codeService = new CodeService();
const disposeService = new DisposeService();
const isLevel2 = computed(() => {
  return currentDepartmentLevel === "2";
});
const caseDisposeReportDto = reactive<{ [index: string]: string }>({
  recordId: "",
  id: "",
  taskId: "",
  factFinding: "",
  factFindingName: "",
  appealFinding: "",
  appealFindingName: "",
  signedUnit: "",
  factExplain: "",
  appealExplain: "",
  isSmmy: "",
  isSmmyName: "",
  replyType: "",
  replyTypeName: "",
  replyTime: "",
  isXcck: "",
  isXcckName: "",
  xcckTime: "",
  replyPoint: "",
  feedback: "",
  secondaryAgent: "",
  secondaryPrincipal: "",
  secondaryDepartment: "",
  secondaryPhone: "",
  status: "",
});
const clearValidate = () => {
  nextTick(() => {
    setTimeout(() => {
      caseDisposeReportRef.value!.clearValidate();
    }, 0);
  });
};
if (isLevel2.value) {
  caseDisposeReportDto.secondaryAgent = name;
  caseDisposeReportDto.secondaryDepartment = currentDepartmentCodeName;
  disReportRules.secondaryAgent = [
    { required: true, message: "2级经办人不能为空", trigger: "blur" },
  ];
  disReportRules.secondaryDepartment = [
    { required: true, message: "2级部门名称不能为空", trigger: "blur" },
  ];
  clearValidate();
}
const factExplain = (value: string) => {
  if (FACT_FILTER.includes(value)) {
    disReportRules.factExplain = [
      { required: true, message: "事实认定说明不能为空", trigger: ["blur", "change"] },
    ];
  } else {
    disReportRules.factExplain = [
      { required: false, message: "事实认定说明不能为空", trigger: ["blur", "change"] },
    ];
  }
  clearValidate();
};
const factFindChange = (value: string) => {
  const { name } = factFinding.value.find(({ code }) => code === value)!;
  factExplain(value);
  caseDisposeReportDto.factFindingName = name;
};
const appealExplain = (value: string) => {
  if (value === "0") {
    disReportRules.appealExplain = [
      { required: false, message: "诉求认定说明不能为空", trigger: "change" },
    ];
  } else {
    disReportRules.appealExplain = [
      { required: true, message: "诉求认定说明不能为空", trigger: "change" },
    ];
  }
  clearValidate();
};
const appealChange = (value: string) => {
  const { codeName } = appealTypes.value.find(({ codeValue }) => codeValue === value)!;
  appealExplain(value);
  caseDisposeReportDto.appealFindingName = codeName;
};
const xcckChange = (value: string) => {
  const { codeName } = liveTypes.value.find(({ codeValue }) => codeValue === value)!;
  caseDisposeReportDto.isXcckName = codeName;
};
const smmyChange = (value: string) => {
  const { codeName } = satisfiedTypes.value.find(({ codeValue }) => codeValue === value)!;
  caseDisposeReportDto.isSmmyName = codeName;
};
const replyTypeChange = (value: string) => {
  const { codeName } = replyTypes.value.find(({ codeValue }) => codeValue === value)!;
  caseDisposeReportDto.replyTypeName = codeName;
};

const init = () => {
  console.log(
    'init',
    props.caseInfo.caseType,
    props.caseInfo.businessType,
    props.businessType
  );
  isFH.value = props.caseInfo.caseType === "2";
  if (props.isReasonable) {
    isViews.value = true;
  } else {
    isViews.value = !VIEWS.includes(props.caseInfo.businessType);
  }

  proxy.mittBus.emit("getStatus", isViews.value);
  if (isViews.value) {
    // 非咨询类或者意见类
    disReportRules.appealFinding = [
      { required: true, message: "诉求认定不能为空", trigger: "change" },
    ];
    disReportRules.isXcck = [
      { required: true, message: "现场查看不能为空", trigger: ["blur", "change"] },
    ];
    disReportRules.appealExplain = [
      { required: true, message: "诉求认定说明不能为空", trigger: ["blur", "change"] },
    ];
    clearValidate();
  }
  if (isFH.value) {
    // 复核单
    disReportRules.secondaryPhone = [
      { required: true, message: "2级部门电话不能为空", trigger: "blur" },
    ];
    disReportRules.xcckTime = [
      { required: true, message: "现场查看时间不能为空", trigger: "blur" },
    ];
  }
  // if (!props.isReasonable) {
  // }
  const secondParam = sourceTypes.value.find(
    ({ codeValue }) => codeValue === String(props.businessType)
  )?.secondParam;
  secondParam  && getBusinessType(secondParam);
};

const getBusinessType = (code: string) => {
  codeService.getTimeLimit(code, "13000").then((res) => {
    if (res.code === 200) {
      factFinding.value = res.data;
    }
  });
};
const getDoneReport12345 = (recordId: string) => {
  disposeService.getCaseDisposeDetail(recordId).then((res) => {
    if (res.code === 200) {
      const { caseDisposeReportVo } = res.data;
      if (typeof caseDisposeReportVo !== "string") {
        Object.keys(caseDisposeReportDto).forEach((key) => {
          caseDisposeReportDto[key] = caseDisposeReportVo[key];
        });
      }
      if(props.businessType !== props.caseInfo.businessType){
        caseDisposeReportDto.factFinding = ''
      }
      factExplain(caseDisposeReportVo.factFinding);
      appealExplain(caseDisposeReportVo.appealFinding);
      if (isLevel2.value && props.isCheckOrApprove) {
        caseDisposeReportDto.secondaryPrincipal = name;
      }
    }
  });
};
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    caseDisposeReportRef.value!.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
watch(
  () => props.caseInfo,
  () => {
    if (props.caseInfo.caseType !== "") {
      init();
    }
  },
  {
    deep: true,
  }
);
init();
// watch(
//   () => props.isReasonable,
//   (status) => {
//     if (status) {
//       init();
//     }
//   }
// );
defineExpose({
  checkForm,
  getDoneReport12345,
  empty() {
    Object.keys(caseDisposeReportDto).forEach((key) => {
      caseDisposeReportDto[key] = "";
    });
  },
  getFormData() {
    return { ...caseDisposeReportDto, taskId: props.taskId };
  },
});
</script>

<style lang="scss" scoped></style>
