<template>
  <el-form
    :model="caseDisposeReportDto"
    class="donefrom"
    ref="caseDisposeReportRef"
    :rules="disReportRules"
    :validate-on-rule-change="false"
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
            <el-option v-for="item in factTypes" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6" v-if="isViews || props.caseInfo.xfTaskId">
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
          <el-input v-model.trim="caseDisposeReportDto.signedUnit"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6" v-if="isViews || props.caseInfo.xfTaskId">
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
        v-model.trim="caseDisposeReportDto.factExplain"
        type="textarea"
        maxlength="500"
        show-word-limit
        :autosize="{ minRows: 2, maxRows: 4 }"
        @dblclick="() => props.nodeCode && showDialog()"
      ></el-input>
    </el-form-item>
    <template v-if="props.nodeCode && props.nodeCode[0] && props.nodeCode.length > 0">
      <IdiomDialog
        :node-code="props.nodeCode![0]"
        :show-flag="idiomControl"
        @close-dialog="closeDialog"
        @get-idiom-content="(idContent: string) => caseDisposeReportDto.factExplain = idContent"
        ref="idiomRef"
      />
      <Idiom
        :node-code="props.nodeCode![0]"
        @idiomContentText="(idContent: string) => caseDisposeReportDto.factExplain = idContent"
      />
    </template>
    <el-form-item
      label="诉求认定说明"
      prop="appealExplain"
      v-if="isViews || props.caseInfo.xfTaskId"
    >
      <el-input
        v-model.trim="caseDisposeReportDto.appealExplain"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        maxlength="500"
        show-word-limit
        @dblclick="() => props.nodeCode && showDialogSQRD()"
      ></el-input>
    </el-form-item>
    <template v-if="props.nodeCode && props.nodeCode[1] && props.nodeCode.length > 0">
      <IdiomDialog
        :node-code="props.nodeCode![1]"
        :show-flag="idiomControlSQRD"
        @close-dialog="closeDialogSQRD"
        @get-idiom-content="(idContent: string) => caseDisposeReportDto.appealExplain = idContent"
        ref="idiomRefSQRD"
      />
      <Idiom
        :node-code="props.nodeCode![1]"
        @idiomContentText="(idContent: string) => caseDisposeReportDto.appealExplain = idContent"
      />
    </template>

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
        @dblclick="() => props.nodeCode && showDialogDFSM()"
        v-model.trim="caseDisposeReportDto.replyPoint"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        maxlength="500"
        show-word-limit
      ></el-input>
    </el-form-item>
    <template v-if="props.nodeCode && props.nodeCode[2] && props.nodeCode.length > 0">
      <IdiomDialog
        :node-code="props.nodeCode![2]"
        :show-flag="idiomControlDFSM"
        @close-dialog="closeDialogDFSM"
        @get-idiom-content="(idContent: string) => caseDisposeReportDto.replyPoint = idContent"
        ref="idiomRefDFSM"
      />
      <Idiom
        :node-code="props.nodeCode![2]"
        @idiomContentText="(idContent: string) => caseDisposeReportDto.replyPoint = idContent"
      />
    </template>
    <el-form-item label="市民反馈说明">
      <el-input
        v-model.trim="caseDisposeReportDto.feedback"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        maxlength="500"
        show-word-limit
        @dblclick="() => props.nodeCode && showDialogSMFK()"
      ></el-input>
    </el-form-item>
    <template v-if="props.nodeCode && props.nodeCode[3] && props.nodeCode.length > 0">
      <IdiomDialog
        :node-code="props.nodeCode![3]"
        :show-flag="idiomControlSMFK"
        @close-dialog="closeDialogSMFK"
        @get-idiom-content="(idContent: string) => caseDisposeReportDto.feedback = idContent"
        ref="idiomRefSMFK"
      />
      <Idiom
        :node-code="props.nodeCode![3]"
        @idiomContentText="(idContent: string) => caseDisposeReportDto.feedback = idContent"
      />
    </template>
    <el-row v-if="isLevel2">
      <el-col :span="6">
        <el-form-item label="2级经办人" prop="secondaryAgent">
          <el-input v-model.trim="caseDisposeReportDto.secondaryAgent"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="2级负责人">
          <el-input v-model.trim="caseDisposeReportDto.secondaryPrincipal"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="2级部门名称" prop="secondaryDepartment">
          <el-input v-model.trim="caseDisposeReportDto.secondaryDepartment"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="2级部门电话" prop="secondaryPhone">
          <el-input
            v-model.trim="caseDisposeReportDto.secondaryPhone"
            max-length="30"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import {
  ref,
  reactive,
  onBeforeUnmount,
  getCurrentInstance,
  computed,
  nextTick,
  watchEffect,
} from "vue";
import { Session } from "@/utils/storage";
import { useCode } from "@/hooks/useCode";
import { FormRules } from "element-plus";
import { useIdiom } from "@/hooks/useIdiom";
import type { FormInstance } from "element-plus";
import { CodeModel } from "@/api/model/codeModel";
import { useDepartment } from "@/hooks/useDepartment";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { CodeService } from "@/api/service/System/CodeService";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";

