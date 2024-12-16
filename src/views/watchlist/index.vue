<template>
  <component
    :is="currentComponents"
    :nodeCode="nodeCode"
    @back="back"
    :flowModel="listPrams"
    :taskId="listPrams.taskId"
    :buttons="buttons"
    @queyParams="(val:any)=> queyParams = val"
    :queryParams="queyParams"
    @changePageInfo="changePageInfo"
    :pageInfo="pageInfo"
    feedBack
  ></component>
</template>
<script lang="ts" setup>
import { ref, reactive, markRaw, Raw, getCurrentInstance, onUnmounted } from "vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import { useNodeCode } from "@/hooks/useNodeCode";
import List from "./List.vue";
import Operate from "@/businessComponent/Operate/operate-v2.vue";

interface IList {
  id: string;
  taskId: string;
  name: string;
  processId: string;
  code: string;
  formPath: string;
}
interface ComponentMap {
  List: unknown;
  Dispatch: IList;
  EditComponent: unknown;
}
type ComponentKey = keyof ComponentMap;
type ComponentValue<T extends ComponentKey> = keyof ComponentMap[T];
type Attrs<T extends ComponentKey> = {
  [K in ComponentValue<T>]: ComponentMap[T][K];
};
const nodeCodeMsg = useNodeCode();
let nodeCode = ref(nodeCodeMsg.nodeCode)
let getFlag = ref(false)
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
});
const { proxy } = <any>getCurrentInstance();
const buttons = ref<ButtonInfoModel[]>([]);
const currentComponents = ref<Raw<Attrs<"List" | "EditComponent">>>(markRaw(List));
proxy.mittBus.on(
  "grandsonClick",
  ({
    buttonInfo,
    callBackButtons,
  }: {
    buttonInfo: IList;
    callBackButtons: ButtonInfoModel[];
  }) => {
    const { id, taskId, name, processId, code, formPath } = buttonInfo;
    listPrams.id = id;
    listPrams.taskId = taskId;
    listPrams.name = name;
    listPrams.processId = processId;
    listPrams.code = 'SEND';
    listPrams.formPath = 'Instruction';
    buttons.value = callBackButtons;
    // console.log(buttonInfo,listPrams);
    
    currentComponents.value = markRaw(Operate);
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

const getQueryParams = (val:any)=>{
  getFlag.value = false
  queyParams = val
  setTimeout(() => {
    getFlag.value = true
  }, 100);
}
</script>

<style lang="scss" scoped></style>
