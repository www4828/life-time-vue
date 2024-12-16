<template>
  <component
    :is="currentComponents"
    @back="back"
    :flowModel="flowModel"
    :buttons="buttonsList"
    :taskId="taskId"
    @changePageInfo="changePageInfo"
    :pageInfo="pageInfo"
    :nodeCode="nodeCode"
    @queyParams="(val:any)=> queyParams = val"
    :queryParams="queyParams"
  ></component>
</template>
<script lang="ts" setup>
import List from "./components/List.vue";
import Operate from "@/businessComponent/Operate/operate.vue";
import { ButtonInfoModel } from "@/api/model/dispatchModel";
import Detail from "@/views/CaseDetail/CaseDetail.vue";
import { deepClone } from "@/utils/other";
import { ref, markRaw, Raw, reactive, getCurrentInstance, onUnmounted } from "vue";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";

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
const pageInfo = reactive({
  pageSize: Number(sessionStorage.getItem("pageSize")!) || 30,
  pageIndex: 1,
});
let queyParams: any = ref([]); // 保存查询字段
const currentComponents = ref<Raw<Attrs<"List" | "Detail">>>(markRaw(List));
let flowModel = reactive({
  taskId: "",
  lineId: "",
  processId: "",
  name: "",
  code: "",
  id: "",
});
const taskId = ref("");
const nodeCode: NodeCodeKey = "C217";
const backUnlockNodeCode: NodeCodeKey = "C218";
const backNodeCode: NodeCodeKey = "C216";
const buttonsList = ref<ButtonInfoModel[]>([]);
const { proxy } = <any>getCurrentInstance();

proxy.mittBus.on(
  "grandsonClick",
  ({
    buttonInfo,
    callBackButtons,
  }: {
    buttonInfo: IList;
    callBackButtons: ButtonInfoModel[];
  }) => {
    if (buttonInfo.name === "催办") {
      flowModel.taskId = taskId.value = buttonInfo.taskId;
      flowModel.lineId = "";
      flowModel.id = "2";
      flowModel.processId = "";
      flowModel.name = "催办";
      flowModel.code = nodeCode;
      buttonsList.value = [
        {
          id: "2",
          code: nodeCode,
          formPath: "",
          fullName: "",
          name: "催办",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
        {
          id: "3",
          code: backNodeCode,
          formPath: "",
          fullName: "",
          name: "收单",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
        {
          id: "4",
          code: backUnlockNodeCode,
          formPath: "",
          fullName: "",
          name: "退单解锁",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
      ];
      currentComponents.value = markRaw(Operate);
    } else if (buttonInfo.name === "收单") {
      flowModel.taskId = taskId.value = buttonInfo.taskId;
      flowModel.lineId = "";
      flowModel.processId = "";
      flowModel.name = "收单";
      flowModel.id = "3";
      flowModel.code = backNodeCode;
      buttonsList.value = [
        {
          id: "2",
          code: nodeCode,
          formPath: "",
          fullName: "",
          name: "催办",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
        {
          id: "3",
          code: backNodeCode,
          formPath: "",
          fullName: "",
          name: "收单",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
        {
          id: "4",
          code: backUnlockNodeCode,
          formPath: "",
          fullName: "",
          name: "退单解锁",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
      ];
      currentComponents.value = markRaw(Operate);
    } else if (buttonInfo.name === "退单解锁") {
      flowModel.taskId = taskId.value = buttonInfo.taskId;
      flowModel.lineId = "";
      flowModel.processId = "";
      flowModel.name = "退单解锁";
      flowModel.id = "4";
      flowModel.code = backUnlockNodeCode;
      buttonsList.value = [
        {
          id: "2",
          code: nodeCode,
          formPath: "",
          fullName: "",
          name: "催办",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
        {
          id: "3",
          code: backNodeCode,
          formPath: "",
          fullName: "",
          name: "收单",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
        {
          id: "4",
          code: backUnlockNodeCode,
          formPath: "",
          fullName: "",
          name: "退单解锁",
          props: {
            additionalProp1: "",
            additionalProp2: "",
            additionalProp3: "",
            empty: "",
            innerMap: "",
          },
          sort: "",
          type: "",
          processId: "",
          taskId: buttonInfo.taskId,
        },
      ];
      currentComponents.value = markRaw(Operate);
    } else {
      flowModel = deepClone(buttonInfo);
      buttonsList.value = deepClone(callBackButtons);
      currentComponents.value = markRaw(Detail);
    }
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