type FormRules = /*unresolved*/ any
type FormInstance = /*unresolved*/ any
const props = defineProps<{
  taskId: string;
  isCheckOrApprove?: boolean;
  caseInfo: CaseInfoModel;
  isCurrentUser?: boolean;
  display?: boolean;
  nodeCode?: Array<NodeCodeKey | undefined>;
}>();
const FACT_FILTER = ["1", "2", "12", "13", "21", "22"];
const VIEWS = ["4", "5"];
const isViews = ref(false);
const factTypes = ref<CodeModel[]>([]);
const { proxy } = <any>getCurrentInstance();
const caseDisposeReportRef = ref<FormInstance>();
const isFH = ref(false);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const {
  idiomControl: idiomControlSQRD,
  closeDialog: closeDialogSQRD,
  idiomRef: idiomRefSQRD,
  showDialog: showDialogSQRD,
} = useIdiom();
const {
  idiomControl: idiomControlDFSM,
  closeDialog: closeDialogDFSM,
  idiomRef: idiomRefDFSM,
  showDialog: showDialogDFSM,
} = useIdiom();
const {
  idiomControl: idiomControlSMFK,
  closeDialog: closeDialogSMFK,
  idiomRef: idiomRefSMFK,
  showDialog: showDialogSMFK,
} = useIdiom();
const { appealTypes, satisfiedTypes, replyTypes, liveTypes, sourceTypes } = useCode();
const {
  currentDepartmentLevel,
  name,
  currentDepartmentCodeName,
  currentDepartmentCode,
} = useDepartment();
let disReportRules = reactive<FormRules>({
  factFinding: [{ required: true, message: "事实认定不能为空", trigger: "change" }],
  appealFinding: [{ required: false, message: "诉求认定不能为空", trigger: "change" }],
  signedUnit: [{ required: true, message: "落款单位不能为空", trigger: "change" }],
  factExplain: [
    {
      required: false,
      message: "事实认定说明不能为空",
      trigger: ["blur", "change"],
    },
  ],
  appealExplain: [
    {
      required: false,
      message: "诉求认定说明不能为空",
      trigger: ["blur", "change"],
    },
  ],
  isSmmy: [{ required: true, message: "市民是否满意不能为空", trigger: "change" }],
  replyType: [{ required: true, message: "市答复方式不能为空", trigger: "change" }],
  replyTime: [{ required: true, message: "答复时间不能为空", trigger: "change" }],
  isXcck: [
    {
      required: false,
      message: "现场查看不能为空",
      trigger: ["blur", "change"],
    },
  ],
  replyPoint: [
    {
      required: true,
      message: "联系市民要点不能为空",
      trigger: ["blur", "change"],
    },
  ],
});
const codeService = new CodeService();
const disposeService = new DisposeService();
const upLevel2 = computed(() => {
  return Number(currentDepartmentLevel) > 3;
});
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
  signedUnit: upLevel2.value ? "" : currentDepartmentCodeName,
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

