<template>
  <div class="wrapper">
    <!-- <div class="tab-box">
        <el-tabs
            v-model="activeName"
            tab-position="top"
            type
            class="demo-tabs"
            @tab-click="handleClick"
        >
            <el-tab-pane label="布局设置" name="first">
              <LayoutSetting />
            </el-tab-pane>
            <el-tab-pane label="样式设置" name="second">
              <ThemeSetting />
            </el-tab-pane>
          </el-tabs>
      </div> -->
    <div class="tabsWrapper" id="tabs">
      <div
        class="tab"
        v-for="(tab, index) in ['布局设置', '样式设置']"
        :class="{ active: cur === index }"
        @click="tabClick(index)"
      >
        {{ tab }}
      </div>
    </div>

    <!-- <ThemeSetting /> -->
    <!-- <LayoutSetting /> -->
    <div class="tabsContent">
      <component :is="currentComponents" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineComponent, markRaw, Raw, ref } from "vue";
import Scrollbar from "@/components/scrollbar/index.vue";
import LayoutSetting from "@/views/system/setting/layout/index.vue";
import ThemeSetting from "@/views/system/setting/theme/index.vue";
interface ComponentMap {
  LayoutSetting: unknown;
  ThemeSetting: unknown;
}
type ComponentKey = keyof ComponentMap;
type ComponentValue<T extends ComponentKey> = keyof ComponentMap[T];
type Attrs<T extends ComponentKey> = {
  [K in ComponentValue<T>]: ComponentMap[T][K];
};
const cur = ref(1);
const currentComponents = ref<Raw<Attrs<"LayoutSetting" | "ThemeSetting">>>(
  markRaw(ThemeSetting),
);
const tabClick = (index: number) => {
  cur.value = index;
  currentComponents.value = index
    ? markRaw(ThemeSetting)
    : markRaw(LayoutSetting);
};
</script>
<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100%;
  // background-color: #fff;
  padding: 0 10px 10px;
  box-sizing: border-box;
  // .tab-box {
  //     width: calc(100% - 50px);
  //     // width: 100%;
  //     height: calc(100%);

  //     ::v-deep(.el-tabs) {
  //         height: 100%;
  //     }
  //     ::v-deep(.el-tabs__content) {
  //         height: calc(100% - 60px);
  //         // height: 100%;
  //     }
  //     ::v-deep(.el-tab-pane) {
  //         height: 100%;
  //     }
  // }

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
        color: var(--el-color-primary);

        &::before {
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%);
          content: "";
          width: 90%;
          height: 2px;
          border-radius: 5px;
          background-color: var(--el-color-primary);
        }
      }
    }
  }
  .tabsContent {
    width: 100%;
    height: calc(100% - 50px);
    box-sizing: border-box;
    // padding: 20px;
    // background-color: #fff;
  }
}
</style>
