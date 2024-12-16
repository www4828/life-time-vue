<template>
  <component
    :is="currentComponents"
    :nodeCode="nodeCode"
    @back="back"
    :flowModel="flowModel"
    :taskId="taskId"
    :buttons="buttonsList"
    @queyParams="(val:any)=> queyParams = val"
    :queryParams="queyParams"
    @changePageInfo="changePageInfo"
    :pageInfo="pageInfo"
  ></component>
</template>
<script lang="ts" setup>
import { ref, markRaw, Raw, reactive, getCurrentInstance, onUnmounted } from "vue";
import List from "@/businessComponent/List/lettersVisitList.vue";
import Operate from "@/businessComponent/Operate/lettersVisitOperate-v2.vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
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
const { nodeCode } = useNodeCode();
let flowModel: any = reactive({
  lineId: "",
  processId: "",
});
const buttonsList = ref([]);
let taskId: any = ref("");
const { proxy } = <any>getCurrentInstance();
let queyParams: any = ref([]); // 保存查询字段
const pageInfo = reactive({
  pageSize: Number(sessionStorage.getItem('pageSize')!) || 30,
  pageIndex: 1,
});
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
    taskId.value = buttonInfo.taskId;
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