if (isLevel2.value) {
  caseDisposeReportDto.secondaryAgent = name;
  caseDisposeReportDto.secondaryDepartment = currentDepartmentCodeName;
  disReportRules.secondaryAgent = [
    { required: true, message: "2级经办人不能为空", trigger: "blur" },
  ];
  disReportRules.secondaryDepartment = [
    { required: true, message: "2级部门名称不能为空", trigger: "blur" },
  ];
}
const factExplain = (value: string) => {
  if (FACT_FILTER.includes(value)) {
    disReportRules.factExplain = [
      {
        required: true,
        message: "事实认定说明不能为空",
        trigger: ["blur", "change"],
      },
    ];
  } else {
    disReportRules.factExplain = [
      {
        required: false,
        message: "事实认定说明不能为空",
        trigger: ["blur", "change"],
      },
    ];
  }
};
const factFindChange = (value: string) => {
  const { name } = factTypes.value.find(({ code }) => code === value)!;
  factExplain(value);
  caseDisposeReportDto.factFindingName = name;
};
const appealExplain = (value: string) => {
  console.log(value);
  
  if (value === "0" || !value) {
    disReportRules.appealExplain = [
      { required: false, message: "诉求认定说明不能为空", trigger: "change" },
    ];
  } else {
    disReportRules.appealExplain = [
      { required: true, message: "诉求认定说明不能为空", trigger: "change" },
    ];
  }
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
const init = ({ secondParam, caseType, businessType }: any) => {
  isFH.value = caseType === "2";

  isViews.value = !VIEWS.includes(businessType);
  proxy.mittBus.emit("getStatus", isViews.value);
  if (isViews.value) {
    // 非咨询类或者意见类
    disReportRules.appealFinding = [
      { required: true, message: "诉求认定不能为空", trigger: "change" },
    ];
    disReportRules.isXcck = [
      {
        required: true,
        message: "现场查看不能为空",
        trigger: ["blur", "change"],
      },
    ];
    console.log('init',caseDisposeReportDto.appealFinding);
    
    if(caseDisposeReportDto.appealFinding === '0'){
      disReportRules.appealExplain = [
        {
          required: false,
          message: "诉求认定说明不能为空",
          trigger: ["blur", "change"],
        },
      ];
    }else{
      disReportRules.appealExplain = [
        {
          required: true,
          message: "诉求认定说明不能为空",
          trigger: ["blur", "change"],
        },
      ];
    }
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
  getBusinessType(secondParam);
};
proxy.mittBus.on("getSecondParam", init);
onBeforeUnmount(() => {
  proxy.mittBus.off("getSecondParam");
});
nextTick(() => {
  if (props.caseInfo.businessType) {
    const { secondParam } = sourceTypes.value.find(
      ({ codeValue }) => codeValue === props.caseInfo.businessType
    )!;
    init({
      secondParam,
      caseType: props.caseInfo.caseType,
      businessType: props.caseInfo.businessType,
    });
  }
});
const getBusinessType = (code: string) => {
  codeService.getTimeLimit(code, "13000").then((res) => {
    if (res.code === 200) {
      factTypes.value = res.data;
    }
  });
};
const getDepartmentList = () => {
  disposeService.getDepartmentList(currentDepartmentCode).then((res) => {
    if (res.code === 200) {
      caseDisposeReportDto.signedUnit = res.data.departmentName;
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
      factExplain(caseDisposeReportVo.factFinding);
      appealExplain(caseDisposeReportVo.appealFinding);
      if (isLevel2.value && props.isCheckOrApprove) {
        caseDisposeReportDto.secondaryPrincipal = name;
      }
      if (
        isLevel2.value &&
        caseDisposeReportDto.secondaryAgent === "" &&
        caseDisposeReportDto.secondaryDepartment === ""
      ) {
        caseDisposeReportDto.secondaryAgent = name;
        caseDisposeReportDto.secondaryDepartment = currentDepartmentCodeName;
      }
      if (upLevel2.value && caseDisposeReportDto.signedUnit === "") {
        getDepartmentList();
      }
    }
  });
};
const getDoneReportList = () => {
  let searchParams: any = [
    {
      key: "taskId",
      match: "eq",
      value: props.taskId,
    },
    {
      key: "createTime",
      match: "orderByDesc",
      value: "createTime",
    },
  ];
  if (props.isCurrentUser) {
    const { username } = Session.get("userInfo");
    searchParams.push({
      key: "createUser",
      match: "eq",
      value: username,
    });
  }
  disposeService
    .getReportList({
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
      },
      searchParams: searchParams,
    })
    .then((res) => {
      if (res.code === 200 && res.data.results?.length > 0) {
        const caseDisposeReportVo = res.data.results[0];
        if (typeof caseDisposeReportVo !== "string") {
          Object.keys(caseDisposeReportDto).forEach((key) => {
            caseDisposeReportDto[key] = caseDisposeReportVo[key];
          });
        }
        factExplain(caseDisposeReportVo.factFinding);
        appealExplain(caseDisposeReportVo.appealFinding);

        if (isLevel2.value && props.isCheckOrApprove) {
          caseDisposeReportDto.secondaryPrincipal = name;
        }
        if (
          isLevel2.value &&
          caseDisposeReportDto.secondaryAgent === "" &&
          caseDisposeReportDto.secondaryDepartment === ""
        ) {
          caseDisposeReportDto.secondaryAgent = name;
          caseDisposeReportDto.secondaryDepartment = currentDepartmentCodeName;
        }
      }
    });
};
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    caseDisposeReportRef.value!.validate((valid:boolean) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const IdiomContent = (idContent: string) => {
  caseDisposeReportDto.replyPoint = idContent;
};

defineExpose({
  checkForm,
  getDoneReport12345,
  getDoneReportList,
  getDepartmentList,
  getFormData() {
    return { ...caseDisposeReportDto, taskId: props.taskId };
  },
  getFactTypes(): CodeModel[] {
    return factTypes.value;
  },
  getAppealTypes() {
    return appealTypes.value;
  },
});
</script>

<style lang="scss" scoped></style>
