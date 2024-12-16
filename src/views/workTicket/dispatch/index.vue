<template>
  <component
    :is="currentComponents"
    :listPrams="listPrams"
    @back="back"
    @dispatch="dispatch"
    :node-code="nodeCode"
    @changePageInfo="changePageInfo"
    :pageInfo="pageInfo"
    :buttons="buttons"
    @queyParams="(val:any)=> queyParams = val"
    :queryParams="queyParams"
  ></component>
</template>
<script lang="ts" setup>
import { ref, reactive, markRaw, Raw, getCurrentInstance, onUnmounted } from "vue";
import DispatchV2 from "./components/Dispatch-V2.vue";
import DispatchV3 from "./components/Dispatch-V3.vue";
import Dispatch from "./components/Dispatch.vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import { useNodeCode } from "@/hooks/useNodeCode";
import List from "@/businessComponent/List/List.vue";

interface IList {
  id: string;
  taskId: string;
  name: string;
  processId: string;
  code: string;
  formPath: string;
  eventSource: string
}
interface ComponentMap {
  List: unknown;
  Dispatch: IList;
  DispatchV2: IList;
}
type ComponentKey = keyof ComponentMap;
type ComponentValue<T extends ComponentKey> = keyof ComponentMap[T];
type Attrs<T extends ComponentKey> = {
  [K in ComponentValue<T>]: ComponentMap[T][K];
};
const { nodeCode } = useNodeCode();
const pageInfo = reactive({
  pageSize: Number(sessionStorage.getItem('pageSize')!) || 30,
  pageIndex: 1,
});
let queyParams:any = ref([]) // 保存查询字段
const listPrams = reactive<IList>({
  id: "",
  taskId: "",
  name: "",
  processId: "",
  code: "",
  formPath: "",
  eventSource: '',
});
const { proxy } = <any>getCurrentInstance();
const buttons = ref<ButtonInfoModel[]>([]);
const currentComponents = ref<Raw<Attrs<"List" | "DispatchV2">>>(markRaw(List));
proxy.mittBus.on(
  "grandsonClick",
  ({
    buttonInfo,
    callBackButtons,
  }: {
    buttonInfo: IList;
    callBackButtons: ButtonInfoModel[];
  }) => {
    
    const { id, taskId, name, processId, code, formPath, eventSource } = buttonInfo;

    listPrams.id = id;
    listPrams.taskId = taskId;
    listPrams.name = name;
    listPrams.processId = processId;
    listPrams.code = code;
    listPrams.formPath = formPath;
    listPrams.eventSource = eventSource;
    buttons.value = callBackButtons;
    currentComponents.value = markRaw(DispatchV2);
  }
);
onUnmounted(() => {
  proxy.mittBus.off("grandsonClick");
});
const dispatch = (componentName: string) => {
  const { id, taskId, name, processId, code, formPath } = buttons.value.find(
    (button) => button.formPath === componentName
  )!;
  listPrams.id = id;
  listPrams.taskId = String(taskId);
  listPrams.name = name;
  listPrams.processId = processId!;
  listPrams.code = code!;
  listPrams.formPath = formPath!;
};
const back = () => {
  currentComponents.value = markRaw(List);
};
const changePageInfo = (result: any) => {
  pageInfo.pageIndex = result.pageIndex;
  pageInfo.pageSize = result.pageSize;
};
</script>

<style lang="scss" scoped></style>
