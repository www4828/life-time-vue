<template>
  <div class="advanceSearch">
    <el-form :model="form" class="elForm" ref="formRef" label-width="100px">
      <el-form-item label="关&ensp;键&ensp;字">
        <el-select
          v-model="form.key"
          clearable
          @change="valChange($event, '关键字', selectOptions)"
        >
          <el-option
            v-for="option in selectOptions"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="内&ensp;&ensp;&ensp;&ensp;容" v-if="isXFOpt">
        <el-select v-model="form.content" multiple clearable @change="xfChange">
          <el-option
            v-for="option in xfTacheTypes"
            :label="option.codeName"
            :value="option.codeValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="内&ensp;&ensp;&ensp;&ensp;容"
        v-else-if="form.key === 'reportTime'"
      >
        <el-date-picker
          v-model="form.reportTime"
          type="daterange"
          range-separator="至"
          style="width: 100%"
          format="YYYY-MM-DD"
          @change="reportTimeRange"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="内&ensp;&ensp;&ensp;&ensp;容" v-else>
        <el-input v-model="form.content" @input="valChange($event, '内容')" />
      </el-form-item>

      <el-form-item label="事项类别">
        <ClassSelect
          ref="classSelect"
          style="width: 100%"
          :department-code="currentDepartmentCode"
          department-level="1"
          @getCheckedValue="getCheckedValue"
          :showValue="defaultValue"
          @empty="empty"
        ></ClassSelect>
      </el-form-item>
      <el-form-item label="主责部门">
          <DepartTreeSelect
            is-immediate
            :is-multiple="false"
            :params="{
              childNode: false,
              currentNode: false,
              optionList: [],
              removeList: [],
            }"
            ref="executeDepartment"
            @getDepartCode="executeDepartCode"
          />
        </el-form-item>
      <el-form-item label="紧急程度">
        <el-select
          v-model="form.emergency"
          clearable
          @change="valChange($event, '紧急程度', urgentTypes)"
        >
          <el-option
            v-for="type in urgentTypes"
            :label="type.codeName"
            :value="type.codeValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="案件类型">
        <el-checkbox-group v-model="form.type" @change="valChange($event, '案件类型')">
          <el-checkbox label="国办单" />
          <el-checkbox label="复核单" />
          <el-checkbox label="业务单" />
          <el-checkbox label="督办单" />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="业务类型">
        <el-select
          v-model="form.businessType"
          clearable
          @change="valChange($event, '业务类型', businessTypes)"
        >
          <el-option
            v-for="type in businessTypes"
            :label="type.codeName"
            :value="type.codeValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="事件来源">
        <el-select
          v-model="form.eventSourceCode"
          clearable
          @change="valChange($event, '事件来源', fromType)"
        >
          <el-option
            v-for="type in fromType"
            :label="type.codeName"
            :value="type.codeValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排&ensp;&ensp;&ensp;&ensp;序">
        <el-radio-group v-model="form.sort" @change="valChange($event, '排序', 'sort')">
          <el-radio label="orderByAsc">升序</el-radio>
          <el-radio label="orderByDesc">降序</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label=" ">
        <el-radio-group v-model="form.time" @change="valChange($event, '排序', 'time')">
          <el-radio label="deadline">处理截止时间</el-radio>
          <el-radio label="reportTime">接报时间</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div class="btnGroup">
      <el-button type="primary" @click="onSubmit">确定</el-button>
      <el-button @click="clear" type="info">清空</el-button>
      <el-button @click="emit('close')">取消</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { cloneDeep, flow } from "lodash-es";
import { useCode } from "@/hooks/useCode";
import { Session } from "@/utils/storage";
import { options, queryBtn, xfOptions } from "./selectOpt";
import type { FormInstance } from "element-plus";
import { useNodeCode } from "@/hooks/useNodeCode";
import { SearchModel, Match } from "@/api/model/baseModel";
import { useDepartment } from "@/hooks/useDepartment";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import { CodeTreeModel } from "@/api/model/codeModel";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { ref, reactive, getCurrentInstance, computed, nextTick } from "vue";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import { DepartmentModel } from "@/api/model/caseModel";

interface DepartmentCodeInfo {
  id: string;
  val: string | string[];
  nodes: Array<DepartmentModel>
}
const props = withDefaults(
  defineProps<{
    nodeCode: NodeCodeKey;
    isXF?: boolean;
    isMyQuery?: boolean;
  }>(),
  {
    isXF: false,
    isMyQuery: false,
  }
);

