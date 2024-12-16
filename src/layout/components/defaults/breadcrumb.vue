<template>
  <div class="layout-navbars-breadcrumb">
    <el-breadcrumb class="layout-navbars-breadcrumb-hide">
      <transition-group name="breadcrumb" mode="out-in">
        <el-breadcrumb-item v-for="(v, k) in breadcrumbList" :key="v.meta.title">
          <div class="item-box-a" v-if="k === breadcrumbList.length - 1">
            <div class="icon-box" v-if="getThemeConfig.isBreadCrumbIcon">
              <svg-icon :icon-name="v.meta.icon" class-name="icon" />
            </div>
            <div class="text-box">{{ v.meta.title }}</div>
          </div>
          <a class="item-box" v-else @click.prevent="onBreadcrumbClick(v)">
            <div class="icon-box" v-if="getThemeConfig.isBreadCrumbIcon">
              <svg-icon :icon-name="v.meta.icon" class-name="icon" />
            </div>
            <div class="text-box">{{ v.meta.title }}</div>
          </a>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts">
import { toRefs, reactive, computed, onMounted, defineComponent } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { useStore } from "@/store/index";
import { Local } from "@/utils/storage";

// 定义接口来定义对象的类型
interface BreadcrumbState {
  breadcrumbList: Array<any>;
  routeSplit: Array<string>;
  routeSplitFirst: string;
  routeSplitIndex: number;
}

export default defineComponent({
  name: "layoutBreadcrumb",
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const state = reactive<BreadcrumbState>({
      breadcrumbList: [],
      routeSplit: [],
      routeSplitFirst: "",
      routeSplitIndex: 1,
    });
    // 获取布局配置信息
    const getThemeConfig = computed(() => {
      return store.state.themeConfig.themeConfig;
    });
    // 动态设置经典、横向布局不显示
    const isShowBreadcrumb = computed(() => {
      initRouteSplit(route.path);
      const { layout, isBreadCrumb } = store.state.themeConfig.themeConfig;
      if (layout === "classic" || layout === "transverse") return "none";
      else return isBreadCrumb ? "" : "none";
    });
    // 面包屑点击时
    const onBreadcrumbClick = (v: any) => {
      const { redirect, path } = v;
      if (redirect) router.push(redirect);
      else router.push(path);
    };
    // 展开/收起左侧菜单点击
    const onThemeConfigChange = () => {
      store.state.themeConfig.themeConfig.isCollapse = !store.state.themeConfig
        .themeConfig.isCollapse;
      setLocalThemeConfig();
    };
    // 存储布局配置
    const setLocalThemeConfig = () => {
      Local.remove("themeConfig");
      Local.set("themeConfig", getThemeConfig.value);
    };
    // 处理面包屑数据
    const getBreadcrumbList = (arr: Array<object>) => {
      arr.map((item: any) => {
        state.routeSplit.map((v: any, k: number, arrs: any) => {
          if (state.routeSplitFirst === item.path) {
            state.routeSplitFirst += `/${arrs[state.routeSplitIndex]}`;
            state.breadcrumbList.push(item);
            state.routeSplitIndex++;
            if (item.children) getBreadcrumbList(item.children);
          }
        });
      });
    };
    // 当前路由字符串切割成数组，并删除第一项空内容
    const initRouteSplit = (path: string) => {
      if (!store.state.themeConfig.themeConfig.isBreadCrumb) return false;
      state.breadcrumbList = [store.state.routesList.routesList[0]];
      state.routeSplit = path.split("/");
      state.routeSplit.shift();
      state.routeSplitFirst = `/${state.routeSplit[0]}`;
      state.routeSplitIndex = 1;
      getBreadcrumbList(store.state.routesList.routesList);
    };
    // 页面加载时
    onMounted(() => {
      initRouteSplit(route.path);
    });
    // 路由更新时
    onBeforeRouteUpdate((to) => {
      initRouteSplit(to.path);
    });
    return {
      onThemeConfigChange,
      isShowBreadcrumb,
      getThemeConfig,
      onBreadcrumbClick,
      ...toRefs(state),
    };
  },
});
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb {
  flex: 1;
  height: inherit;
  display: flex;
  align-items: center;
  padding-left: 15px;

  .el-breadcrumb__item {
    width: auto;
    height: 100%;
    float: left;
    display: flex;
    align-items: center;
    justify-items: center;
  }
  .item-box {
    width: auto;
    height: 100%;
    float: left;
    display: flex;
    align-items: center;
    justify-items: center;

    .icon-box {
      width: 20px;
      height: 100%;
      float: left;
      @include flex-box(center, center);

      .icon {
        width: 15px;
        height: 15px;
        float: left;
      }
    }

    .text-box {
      width: auto;
      height: 100%;
      float: left;
      font-size: $font-size-14;
      font-family: SourceHanSansCN-Medium;
      color: var(--sh3h-breadcrumb-font-color);
      @include flex-box(center, center);
    }
  }
  .item-box-a {
    width: auto;
    height: 100%;
    float: left;
    display: flex;
    align-items: center;
    justify-items: center;

    .icon-box {
      width: 20px;
      height: 100%;
      float: left;
      @include flex-box(center, center);

      .icon {
        width: 15px;
        height: 15px;
        float: left;
        fill: var(--sh3h-breadcrumb-active-font-color);
      }
    }

    .text-box {
      width: auto;
      height: 100%;
      float: left;
      font-size: $font-size-14;
      font-family: SourceHanSansCN-Medium;
      color: var(--sh3h-breadcrumb-active-font-color);
      @include flex-box(center, center);
    }
  }
  .layout-navbars-breadcrumb-span {
    opacity: 0.7;
    color: var(--next-bg-topBarColor);
  }
  ::v-deep(.el-breadcrumb__separator) {
    opacity: 1;
    color: var(--next-bg-topBarColor);
    font-weight: 500;
  }
  ::v-deep(.el-breadcrumb__inner a, .el-breadcrumb__inner.is-link) {
    font-weight: unset !important;
    color: var(--next-bg-topBarColor);
    &:hover {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
