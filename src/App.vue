<template>
  <router-view />
</template>
<style lang="scss">
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: SourceHanSansCN-Medium, SourceHanSansCN-Normal, SourceHanSansCN-Bold,
    gothic-13;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  font-size: 50px;
  overflow: hidden;
  position: relative;
  padding-right: 0px !important;
  .stepDetailDialog {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    .el-dialog__header {
      padding: 10px 20px;
      border-bottom: 0;
    }
    .el-dialog__body {
      padding-top: 10px;
      padding-bottom: 20px;
    }
    .el-dialog__headerbtn {
      top: 0;
    }
  }
}
</style>
