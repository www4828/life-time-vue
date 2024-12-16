<template>
  <el-cascader
    :props="cascaderProps"
    :options="options"
    ref="cascaderRef"
    v-model="checkedValue"
    filterable
    @change="valChange"
    clearable
  />
</template>
<script lang="ts" setup>
import { ref, watch, nextTick } from "vue";
import type { CascaderProps, CascaderNode } from "element-plus";
import { ElCascader } from "element-plus";
import { CodeModel } from "@/api/model/codeModel";
import { ClassService } from "@/api/service/WorkTicket/ClassService";
import { cloneDeep } from "lodash-es";
import { EmitProps } from "./type";

const props = withDefaults(
  defineProps<{
    departmentCode: string;
    showValue?: string[];
    departmentLevel: string;
  }>(),
  {
    departmentCode: "12319",
  }
);
const cascaderRef = ref<InstanceType<typeof ElCascader>>();
const cascaderProps: CascaderProps = {
  label: "name",
  value: "code",
  children: "childs",
};
const emit = defineEmits<{
  (e: "getCheckedValue", checkedInfo: EmitProps): void;
  (e: "getSecondPrams", secondParams: string): void;
  (e: "empty"): void;
}>();
const classService = new ClassService();
const isRequestEnd = ref(false);
const setCheckedFlag = ref(false)
const checkedValue = ref<string[]>([]);
const options = ref<CodeModel[]>([]);
const resetValue = () => {
  checkedValue.value = [];
};
const getData = () => {
  resetValue();
  classService
    .getClassByDepartCode(props.departmentCode || "12319", props.departmentLevel)
    .then((res) => {
      if (res.code === 200) {
        options.value = res.data;
        isRequestEnd.value = true;
        setCheckedFlag.value && checkedValue.value.length>0 && valChange(checkedValue.value)
      }
    });
};
const getSecondPramsByCodes = (node: CascaderNode): string => {
  if (node.pathNodes.every((pathNode) => pathNode.data!.secondParam === "")) {
    return "";
  } else {
    const filterData = node.pathNodes.filter(
      (pathNode) => pathNode.data!.secondParam !== ""
    );
    return (filterData[filterData.length - 1].data as any).secondParam;
  }
};
const valChange = (value: string[]) => {
  
  if (value) {
    nextTick(()=>{
      // console.log(value,checkedValue.value,cascaderRef.value!.getCheckedNodes(true));
      const node: CascaderNode = cascaderRef.value!.getCheckedNodes(true)![0];
      node.pathLabels?.length>0 && emit("getCheckedValue", {
        labels: node.pathLabels,
        checkedValue: value,
        secondParams: getSecondPramsByCodes(node),
      });

    })
  } else{
    // emit("empty");
    emit("getCheckedValue", {
      labels: [],
      checkedValue: [],
      secondParams: ''
    });
  }
};
const getSecondsParams = () => {
  const data = cloneDeep(options.value);
  const filterData = data.find(({ code }) => code === checkedValue.value[0]);
  emit("getSecondPrams", filterData?.secondParam || "");
};
getData();
watch(
  () => props.showValue,
  (value) => {
    // console.log('props.showValue',props.showValue);
    
    if (value && value[0]) {
      checkedValue.value = cloneDeep(value).filter(i=>i)
      if(options.value.length>0){
        valChange(checkedValue.value)
        setCheckedFlag.value = false
      }else{
        setCheckedFlag.value = true
      }
    }
  },{
    deep: true,
    immediate: true
  }
);
watch(
  () => props.departmentCode,
  (code) => {
    console.log('departmentCode',props.departmentCode);
    
    if (code !== "") {
      getData();
    }
  }
);
watch(
  () => isRequestEnd.value,
  (status) => {
    if (status && props.showValue && props.showValue.length > 0) {
      getSecondsParams();
    }
  }
);

defineExpose({
  resetValue,
});
</script>

<style lang="scss" scoped></style>
