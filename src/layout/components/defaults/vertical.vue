<template>
  <el-menu
    router
    :default-active="$route.path"
    background-color="transparent"
    :collapse="!getThemeConfig.isCollapse"
    :unique-opened="getThemeConfig.isUniqueOpened"
    :collapse-transition="false"
  >
    <template v-for="val in menuLists">
      <el-sub-menu
        :index="val.path"
        v-if="val.children && val.children.length > 0"
        :key="val.path"
      >
        <template #title>
          <span class="sh3h-icon" v-show="getThemeConfig.isMenuIcon">
            <svg-icon :icon-name="val.meta.icon" class-name="icon" />
          </span>
          <span class="sh3h-font">{{ val.meta.title }}</span>
          <el-badge
            v-if="val.meta.caseNum > 0"
            :value="val.meta.caseNum"
            class="item sh3h-badge"
          />
        </template>

        <SubItem :chil="val.children" />
      </el-sub-menu>
      <template v-else>
        <el-menu-item
          :index="val.path"
          :key="val.path"
          :route="{ path: val.path, query: val.query }"
        >
          <span
            :class="['sh3h-icon', val.meta.icon ? '' : 'w_20']"
            v-show="getThemeConfig.isMenuIcon"
          >
            <svg-icon :icon-name="val.meta.icon" class-name="icon" />
          </span>
          <template
            #title
            v-if="!val.meta.isLink || (val.meta.isLink && val.meta.isIframe)"
          >
            <span class="sh3h-font">{{ val.meta.title }}</span>
          </template>
          <template #title v-else>
            <a :href="val.meta.isLink" target="_blank" rel="opener" class="w100">{{
              val.meta.title
            }}</a>
          </template>
        </el-menu-item>
      </template>
    </template>
  </el-menu>
</template>

<script lang="ts">
import { useStore } from "@/store/index";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import SubItem from "@/layout/components/defaults/subItem.vue";
import { toRefs, reactive, computed, defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "navMenuVertical",
  components: { SubItem },
  props: {
    menuList: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const store = useStore();
    const route = useRoute();
    const state = reactive({
      // defaultActive: route.meta.isDynamic ? route.meta.isDynamicPath : route.path,
      isCollapse: false,
    });
    // 获取父级菜单数据
    const menuLists = computed(() => {
      return <any>props.menuList;
    });
    // 获取布局配置信息
    const getThemeConfig = computed(() => {
      return store.state.themeConfig.themeConfig;
    });
    // 页面加载时
    onMounted(() => {});
    // 路由更新时
    onBeforeRouteUpdate((to) => {});

    return {
      menuLists,
      getThemeConfig,
      ...toRefs(state),
      route,
    };
  },
});
</script>
<style lang="scss" scoped>
.sh3h-icon {
  width: 18px;
  height: 18px;
  float: left;
  fill: var(--sh3h-menu-font-color);
  @include flex-box(center, center);
  margin-right: 15px;
  .icon {
    width: $menu-icon-small;
    height: $menu-icon-small;
    float: left;
  }
}
.sh3h-font {
  font-size: var(--el-font-size-base);
  font-family: SourceHanSansCN-Medium;
}
.w_20 {
  width: 15px !important;
}
.sh3h-badge {
  display: flex;
  margin-left: 10px;
}
</style>
