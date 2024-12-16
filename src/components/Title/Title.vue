<template>
  <div class="title-box">
    <div class="titleWrapper" :class="props.align">
      <div class="title">{{ props.title }}</div>
      <slot />
    </div>
    <Scrollbar class="title-content-wrap">
      <slot name="content" />
    </Scrollbar>
  </div>
</template>
<script lang="ts" setup>
import Scrollbar from "@/components/scrollbar/index.vue";
type Align = "space-between" | "flex-start";
const props = withDefaults(defineProps<{ title?: string; align?: Align }>(), {
  title: "",
  align: "space-between",
});
</script>

<style lang="scss" scoped>
.title-box{
  height: 100%;
}
.titleWrapper {
  display: flex;
  justify-content: space-between;
  height: 20px;
  align-items: center;
  @include fontStyle(
    var(--sh3h-font-family-medium),
    $font-size-18,
    var(--sh3h-theme-color)
  );
  font-weight: bold;
  margin-bottom: 10px;
  &.flex-start {
    justify-content: flex-start;
  }
  .title {
    // position: relative;
    // left: 20px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    &::before {
      // position: absolute;
      // left: -10px;
      // top: 50%;
      content: "";
      width: 3px;
      height: 18px;
      background-color: var(--el-color-primary);
      // transform: translateY(-50%);
      display: block;
      margin-right: 10px;
    }
  }
}
.title-content-wrap{
  width: 100%;
  height: calc(100% - 30px)
}
</style>
