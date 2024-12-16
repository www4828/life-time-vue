<template>
  <component
    :is="currentComponents"
    @back="back"
    :flowModel="flowModel"
    :buttons="buttonsList"
    @changePageInfo="changePageInfo"
    :pageInfo="pageInfo"
    @queyParams="(val:any)=> queyParams = val"
    :queryParams="queyParams"
  ></component>
</template>
<script lang="ts" setup>
import { ref, markRaw, Raw, reactive, getCurrentInstance, onUnmounted } from "vue";
import List from "./components/List.vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import Detail from "@/views/CaseDetail/CaseDetail.vue";
import { deepClone } from "@/utils/other";

interface IList {
  id: string;
  taskId: string;
  processId: string;
  name: string;
}
interface ComponentMap {
  List: unknown;
  Detail: IList;
}
type ComponentKey = keyof ComponentMap;
type ComponentValue<T extends ComponentKey> = keyof ComponentMap[T];
type Attrs<T extends ComponentKey> = {
  [K in ComponentValue<T>]: ComponentMap[T][K];
};
const currentComponents = ref<Raw<Attrs<"List" | "Detail">>>(markRaw(List));
let flowModel = reactive({
  taskId: "",
  lineId: "",
  processId: "",
});
const buttonsList = ref([]);
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
    currentComponents.value = markRaw(Detail);
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
