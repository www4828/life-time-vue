<template>
  <div class="tabs">
    <div class="tabsWrapper">
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
            <div class="baseInfoAction">
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
        <BaiduMap @clickDone="cur = 0" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useSlots, ref, computed, watch, getCurrentInstance, onBeforeUnmount } from "vue";
import BaiduMap from "@/businessComponent/GisMap/BaiduMap.vue";
import Scrollbar from "@/components/scrollbar/index.vue";
interface ListPrams {
  id: string;
  taskId: string;
}
const props = defineProps<{
  nodeName: string;
  active?: number;
}>();
const emit = defineEmits(["tabClick"]);
const { proxy } = <any>getCurrentInstance()!;
const slot = useSlots();
const cur = ref(0);
const tabs = computed(() => {
  return [props.nodeName, "GIS地图"];
});
const baseControl = ref(!!slot.baseInfo);
const phoneControl = ref(!!slot.phone);
const historyControl = ref(!!slot.history);
const actionsControl = ref(!!slot.actions);
const processControl = ref(!!slot.process);
const buttonsControl = ref(!!slot.buttons);
proxy.mittBus.on("tabClick", () => {
  cur.value = 1;
});
onBeforeUnmount(() => {
  proxy.mittBus.off("tabClick");
});
const tabClick = (index: number) => {
  cur.value = index;
  emit("tabClick", index);
};
const isShow = computed(() => {
  return (
    (!phoneControl.value && historyControl.value) ||
    (phoneControl.value && !historyControl.value)
  );
});
watch(
  () => props.active,
  (val: any) => {
    tabClick(val);
  }
);
</script>
<style lang="scss" scoped>
$marginB: 10px;
$padding: 10px;
$rightWidth: 400px;

.tabs {
  height: 100%;
  box-sizing: border-box;

  .tabsWrapper {
    display: flex;
    margin-bottom: 20px;

    .tab {
      position: relative;
      @include fontStyle(
        var(--lt-font-family-medium),
        $font-size-18,
        var(--lt-bel-form-color)
      );
      font-weight: bold;
      margin-right: 20px;
      cursor: pointer;

      &.active {
        color: var(--lt-nu-active-font-color);

        &::before {
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%);
          content: "";
          width: 40px;
          height: 2px;
          border-radius: 5px;
          background-color: var(--lt-nu-active-font-color);
        }
      }
    }
  }

  .tabsContent {
    height: calc(100% - 40px);
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
        min-height: calc(100% - 50px);

        .baseInfo {
          background-color: var(--lt-rkTicket-background-color);
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
          background-color: var(--lt-rkTicket-background-color);
          padding: $padding;
          margin-right: $marginB;
        }
      }

      .buttons {
        display: flex;
        justify-content:flex-end;
        align-items: center;
        height: 70px;
        margin-top: -20px;
        margin-right: 10px;
        padding-right: 10px;
        background-color: var(--lt-rkTicket-background-color);
        // &::before{
        //   content: '';
        // }
      }
    }

    .actionsSection {
      display: flex;
      flex-direction: column;
      flex-basis: $rightWidth;
      height: 100%;
      // padding:5px;
      box-sizing: border-box;
      width: 20%;

      .processSlotWrapper {
        background-color: var(--lt-rkTicket-background-color);
        padding: 10px;
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
        background-color: var(--lt-rkTicket-background-color);
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
