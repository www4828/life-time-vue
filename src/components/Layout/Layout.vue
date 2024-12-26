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
      <div class="button">
        <slot name="button"></slot>
      </div>

      <div class="content">
        <slot name="content"></slot>
      </div>
      <div class="bottom">
        <slot name="bottom"></slot>
        
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
  border: 1px solid var(--lt-tree-border-color);
  background-color: var(--lt-tree-background-color);
}
.Layout {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--lt-breadcrumb-background-color);
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
      // border-top: 1px solid var(--lt-tree-border-color);
    }
  }
  .contentWrapper {
    margin-left: $margin ;
    width: calc(100% - $leftWidth - $margin);
    @extend .color;
    .button {
      display: flex;
      height: 50px;
      padding: $padding10;
      box-sizing: border-box;
    }
    .content {
      padding: $padding10 $margin;
      
      box-sizing: border-box;
      height: calc(100% - 100px);
    }
    .bottom {
      width:100%;
      display: flex;
      justify-content: flex-end;
      // height: 50px;
      padding: $padding10;
      box-sizing: border-box;
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
