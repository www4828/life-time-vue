<template>
  <component :is="getThemeConfig.layout" />
</template>
<script lang="ts">
import { defineComponent, onBeforeMount, markRaw } from "vue";
import defaults from "@/layout/layout/defaults.vue";
import { setRem } from "@/utils/rem";
import { useTheme } from "@/hooks/useTheme";
export default defineComponent({
  name: "",
  components: {
    defaults: markRaw(defaults),
  },
  setup() {
    const { getThemeConfig } = useTheme();
    onBeforeMount(() => {
      window.onresize = function () {
        setRem();
      };
    });
    return {
      getThemeConfig,
    };
  },
});
</script>
<style lang="scss"></style>
