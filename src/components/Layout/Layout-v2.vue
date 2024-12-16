<template>
  <div class="Layout">
    <div class="treeWrapper" :style="{
      width: props.leftWidth
    }">
      <div class="search">
        <slot name="search"></slot>
      </div>
      <Scrollbar class="tree">
        <slot name="tree"></slot>
      </Scrollbar>
    </div>
    <div class="contentWrapper">
      <div class="content">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Scrollbar from "@/components/scrollbar/index.vue";
const props = defineProps({
  leftWidth: String,
  right: Boolean
})
</script>
<style lang="scss" scoped>
$margin: 20px;
$padding: 22px;
$padding10: 10px;
$leftWidth: 350px;
.color {
  border: 1px solid var(--sh3h-tree-border-color);
  background-color: var(--sh3h-tree-background-color);
}
.Layout {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--sh3h-breadcrumb-background-color);
  padding: $margin;
  box-sizing: border-box;
  .treeWrapper {
    display: flex;
    flex-direction: column;
    width: $leftWidth;
    @extend .color;
    // .search {
    //   display: flex;
    //   padding: $padding $padding 0 $padding;
    // }
    .tree {
      flex: 1;
      max-height: 100%;
      // margin: $padding;
      // padding-top: $margin;
      // border-top: 1px solid var(--sh3h-tree-border-color);
    }
  }
  .contentWrapper {
    // margin-left: $margin ;
    flex: 1;
    // @extend .color;
    .content {
      // border: 1px solid var(--sh3h-tree-border-color);
      padding: 0;
      margin: 0 $margin;
      
      box-sizing: border-box;
      height: 100%;
    }
  }
  .rightWrapper {
    margin-left: $margin ;
    flex: 1;
    // @extend .color;
    .button {
      display: flex;
      margin-bottom: $margin;
    }
    .content {
      padding: $padding10 $margin $margin;
      @extend .color;
      box-sizing: border-box;
      height: calc(100% - 50px);
    }
  }
}
</style>
