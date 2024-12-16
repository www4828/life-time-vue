<template>
  <div class="defaluts">
    <div
      :class="['app-wrapper', getThemeConfig.isCollapse ? 'openSidebar' : 'hideSidebar']"
    >
      <div class="head-container" v-show="isTagsViewFull">
        <NavBar v-model:selected="showphone" />
      </div>
      <div class="sidebar-container" v-show="isTagsViewFull">
        <NavMenu />
      </div>
      <div class="main-container" :class="{ fullScreen: !isTagsViewFull }">
        <AppMain />
      </div>
    </div>
    <CloseFull v-if="!isTagsViewFull" />
    <el-collapse-transition v-if="isTagsViewFull">
      <phonebox v-model:visible="showphone"></phonebox>
    </el-collapse-transition>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, watch, markRaw, ref } from "vue";
import NavBar from "@/layout/navBars/defaults.vue";
import NavMenu from "@/layout/navMenus/defaults/index.vue";
import AppMain from "@/layout/appMain/defaults/index.vue";
import phonebox from "@/components/PhoneCall/phone.vue";
import Watermark from "@/utils/wartermark";
import CloseFull from "@/layout/components/defaults/closeFull.vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router";
import { useDepartment } from "@/hooks/useDepartment";

export default defineComponent({
  name: "layoutDefaults",
  components: {
    NavBar: markRaw(NavBar),
    NavMenu: markRaw(NavMenu),
    AppMain: markRaw(AppMain),
    CloseFull,
    phonebox,
  },
  setup() {
    let showphone = ref<boolean>(false);
    const store = useStore();
    const route = useRoute();
    const getThemeConfig = computed(() => {
      return store.state.themeConfig.themeConfig;
    });
    if (route.query.tagClose) {
      store.state.tagsViewRoutes.isTagsViewCurrenFull = true;
      store.state.themeConfig.themeConfig.isTagsView = false;
    }

    const handlerClickSider = () => {
      store.dispatch("themeConfig/toggleSideBar");
    };
    const onWartermarkChange = () => {
      let { name } = useDepartment();
      getThemeConfig.value.isWarteMark ? Watermark.set(name) : Watermark.del();
    };
    const isTagsViewFull = computed(
      () => !store.state.tagsViewRoutes.isTagsViewCurrenFull
    );
    onMounted(() => {
      onWartermarkChange();
    });
    watch(
      () => getThemeConfig.value.isWarteMark,
      (val) => {
        onWartermarkChange();
      },
      {
        deep: true,
      }
    );
    return {
      getThemeConfig,
      handlerClickSider,
      onWartermarkChange,
      isTagsViewFull,
      showphone,
    };
  },
});
</script>
<style lang="scss">
.app-wrapper {
  width: 100%;
  height: 100%;
  float: left;
  background-color: var(--sh3h-background-color);
}
</style>
