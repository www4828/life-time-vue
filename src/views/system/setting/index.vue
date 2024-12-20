<template>
    <div class="wrapper">
      <div class="tab-box">
        <el-tabs
            v-model="activeName"
            tab-position="top"
            type
            class="demo-tabs"
            @tab-click="handleClick"
        >
            <el-tab-pane label="布局设置" name="first">
              <LayoutSetting />
            </el-tab-pane>
            <el-tab-pane label="样式设置" name="second">
              <ThemeSetting />
            </el-tab-pane>
          </el-tabs>
      </div>
      
          <!-- <ThemeSetting /> -->
          <!-- <LayoutSetting /> -->
      <!-- <component :is="currentComponents" /> -->
    </div>
</template>
<script lang="ts" setup>
import { defineComponent, ref } from "vue"
import Scrollbar from "@/components/scrollbar/index.vue";
import LayoutSetting from "@/views/system/setting/layout/index.vue";
import ThemeSetting from "@/views/system/setting/theme/index.vue";
import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import type { TabsPaneContext } from 'element-plus'
const activeName = ref('second') 
const handleClick = (tab: any, event: Event) => {
    console.log(tab, event)
}
</script>
<style scoped lang="scss"> 
.wrapper {
    width: 100%;
    height: 100%;
    background-color: #fff;
    padding: 0 10px 10px;
    box-sizing: border-box;
    .tab-box {
        width: calc(100% - 50px);
        // width: 100%;
        height: calc(100%);

        ::v-deep(.el-tabs) {
            height: 100%;
        }
        ::v-deep(.el-tabs__content) {
            height: calc(100% - 60px);
            // height: 100%;
        }
        ::v-deep(.el-tab-pane) {
            height: 100%;
        }
    }
}
</style>