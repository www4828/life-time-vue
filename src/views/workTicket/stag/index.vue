<template>
  <component
    :is="currentComponents"
    :listPrams="listPrams"
    :buttons="buttons"
    @back="back"
    @changeName="changeName"
    @changePageInfo="changePageInfo"
    :pageInfo="pageInfo"
    @queyParams="(val:any)=> queyParams = val"
    :queryParams="queyParams"
  ></component>
</template>
<script lang="ts" setup>
import { ref, reactive, markRaw, Raw, getCurrentInstance, onUnmounted } from "vue";
import DispatchWrapper from "./components/Detail.vue";
import ListWrapper from "./components/List.vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import { cloneDeep } from "lodash-es";

interface IList {
  id: string;
  taskId: string;
  name: string;
}
interface ComponentMap {
  ListWrapper: unknown;
  DispatchWrapper: IList;
}
type ComponentKey = keyof ComponentMap;
type ComponentValue<T extends ComponentKey> = keyof ComponentMap[T];
type Attrs<T extends ComponentKey> = {
  [K in ComponentValue<T>]: ComponentMap[T][K];
};
const listPrams = reactive<IList>({
  id: "",
  taskId: "",
  name: "",
});
const pageInfo = reactive({
  pageSize: Number(sessionStorage.getItem('pageSize')!) || 30,
  pageIndex: 1,
});
let queyParams: any = ref([]); // 保存查询字段
const buttons = ref<ButtonInfoModel[]>([]);
const sourceButtons = ref<ButtonInfoModel[]>([]);
const { proxy } = <any>getCurrentInstance();
const currentComponents = ref<Raw<Attrs<"ListWrapper" | "DispatchWrapper">>>(
  markRaw(ListWrapper)
);
proxy.mittBus.on(
  "grandsonClick",
  ({
    buttonInfo,
    callBackButtons,
  }: {
    buttonInfo: IList;
    callBackButtons: ButtonInfoModel[];
  }) => {
    const { id, taskId, name } = buttonInfo;
    listPrams.id = id;
    listPrams.taskId = taskId;
    listPrams.name = name;
    sourceButtons.value = cloneDeep(callBackButtons);
    callBackButtons.forEach((button) => {
      if (button.name === name) {
        button.name = "确定";
        button.sort = 1;
      } else {
        button.sort = 2;
      }
    });
    buttons.value = callBackButtons.sort(
      (a, b) => (b.sort as number) - (a.sort as number)
    );
    currentComponents.value = markRaw(DispatchWrapper);
  }
);
const changeName = (name: string) => {
  if (name === "dispatch") {
    const sourceButton = cloneDeep(sourceButtons.value);
    listPrams.name = "派遣";
    sourceButton.forEach((button) => {
      if (button.name === "派遣") {
        button.name = "确定";
        button.sort = 1;
      } else {
        button.name = "销单";
        button.sort = 2;
      }
    });
    buttons.value = sourceButton.sort((a, b) => (b.sort as number) - (a.sort as number));
  } else {
    const sourceButton = cloneDeep(sourceButtons.value);
    listPrams.name = "销单";
    sourceButton.forEach((button) => {
      if (button.name === "销单") {
        button.name = "确定";
        button.sort = 1;
      } else {
        button.name = "派遣";
        button.sort = 2;
      }
    });
    buttons.value = sourceButton.sort((a, b) => (b.sort as number) - (a.sort as number));
  }
};
onUnmounted(() => {
  proxy.mittBus.off("grandsonClick");
});
const back = () => {
  currentComponents.value = markRaw(ListWrapper);
};
const changePageInfo = (result: any) => {
  pageInfo.pageIndex = result.pageIndex;
  pageInfo.pageSize = result.pageSize;
};
</script>

<style lang="scss" scoped></style>