const selectOptions = computed(() => {
  if (props.isMyQuery) {
    return [
      ...options,
      // {
      //   label: "接报时间",
      //   value: "reportTime",
      // },
    ];
  }
  return props.isXF
    ? [
        ...xfOptions,
        {
          label: "信访环节",
          value: "flowState",
        },
      ]
    : options;
});
const { businessTypes, fromTypes, urgentTypes, xfTacheTypes } = useCode();
const defaultValue = ref<string[]>([]);
const form = reactive<{ [index: string]: any }>({
  key: "",
  content: "",
  businessType: "",
  reflectIndustryCode: "",
  reflectClassCode: "",
  type: [],
  emergency: "",
  eventSourceCode: "",
  sort: "orderByDesc",
  time: "",
  reportTime: [],
  executeDepartment: ''
});
const isXFOpt = computed(() => {
  return form.key === "flowState";
});
const classSelect = ref();
const executeDepartment = ref();
let advCnForm = reactive<{ [index: string]: any }>({});
const formRef = ref<FormInstance>();
const { getSortByNodeCode } = useNodeCode();
const { proxy } = <any>getCurrentInstance()!;
const defaultQuery = getSortByNodeCode(props.nodeCode);
const emit = defineEmits(["close", "paramsCn", "clearPrams"]);
const searchModel = ref<SearchModel<CaseInfoModel>[]>([]);
const { currentDepartmentCode } = useDepartment();
if (Session.get("advFormData")) {
  const formData = Session.get("advFormData")!;
  Object.keys(form).forEach((key) => {
    form[key] = formData[key] || "";
  });
  if (formData.reflectIndustryCode !== "" && formData.reflectClassCode !== "") {
    nextTick(() => {
      defaultValue.value = [formData.reflectIndustryCode, formData.reflectClassCode];
    });
  }
}
if (Session.get("advCnForm")) {
  const CnForm = Session.get("advCnForm")!;
  Object.keys(CnForm).forEach((key) => {
    advCnForm[key] = CnForm[key];
  });
}
const getName = (str: string) => {
  if (str === "deadline") {
    return "处理截止时间";
  }
  return "接报时间";
};
const valChange = (
  val: string | number | boolean | string[],
  cn: string,
  source?: any
) => {
  if (val === "") {
    delete advCnForm[cn];
    return;
  }
  if (source === "sort") {
    const type = val === "orderByAsc" ? "升序" : "降序";
    advCnForm["排序"] = "默认" + type;
    if (form.time !== "") {
      advCnForm["排序"] = `按${getName(val as string)}${type}`;
    }
  }
  if (!source && typeof val === "string") {
    advCnForm[cn] = val;
  }
  if (source === "time") {
    const type = form.sort === "orderByAsc" ? "升序" : "降序";
    advCnForm["排序"] = `按${getName(val as string)}${type}`;
  }
  if (Array.isArray(val)) {
    advCnForm[cn] = val.join(",");
  }
  if (Array.isArray(source) && source.every(({ label }: any) => label)) {
    const { label } = source.find(({ value }: any) => value === val);
    advCnForm[cn] = label;
  } else if (Array.isArray(source) && source.every(({ codeName }: any) => codeName)) {
    const { codeName } = source.find(({ codeValue }: any) => codeValue === val);
    advCnForm[cn] = codeName;
  }
};
const xfChange = (val: string[]) => {
  if (val.length === 0) {
    delete advCnForm["内容"];
    return;
  }
  let arr: string[] = [];
  val.forEach((key) => {
    const { codeName } = xfTacheTypes.value.find(
      ({ codeValue }: CodeTreeModel) => codeValue === key
    )!;
    arr.push(codeName);
  });
  advCnForm["内容"] = arr.join(",");
};
const reportTimeRange = (val: string[]) => {
  if (!val) {
    delete advCnForm["内容"];
    return;
  }
  const [startTime, endTime] = val;
  advCnForm["内容"] = startTime + "至" + endTime;
};
const empty = () => {
  form.reflectIndustryCode = "";
  form.reflectClassCode = "";
  delete advCnForm["事项类别"];
};
const getCheckedValue = (result: any) => {
  const { checkedValue, labels } = result;
  const [firstClass, secondClass] = checkedValue;
  advCnForm["事项类别"] = labels.join("/");
  form.reflectIndustryCode = firstClass;
  form.reflectClassCode = secondClass;
};
const executeDepartCode = ({ val, nodes }: DepartmentCodeInfo) => {
  advCnForm["主责部门"] = nodes[0].departmentName;
  form.executeDepartment = val as string;
};
const fromType = computed(() => {
  fromTypes.value.forEach((form) => {
    if (form.codeValue === "2") {
      form.codeName = "网格";
    }
  });
  return fromTypes.value;
});
const clear = () => {
  form.key = "";
  form.content = "";
  form.businessType = "";
  form.reflectClassCode = "";
  form.reflectIndustryCode = "";
  form.type = [];
  form.eventSourceCode = "";
  form.emergency = "";
  form.sort = "";
  form.time = "";
  form.executeDepartment = "";
  form.reportTime = [];
  classSelect.value.resetValue();
  executeDepartment.value.resetValue()
  advCnForm = {};
  if (Session.get("advFormData")) {
    emit("clearPrams");
  }
  searchModel.value = getSortByNodeCode(props.nodeCode);
  emit("close");
};
const onSubmit = () => {
  const isMyQueryKey = form.key === "reportTime";
  let defaultParams = cloneDeep(getSortByNodeCode(props.nodeCode));
  let value = form.content;
  let match: Match = "like";
  if (isXFOpt.value) {
    //如果是信访环节
    value = (form.content as string[]).join(",");
    match = "in";
  }
  if (Array.isArray(form.content) && form.content.length === 0) {
    value = "";
    match = "like";
  }
  searchModel.value = [
    {
      key: form.key,
      value,
      match,
    },
  ];
  let sessionLocal: SearchModel<CaseInfoModel>[] = [
    {
      key: form.key,
      value,
      match,
    },
  ];
  if (isMyQueryKey && props.isMyQuery) {
    // 我的案件里的接报时间
    const [startTime, endTime] = form.reportTime;
    const reportTime: SearchModel<CaseInfoModel>[] = [
      {
        key: "reportTime",
        value: startTime + " 00:00:00",
        match: "gt",
      },
      {
        key: "reportTime",
        value: endTime + " 23:59:59",
        match: "lt",
      },
    ];
    searchModel.value = reportTime;
    sessionLocal = reportTime;
  }
  Session.set("advFormData", form);
  const adcSearch = cloneDeep(form);
  delete adcSearch.type;
  delete adcSearch.key;
  delete adcSearch.content;
  delete adcSearch.sort;
  delete adcSearch.time;
  delete adcSearch.reportTime;
  Object.keys(adcSearch).forEach((key) => {
    searchModel.value.push({
      key: key,
      value: form[key],
      match: "eq",
    });
    sessionLocal.push({
      key: key,
      value: form[key],
      match: "eq",
    });
  });
  if (queryBtn.filter(({ name }) => form.type?.includes(name)).length > 0) {
    //需要用or
    const filterQuery = queryBtn.filter(({ name }) => form.type?.includes(name));
    searchModel.value.push({
      key: "caseType",
      value: "",
      match: "in",
    });
    sessionLocal.push({
      key: "caseType",
      value: "",
      match: "in",
    });
    let str = "";
    filterQuery.forEach((other) => {
      str += other.value + ",";
    });
    searchModel.value[searchModel.value.length - 1].value += str.slice(0, str.length - 1);
    sessionLocal[sessionLocal.length - 1].value += str.slice(0, str.length - 1);
  }
  if (form.time && form.time !== "") {
    searchModel.value.unshift({
      key: "",
      value: form.time,
      match: form.sort || "orderByAsc",
    });
    sessionLocal.push({
      key: "",
      value: form.time,
      match: form.sort,
    });
  }
  if (form.time === "" && !isMyQueryKey) {
    searchModel.value.unshift(...defaultParams);
  }
  emit("close");
  Session.set(
    "advSearch",
    sessionLocal.filter(({ value }) => value && value !== "")
  );
  proxy.mittBus.emit(
    "advParams",
    searchModel.value.filter(({ value }) => value && value !== "")
  );
  Session.set("advCnForm", advCnForm);
  emit("paramsCn", advCnForm);
};
defineExpose({
  clear,
});
</script>

<style lang="scss" scoped>
.advanceSearch {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 999;
  width: 450px;
  padding: 20px;
  background-color: var(--sh3h-head-font-color);
  transform: translate(-50%, -50%);
  border-radius: 3px;
  box-shadow: 0 0 10px var(--el-color-info);
  .btnGroup {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
  }
  .elForm {
    ::v-deep(.el-form-item) {
      label {
        margin-right: 10px;
      }
    }
  }
}
</style>
