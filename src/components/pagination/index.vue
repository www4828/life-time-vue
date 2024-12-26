<template>
  <div class="pagination-container">
    <el-pagination
      :currentPage="props.currentPage"
      :page-size="props.pageSize"
      :background="props.background"
      :layout="props.layout"
      :total="props.total"
      :page-sizes="props.pageSizes"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      popper-class="test"
    >
      <div class="solt div-flex-row">
        <div class="input div-flex-row sh3h-text">
          <span>
            共{{ props.total }}条{{ Math.ceil(props.total! / props.pageSize!) }}页,当前{{
              props.currentPage
            }}/{{ Math.ceil(props.total! / props.pageSize!) }}
          </span>
          <span class="p_l_10">跳转至：</span>
          <el-input-number
            v-model="backParams.currentPage"
            :min="1"
            :max="props.total"
            :controls="false"
            size="small"
            @change="change"
          />
        </div>
      </div>
      <el-button type="primary" size="small" @click="change">GO</el-button>
    </el-pagination>
  </div>
</template>
<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    pageSizes?: any;
    currentPage?: number;
    pageSize?: number;
    total?: number;
    background?: boolean;
    layout?: string;
    callBack: Function;
  }>(),
  {
    pageSizes: [10, 20, 50, 100],
    currentPage: 1,
    pageSize: 10,
    total: 0,
    background: true,
    layout: "sizes,prev,pager,next,slot",
    callBack: () => {},
  }
);

let backParams = {
  currentPage: props.currentPage,
  pageSize: props.pageSize,
};
const handleSizeChange = (val: number) => {
  backParams.pageSize = val;
  if (val > 5) {
    sessionStorage.setItem("pageSize", val + "");
  }
  props.callBack(backParams);
};
const change = () => {
  props.callBack(backParams);
};
const handleCurrentChange = (val: number) => {
  backParams.currentPage = val;
  props.callBack(backParams);
};
</script>
<style lang="scss" scoped>
.pagination-container {
  // margin-top: 10px;
  overflow: hidden;

  .el-pagination {
    float: right;
  }

  .solt {
    margin-left: 10px;
    .input {
      margin-right: 20px;
      .el-input-number--small {
        width: 40px;
        display: flex;
        align-items: center;
      }
    }
  }
}
::v-deep(.el-pager li) {
  border-radius: var(--el-border-radius-base) !important;
}
::v-deep(.el-pagination button) {
  border: none;
  padding: 0 2px;
  font-weight: 700;
  background: var(--el-color-primary);
}
::v-deep(.el-pagination .el-select .el-input) {
  width: 100px;
}
::v-deep(.el-select .el-input .el-select__caret.el-icon) {
  color: var(--lt-theme-color);
}
::v-deep(.el-input__inner) {
  color: var(--lt-eme-color, var(--el-text-color-regular));
  font-size: var(--el-font-size-base);
  font-family: var(--lt-nt-family-medium);
}
.p_l_10 {
  padding-left: 10px;
}
.sh3h-text {
  color: var(--lt-eme-color);
  font-size: var(--el-font-size-base);
  font-family: var(--lt-nt-family-medium);
}
</style>
