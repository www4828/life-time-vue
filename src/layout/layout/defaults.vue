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
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, watch, markRaw, ref } from "vue";
import NavBar from "@/layout/navBars/defaults.vue";
import NavMenu from "@/layout/navMenus/defaults/index.vue";
import AppMain from "@/layout/appMain/defaults/index.vue";
import Watermark from "@/utils/wartermark";
import CloseFull from "@/layout/components/defaults/closeFull.vue";
import { useStore } from "@/store";
import { useRoute } from "vue-router";
 

export default defineComponent({
  name: "layoutDefaults",
  components: {
    NavBar: markRaw(NavBar),
    NavMenu: markRaw(NavMenu),
    AppMain: markRaw(AppMain),
    CloseFull
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
    
    const isTagsViewFull = computed(
      () => !store.state.tagsViewRoutes.isTagsViewCurrenFull
    );
    onMounted(() => {
      
    });
    watch(
      () => getThemeConfig.value.isWarteMark,
      (val) => {
         
      },
      {
        deep: true,
      }
    );
    return {
      getThemeConfig,
      handlerClickSider, 
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
  background-color: var(--lt-background-color);
}
</style>
