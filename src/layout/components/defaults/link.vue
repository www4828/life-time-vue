<template>
  <router-view v-slot="{ Component }">
    <transition :name="setTransitionName" mode="out-in">
      <keep-alive :include="keepAliveNameList">
        <component :is="Component" :key="refreshRouterViewKey" :style="{ minHeight }" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  toRefs,
  reactive,
  getCurrentInstance,
  onBeforeMount,
  onUnmounted,
  nextTick,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import { useStore } from "@/store/index";

// 定义接口来定义对象的类型
interface ParentViewState {
  refreshRouterViewKey: string | number | symbol | undefined;
  keepAliveNameList: string[];
}

export default defineComponent({
  name: "layoutParentView",
  props: {
    minHeight: {
      type: String,
      default: "",
    },
  },
  setup() {
    const { proxy } = <any>getCurrentInstance();
    const route = useRoute();
    const store = useStore();
    const state = reactive<ParentViewState>({
      refreshRouterViewKey: "",
      keepAliveNameList: [],
    });
    // 设置主界面切换动画
    const setTransitionName = computed(() => {
      return store.state.themeConfig.themeConfig.animation;
    });
    // 获取布局配置信息
    const getThemeConfig = computed(() => {
      return store.state.themeConfig.themeConfig;
    });
    // 获取组件缓存列表(name值)
    const getKeepAliveNames = computed(() => {
      return store.state.keepAliveNames.keepAliveNames;
    });
    // 页面加载前，处理缓存，页面刷新时路由缓存处理
    onBeforeMount(() => {
      state.keepAliveNameList = getKeepAliveNames.value;
      proxy.mittBus.on("onTagsViewRefreshRouterView", (fullPath: string) => {
        console.log(getKeepAliveNames.value, route.name);
        state.keepAliveNameList = getKeepAliveNames.value.filter(
          (name: string) => route.name !== name
        );
        state.refreshRouterViewKey = "";
        nextTick(() => {
          state.refreshRouterViewKey = fullPath;
          state.keepAliveNameList = getKeepAliveNames.value;
        });
      });
    });
    // 页面卸载时
    onUnmounted(() => {
      proxy.mittBus.off("onTagsViewRefreshRouterView");
    });
    // 监听路由变化，防止 tagsView 多标签时，切换动画消失
    watch(
      () => route.fullPath,
      () => {
        state.refreshRouterViewKey = route.fullPath;
      }
    );
    return {
      getThemeConfig,
      getKeepAliveNames,
      setTransitionName,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="scss">
.h100 {
  height: 100%;
}
.w100 {
  width: 100%;
}
</style>
