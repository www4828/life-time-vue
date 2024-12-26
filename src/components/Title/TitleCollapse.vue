<template>
  <el-collapse v-model="activeNames" v-if="props.isDefaultShow">
    <el-collapse-item name="1">
      <template #title>
        <div class="titleWrapper" :class="props.align">
          <div class="title">{{ props.title }}</div>
          <slot />
        </div>
      </template>
      <slot name="content" />
    </el-collapse-item>
  </el-collapse>
  <slot name="content" v-else />
</template>
<script lang="ts" setup>
import { ref } from "vue";
type Align = "space-between" | "flex-start";
const props = withDefaults(
  defineProps<{ title: string; align?: Align; isDefaultShow?: boolean }>(),
  {
    title: "",
    align: "space-between",
    isDefaultShow: true,
  }
);
const activeNames = ref(["1"]);
</script>

<style lang="scss" scoped>
.el-collapse {
  width: 100%;
  border: 0;
  background-color: rgba($color: #000000, $alpha: 0);
  ::v-deep(.el-collapse-item__header) {
    background-color: rgba($color: #000000, $alpha: 0);
    border: 0;
    height: 20px;
    margin-bottom: 10px;
  }
  ::v-deep(.el-collapse-item__wrap) {
    background-color: rgba($color: #000000, $alpha: 0);
    border: 0;
  }
}
::v-deep(.el-collapse-item__arrow) {
  color: var(--lt-menu-active-font-color);
  border: 1px solid var(--lt-nu-active-font-color);
  padding: 2px;
  border-radius: 50%;
  &.el-icon {
    width: auto;
    height: auto;
  }
}
.titleWrapper {
  display: flex;
  justify-content: space-between;
  height: 20px;
  @include fontStyle(
    var(--lt-nt-family-medium),
    $font-size-18,
    var(--lt-eme-color)
  );
  font-weight: bold;
  // margin-bottom: 20px;
  &.flex-start {
    justify-content: flex-start;
  }
  .title {
    // position: relative;
    // left: 20px;
    margin-right: 50px;
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
</style>
