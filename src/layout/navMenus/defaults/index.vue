<template>
  <div class="menu-active">
    <svg-icon
      iconName="menu-fold"
      class="menu-icon"
      @click="handlerClickSider"
      v-if="getThemeConfig.isCollapse"
    ></svg-icon>
    <svg-icon
      iconName="menu-unfold"
      class="menu-icon"
      @click="handlerClickSider"
      v-else
    ></svg-icon>
  </div>
  <div class="menu-box">
    <Scrollbar>
      <Vertical :menu-list="menuLists" />
    </Scrollbar>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import {
  defineComponent,
  computed,
  reactive,
  toRefs,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import { setCaseNum } from "@/utils";
import Vertical from "@/layout/components/defaults/vertical.vue";
import { useRoute } from "vue-router";
import Scrollbar from "@/components/scrollbar/index.vue";
export default defineComponent({
  name: "navMenuDefaults",
  components: {
    Scrollbar,
    Vertical,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const state = reactive({
      //动态路由  /system/info/:id
      defaultActive: route.meta.isDynamic ? route.meta.isDynamicPath : route.path,
      menuLists: [],
    });
    const getThemeConfig = computed(() => {
      return store.state.themeConfig.themeConfig;
    });
    // 路由过滤递归函数
    const filterRoutesFun = (arr: Array<object>) => {
      return arr
        .filter((item: any) => !item.meta.isHide)
        .map((item: any) => {
          item = Object.assign({}, item);
          if (item.children) item.children = filterRoutesFun(item.children);
          return item;
        });
    };

    const handlerClickSider = () => {
      store.dispatch("themeConfig/toggleSideBar");
    };

    const deepCompareAndReplace = (a: any, b: any) => {
      for (let i = 0; i < a.length; i++) {
        const aItem = a[i];
        const bItem = b[i];
        if (aItem.meta.caseNum !== undefined && bItem.meta.caseNum !== undefined) {
          aItem.meta.caseNum = bItem.meta.caseNum;
        }
        if (aItem.children && bItem.children) {
          deepCompareAndReplace(aItem.children, bItem.children);
        }
      }
    };

    const getCaseNum = () => {
      setCaseNum().then((data) => {
        deepCompareAndReplace(state.menuLists, data);
      });
    };
    // const timer = setInterval(getCaseNum, Number(1000 * 60 * 3));
    // onBeforeUnmount(() => {
    //   clearInterval(timer);
    // });
    onBeforeMount(() => {
      (state.menuLists as any) = filterRoutesFun(store.state.routesList.routesList);
    });

    return {
      getThemeConfig,
      handlerClickSider,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="scss">
.menu-active {
  width: 100%;
  height: 40px;
  float: left;
  cursor: pointer;
  @include flex-box(flex-end, center);
  .menu-icon {
    width: 20px;
    height: 20px;
    margin: 0 10px 0 0;
    float: left;
    fill: var(--sh3h-menu-active-font-color);

    .icon {
      width: 100%;
      height: 100%;
    }
  }
}
.menu-box {
  width: 100%;
  height: calc(100% - 40px);
  float: left;
}
</style>
