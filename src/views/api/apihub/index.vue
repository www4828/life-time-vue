<template>
  <ApiInfo v-if="state.formData?.apiBaseInfo?.apiCode" :formData="state.formData" />
  <ApiHub v-else @showInfo="showInfo"/>
</template>
<script scoped lang="ts" setup>
import { reactive, ref } from 'vue'
import ApiHub from './apiHub.vue';
import ApiInfo from './apiInfo.vue';
import { ApiModel } from '@/api/model/apiModel';
import { cloneDeep } from 'lodash-es';

const state = reactive({
  formData: {apiBaseInfo:{apiCode:'1'}} as ApiModel
})

const showInfo = (item: ApiModel)=>{
  state.formData = cloneDeep(item)
}

</script>
<style lang="scss" scoped>
.tree_container {
  height: 100%;

  .tree {
    height: calc(100% - 70px);
  }

  .header-search {
    padding: 10px 20px 0;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;

    .header-left {
      color: var(--lt-historyCase-value-color);
      font-size: 14px;
      display: flex;
      align-items: center;

      .el-icon {
        color: var(--el-color-primary);
        margin: 2px 5px 0 0;
      }
    }
  }

  .split-line {
    margin-top: 10px;
  }
}

.hub-search{
  width: 100%;
  display: flex;
  justify-content: center;
  .el-input{
    height: 40px;
    ::v-deep(.el-input__wrapper){
      border-radius: 10px 0 0 10px;
      border: 2px solid var(--el-color-primary);
      // box-shadow: rgba( var(--el-color-primary), 0.2) 0px 4px 12px;
      box-shadow: rgba( #2E75D2, 0.2) 0px 4px 12px;
    }
    ::v-deep(.el-input-group__append){
      border-radius: 0 10px 10px 0;
      border: 2px solid var(--el-color-primary);
      background-color: var(--el-color-primary);
      box-shadow: rgba( #2E75D2, 0.2) 0px 4px 12px;
      box-sizing: border-box;
      color: var(--lt-head-font-color);
      .el-button{
        display: flex;
        align-items: center;

      }
    }
  }
}

.hub-content{
  padding: 20px;
  height: calc(100% - 80px);
  box-sizing: border-box;
  display: flex;
  overflow-y: auto;
  .item{
    width: 30%;
    height: 180px;
    margin-right: 30px;
    box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px;
    border-radius: 10px;
    background-color: var(--lt-head-font-color);
    position: relative;
    padding: 20px 20px 40px;
    box-sizing: border-box;
    font-size: 16px;
    i{
      width: 18px;
      height: 18px;
      &.interface{
        background: url("@/assets/api/interface.png") center/ 100% 100%;
        position: absolute;
        top: 25px;
        left: 20px;
      }
      &.group{
        margin-right: 5px;
        background: url("@/assets/api/group.png") center/ 100% 100%;
      }
    }
    .apiName{
      padding-left: 30px;
      margin-bottom: 10px;
    }
    .count,.des{
      font-size: 14px;
      font-family: Arial, Helvetica, sans-serif;
      padding-left: 30px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      color: var(--lt-label-form-color);
      .el-icon{
        margin-right: 10px;
      }
    }
    .des{
      padding-left: 30px;
    }
    .item-botton{
      position: absolute;
      width: calc(100% - 40px);
      bottom: 20px;
      display: flex;
      justify-content: space-between;
      color: var(--lt-label-form-color);
      font-family: Arial, Helvetica, sans-serif;
      .apiGroup{
        display: flex;
        align-items: center;
      }
      .el-link{
        ::v-deep(.el-icon){
          font-size: 18px;
        }
      }
    }
  }
}
</style>
