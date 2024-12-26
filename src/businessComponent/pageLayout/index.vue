<template>
  <div class="page-layout-container">
    <!-- <div class="page-layout-search-box">
      <div class="page-layout-search-box-wrap"><slot name="search"></slot></div>
      
    </div> -->
    <div class="page-layout-button-box">
      <!-- <Title title="数据列表"><div class="page-layout-button-box-wrap"><slot name="button"></slot></div></Title> -->
      <!-- <div class="page-layout-button-box-title">数据列表</div> -->
      <div class="page-layout-button-box-wrap"><slot name="button"></slot></div>
    </div>
    <div class="page-layout-table-box" ref="pageBox">
      <slot name="table"></slot>
    </div>
    <div class="page-layout-pagination-box">
      <slot name="pagination"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
import Title from '@/components/Title/Title.vue';

</script>
<style lang="scss" scoped> 
.page-layout {
  &-container {
    width: 100%;
    height: 100%;
    border: 0px solid red;
    box-sizing: border-box;
  }
  &-search-box{
    margin-bottom: 10px;
    
    &-title{
      @include fontStyle(var(--lt-font-family-medium), $font-size-14,  var(--lt-theme-color));
      margin-bottom: 10px;
    }
  }
  &-button-box {
    // background-color: #fff;
    width: 100%;
    // height: 50px;
    border: 0px solid green;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    &-wrap{
      display: flex;
      align-items: center;
      // margin-left: 10px;
      ::v-deep(.el-button){
      // border: 0;
      // background-color: #fff;
      // padding: 10px 25px;
      // color: var(--lt-gs-active-font-color);
    }
    }
    &-title{
      @include fontStyle(var(--lt-nt-family-medium), $font-size-14,  var(----lt-e-color));
      margin-right: 20px;
    }
    
  }
  &-table-box {
    width: 100%;
    height: calc(100% - 100px);
    border: 0px solid blueviolet;
    box-sizing: border-box;
    // background-color: #fff;
    // padding: 10px;
    box-sizing: border-box;
  }
  &-pagination-box {
    width: 100%;
    // height: 60px;
    border: 0px solid blue;
    box-sizing: border-box;
    background-color: var(--lt-tree-background-color);
    padding: 5px 0;
    // background-color: #fff
  }
}
::v-deep(.el-table th.el-table__cell) {
  -webkit-user-select: none;
  user-select: none;
  //background-color: var(--lt-ckground-color);
}
::v-deep(.el-table thead ){
  color: var(--lt-eme-color); 
}
</style>