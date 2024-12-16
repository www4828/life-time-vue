<template>
  <component
    :is="currentComponents"
    :nodeCode="nodeCode"
    @back="back"
    :flowModel="flowModel"
    @changePageInfo="changePageInfo"
    :buttons="buttonsList"
    :pageInfo="pageInfo"
    @queyParams="(val:any)=> queyParams = val"
    :queryParams="queyParams"
  ></component>
</template>
<script lang="ts" setup>
import { ref, markRaw, Raw, reactive, getCurrentInstance, onUnmounted } from "vue";
import List from "@/businessComponent/List/List.vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import Operate from "./operate.vue";
import { deepClone } from "@/utils/other";
import { useNodeCode } from "@/hooks/useNodeCode";

interface IList {
  id: string;
  taskId: string;
  processId: string;
  name: string;
}
interface ComponentMap {
  List: unknown;
  Operate: IList;
}
type ComponentKey = keyof ComponentMap;
type ComponentValue<T extends ComponentKey> = keyof ComponentMap[T];
type Attrs<T extends ComponentKey> = {
  [K in ComponentValue<T>]: ComponentMap[T][K];
};
const currentComponents = ref<Raw<Attrs<"List" | "Operate">>>(markRaw(List));
let flowModel = reactive({
  taskId: "",
  lineId: "",
  processId: "",
});
const buttonsList = ref<ButtonInfoModel[]>([]);
const { nodeCode } = useNodeCode();
const { proxy } = <any>getCurrentInstance();
const pageInfo = reactive({
  pageSize: Number(sessionStorage.getItem('pageSize')!) || 30,
  pageIndex: 1,
});
let queyParams:any = ref([]) // 保存查询字段
proxy.mittBus.on(
  "grandsonClick",
  ({
    buttonInfo,
    callBackButtons,
  }: {
    buttonInfo: IList;
    callBackButtons: ButtonInfoModel[];
  }) => {
    flowModel = deepClone(buttonInfo);
    buttonsList.value = deepClone(callBackButtons);
    currentComponents.value = markRaw(Operate);
  }
);
onUnmounted(() => {
  proxy.mittBus.off("grandsonClick");
});
const back = () => {
  currentComponents.value = markRaw(List);
};
const changePageInfo = (result: any) => {
  pageInfo.pageIndex = result.pageIndex;
  pageInfo.pageSize = result.pageSize;
};
</script>
<style lang="scss" scoped>
.receive-caseList {
  width: 100%;
  height: 100%;
}
</style>
