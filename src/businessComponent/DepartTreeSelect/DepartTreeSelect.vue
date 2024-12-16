<template>
  <el-tree-select
    ref="treeRef"
    class="treeRefs"
    :props="treeProps"
    :data="departments"
    v-model="treeValue"
    highlight-current
    filterable
    clearable
    collapse-tags
    @change="change"
    @node-click="nodeClick"
    node-key="departmentCode"
    :multiple="props.isMultiple"
    :loading="loading"
    :expand-on-click-node="false"
    value-key="departmentCode"
  />
</template>
<script lang="ts" setup>
import { ref, watch, nextTick } from "vue";
import { DepartmentModel, SearchDepartmentModel } from "@/api/model/departmentModel";
import { Response } from "@/api/interface";
import { useDepartment } from "@/hooks/useDepartment";
import { ElTree } from "element-plus";
import { isEqual } from "lodash-es";
import { DepartmentService } from "@/api/service/System/DepartmentService";

const props = withDefaults(
  defineProps<{
    params: SearchDepartmentModel;
    isImmediate?: boolean;
    isMultiple?: boolean;
    departmentCode?: string;
    defaultList?: any;
  }>(),
  {
    isImmediate: true,
    isMultiple: true,
  }
);
const treeProps = {
  children: "childs",
  label: "departmentName",
  value: "departmentCode",
};
const { currentDepartmentCode } = useDepartment();
const departments = ref<DepartmentModel[]>([]);
const departmentServer = new DepartmentService();
const treeRef = ref<InstanceType<typeof ElTree>>();
const loading = ref(false);
const setCheckedFlag = ref(false);
const id = ref("");
const emit = defineEmits(["getDepartCode", "getTreeId"]);
const treeValue = ref<string | string[]>("");
const getDepartmentInfo = () => {
  loading.value = true;
  departmentServer
    .getFilterDepartment(props.departmentCode! || currentDepartmentCode, props.params!)
    .then((res: Response) => {
      if (res.code === 200) {
        departments.value = res.data;
        if(setCheckedFlag.value){
          props.isMultiple && treeValue.value.length > 0 && change(treeValue.value)
        }
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
if (props.isImmediate) {
  getDepartmentInfo();
}
const resetValue = () => {
  treeValue.value = "";
};
const change = (val: any) => {
  const id = treeRef.value?.getCurrentKey(),nodes:any = []
  nextTick(()=>{
    if(props.isMultiple){
      val.length>0 && val.forEach((item:string)=>{
        nodes.push(treeRef.value?.getNode(item).data)
      })
    }else{
      nodes.push(treeRef.value?.getNode(val).data)
    }
    emit("getDepartCode", { val, id, nodes });
  })
  
};
const nodeClick = (node: DepartmentModel) => {
  id.value = node.id!;
};
defineExpose({
  resetValue,
  getDepartmentInfo,
});
watch(
  () => props.defaultList,
  (val) => {
    treeValue.value = val;
    if(departments.value.length>0){
      setCheckedFlag.value = false
      change(val)
    }else{
      setCheckedFlag.value = true
    }
  },
  {
    immediate: true,
    deep:true
  }
);
watch(
  () => props.params?.removeList,
  (filterList, oldFilterList) => {
    if (
      filterList!.every((filter) => filter !== "") &&
      !props.isImmediate &&
      !isEqual(filterList, oldFilterList)
    ) {
      getDepartmentInfo();
    }
  }
);
</script>

<style lang="scss" scoped>
.treeRefs {
  ::v-deep(.el-select__tags) {
    height: 30px;
  }
}
</style>
