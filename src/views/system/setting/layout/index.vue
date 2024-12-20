<template>
    <div class="setting-layout-container">
        <Scrollbar>
          <el-form :model="getThemeConfig">
              <el-divider content-position="left">系统设置</el-divider>
              <el-form-item label="系统标题:">
                  <el-input v-model="getThemeConfig.globalTitle" />
              </el-form-item>
              <!-- <el-form-item label="系统子标题:">
                  <el-input v-model="getThemeConfig.globalViceTitle" />
              </el-form-item>-->
              <el-form-item label="系统布局:">
                  <el-select v-model="getThemeConfig.layout">
                      <el-option label="默认" value="defaults" />
                      <el-option label="经典" value="defaults" />
                  </el-select>
              </el-form-item>
              <el-form-item label="开启系统Logo:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isShowLogo" />
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="动画方式:">
                  <el-select v-model="getThemeConfig.animation">
                      <el-option label="右侧载入" value="slide-right" />
                      <el-option label="左侧载入" value="slide-left" />
                      <el-option label="渐隐渐入" value="opacitys" />
                  </el-select>
              </el-form-item>
              <el-form-item label="开启水印:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isWarteMark" />
                  </el-radio-group>
              </el-form-item>
              <el-divider content-position="left">菜单设置</el-divider>
              <el-form-item label="开启菜单图标:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isMenuIcon" />
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="开启菜单手风琴:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isUniqueOpened" />
                  </el-radio-group>
              </el-form-item>
              <el-divider content-position="left">面包屑设置</el-divider>
              <el-form-item label="开启面包屑:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isBreadCrumb" />
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="开启面包屑图标:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isBreadCrumbIcon"  :disabled="!getThemeConfig.isBreadCrumb"/>
                  </el-radio-group>
              </el-form-item>
              <el-divider content-position="left">标签设置</el-divider>
              <el-form-item label="开启标签:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isTagsView" />
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="标签样式:">
                  <el-select v-model="getThemeConfig.tagsStyle" :disabled="!getThemeConfig.isTagsView">
                      <el-option label="默认" value="default" />
                      <el-option label="经典" value="default" />
                  </el-select>
              </el-form-item>
              <el-form-item label="开启标签图标:" >
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isTagsViewIcon"  :disabled="!getThemeConfig.isTagsView"/>
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="开启标签缓存:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isCacheTagsView" :disabled="!getThemeConfig.isTagsView"/>
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="开启标签拖拽:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isSortableTagsView" :disabled="!getThemeConfig.isTagsView" />
                  </el-radio-group>
              </el-form-item>
              <el-divider content-position="left">底部设置</el-divider>
              <el-form-item label="开启底部:">
                  <el-radio-group>
                      <el-switch v-model="getThemeConfig.isFooter" />
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="底部信息:">
                  <el-input v-model="getThemeConfig.footerText" :disabled="!getThemeConfig.isFooter"/>
              </el-form-item> 
          </el-form>
        </Scrollbar>
        <el-button type="primary" >保存</el-button>
    </div>
</template>
<script lang="ts">
import { defineComponent, reactive, computed } from "vue"
import Scrollbar from "@/components/scrollbar/index.vue";
import { useStore } from "@/store";

export default defineComponent({
    name: "Setting",
    components: {
        Scrollbar
    },
    setup() {
        const store = useStore(); 
        const getThemeConfig = computed(() => {
            return store.state.themeConfig.themeConfig;
        });
        const onSubmit = () => {
            console.log('submit!')
        }
        return { 
            getThemeConfig,
            onSubmit

        }
    }
});
</script>
<style scoped lang="scss">
.setting-layout-container {
    width: calc(100%);
    height: calc(100%);
    position: relative;
    // background-color: #fff;
    
    ::v-deep(.el-divider){
      width: calc(100% - 80px);
    }
    ::v-deep(.el-form){
        display: flex;
        justify-content: center;
        align-items: center;
        flex-flow: column;
    }
    ::v-deep(.el-form-item){
         width: 60%;
    }
    .el-button{
      position: absolute;
      right: 10px;
      bottom: 10px;
    }
}
</style>