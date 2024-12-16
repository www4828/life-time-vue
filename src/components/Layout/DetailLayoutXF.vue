<template>
  <div class="tabs">
    <div class="tabsWrapper" id="tabs">
      <div
        class="tab"
        v-for="(tab, index) in tabs"
        :class="{ active: cur === index }"
        @click="tabClick(index)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="tabsContent">
      <div class="workLayout" v-show="cur === 0">
        <div class="baseWrapper">
          <Scrollbar>
            <div class="baseInfoAction" :class="{ hasButtons: buttonsControl }">
              <div class="baseInfo" v-show="baseControl">
                <slot name="baseInfo" />
              </div>
              <div class="actions" v-show="actionsControl">
                <slot name="actions" />
              </div>
            </div>

            <div class="buttons" v-show="buttonsControl">
              <slot name="buttons" />
            </div>
          </Scrollbar>
        </div>

        <div class="actionsSection">
          <div class="phoneHistory" v-show="phoneControl || historyControl">
            <div class="phone" v-show="phoneControl">
              <slot name="phone" />
            </div>
            <Scrollbar class="history" v-show="historyControl">
              <slot name="history" />
            </Scrollbar>
          </div>
          <div class="processSlotWrapper" v-show="processControl">
            <slot name="process" />
          </div>
        </div>
      </div>
      <div v-show="cur === 1" class="mapWrapper">
        <BaiduMap isDetail />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { encrypt } from "@/utils";
import { Session } from "@/utils/storage";
import Scrollbar from "@/components/scrollbar/index.vue";
import BaiduMap from "@/businessComponent/GisMap/BaiduMap.vue";
import { useSlots, ref, computed, getCurrentInstance, onBeforeUnmount } from "vue";

const slot = useSlots();

const baseControl = ref(!!slot.baseInfo);
const phoneControl = ref(!!slot.phone);
const historyControl = ref(!!slot.history);
const actionsControl = ref(!!slot.actions);
const processControl = ref(!!slot.process);
const buttonsControl = ref(!!slot.buttons);
const { proxy } = <any>getCurrentInstance()!;
const cur = ref(0);
const taskId = ref("");
const tabs = computed(() => {
  return ["详情", "GIS地图", "案件打印"];
});
proxy.mittBus.on("tabClick", () => {
  cur.value = 1;
});
proxy.mittBus.on("getSecondParam", (params: any) => {
  taskId.value = params.taskId;
});
onBeforeUnmount(() => {
  proxy.mittBus.off("tabClick");
});
const tabClick = (index: number) => {
  if (index === 2) {
    const { xfReportUrl } = Session.get("appConfig").urls;
    window.open(xfReportUrl + encrypt(taskId.value));
    return;
  }
  cur.value = index;
};
</script>
<style lang="scss" scoped>
$marginB: 10px;
$padding: 10px;
$rightWidth: 400px;

.tabs {
  height: 100%;
  box-sizing: border-box;
  margin: 20px;

  ::v-deep(.el-scrollbar__view) {
    height: 100%;
  }
  .tabsWrapper {
    display: flex;
    margin-bottom: 20px;

    .tab {
      position: relative;
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-18,
        var(--sh3h-label-form-color)
      );
      font-weight: bold;
      margin-right: 20px;
      cursor: pointer;

      &.active {
        color: var(--sh3h-menu-active-font-color);

        &::before {
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%);
          content: "";
          width: 40px;
          height: 2px;
          border-radius: 5px;
          background-color: var(--sh3h-menu-active-font-color);
        }
      }
    }
  }

  .tabsContent {
    height: calc(100% - 80px);
  }

  .workLayout {
    display: flex;
    height: 100%;
    box-sizing: border-box;

    .baseWrapper {
      display: flex;
      flex-direction: column;
      width: 80%;

      .baseInfoAction {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 100%;

        &.hasButtons {
          min-height: calc(100% - 50px);
        }

        .baseInfo {
          background-color: var(--sh3h-workTicket-background-color);
          padding: $padding;
          margin-right: $marginB;
          margin-bottom: $marginB;
          // height: 350px;
          // ::v-deep(.baseinfo){
          //   height: 210px;
          // }
          // ::v-deep(.fileAttachments){
          //   height: calc(100% - 210px);
          // }
        }

        .actions {
          flex: 1;
          // height: 0;
          // height: calc(100% - 350px - 50px);
          background-color: var(--sh3h-workTicket-background-color);
          padding: $padding;
          margin-right: $marginB;
        }
      }

      .buttons {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 70px;
        margin-top: -20px;
        margin-right: 10px;
        padding-right: 10px;
        background-color: var(--sh3h-workTicket-background-color);
      }
    }

    .actionsSection {
      display: flex;
      flex-direction: column;
      flex-basis: $rightWidth;
      height: 100%;
      // padding:5px;
      box-sizing: border-box;

      .processSlotWrapper {
        background-color: var(--sh3h-workTicket-background-color);
        padding: 5px 10px;
        box-sizing: border-box;
        height: 50%;
        margin-top: 10px;
      }

      .phoneHistory {
        display: flex;
        flex-direction: column;
        min-height: 50%;
        // margin-bottom: 10px;
        padding: 5px 10px;
        box-sizing: border-box;
        background-color: var(--sh3h-workTicket-background-color);
        flex: 1;

        & > div {
          flex: 1;
          padding: 5px;
          margin-bottom: $marginB;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .mapWrapper {
    width: 100%;
    height: 100%;
  }
}
</style>
