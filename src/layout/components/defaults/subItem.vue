<template>
  <template v-for="val in chils">
    <el-sub-menu
      :index="val.path"
      :key="val.path"
      v-if="val.children && val.children.length > 0"
    >
      <template #title>
        <span
          :class="['sh3h-icon', val.meta.icon ? '' : 'w_20']"
          v-show="getThemeConfig.isMenuIcon"
        >
          <svg-icon :icon-name="val.meta.icon" class-name="icon" />
        </span>
        <span class="sh3h-font">{{ val.meta.title }}</span>
        <el-badge
          v-if="val.meta.caseNum > 0"
          :value="val.meta.caseNum"
          class="item sh3h-badge"
        />
      </template>
      <sub-item :chil="val.children" />
    </el-sub-menu>
    <template v-else>
      <el-menu-item
        :index="val.path"
        :route="{ path: val.path, query: val.query }"
        :key="val.path"
        v-if="!val.meta.isLink || (val.meta.isLink && val.meta.isIframe)"
      >
        <span
          :class="['sh3h-icon', val.meta.icon ? '' : 'w_20']"
          v-show="getThemeConfig.isMenuIcon"
        >
          <svg-icon :icon-name="val.meta.icon" class-name="icon" />
        </span>
        <span class="sh3h-font">{{ val.meta.title }}</span>
        <el-badge
          v-if="val.meta.caseNum > 0"
          :value="val.meta.caseNum"
          class="item sh3h-badge"
        />
      </el-menu-item>
      <template v-else>
        <el-menu-item disabled class="jumpUrl">
          <span
            :class="['sh3h-icon', val.meta.icon ? '' : 'w_20']"
            v-show="getThemeConfig.isMenuIcon"
          >
            <svg-icon :icon-name="val.meta.icon" class-name="icon" />
          </span>
          <a :href="val.meta.isLink" target="_blank" rel="opener" class="sh3h-font link">
            <SvgIcon :name="val.meta.icon" />
            {{ val.meta.title }}
          </a>
        </el-menu-item>
      </template>
    </template>
  </template>
</template>

<script lang="ts">
import { useStore } from "@/store";
import { computed, defineComponent } from "vue";
interface Meta {
  nodeCode: string;
  flag: string;
  flowName: string;
}
export default defineComponent({
  name: "navMenuSubItem",
  props: {
    chil: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const store = useStore();
    // 获取父级菜单数据
    const chils = computed(() => {
      return <any>props.chil;
    });
    const getThemeConfig = computed(() => {
      return store.state.themeConfig.themeConfig;
    });

    return {
      chils,
      getThemeConfig,
    };
  },
});
</script>
<style scoped lang="scss">
.sh3h-icon {
  width: 15px;
  height: 15px;
  float: left;
  fill: var(--sh3h-menu-font-color);
  @include flex-box(center, center);
  margin-right: 5px;
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
.sh3h-badge {
  display: flex;
  margin-left: 10px;
}
.w_20 {
  width: 15px !important;
}
.link {
  color: var(--el-menu-text-color);
}
.jumpUrl {
  opacity: 1 !important;
  cursor: pointer !important;
}
</style>
