<template>
    <div class="setting-container ">
        <Scrollbar>
             <div class="sh3h-tab border-radius-16" @click="handleClick">
                 <div :class="['tab-list',!activeName?'active':'']">
                     <div class="tab-item left" >
                         <div class="text">
                             系统布局设置
                         </div>
                     </div>
                     <div class="tab-item right">
                        <div class="text">
                            系统专题设置
                        </div>
                     </div>
                 </div>
             </div>
             <div class="sh3h-tab-content "></div>
        </Scrollbar>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue"
import Scrollbar from "@/components/scrollbar/index.vue";
export default defineComponent({
    name: "Home",
    components: {
         Scrollbar
    },
    setup() {
        const activeName = ref(false);

        const handleClick = ( ) => {
             activeName.value=!activeName.value;
        }
        return {
            activeName,
            handleClick
        }
    }
});
</script>
<style scoped lang="scss">
.setting-container {
    width: 100%;
    height: 100%;
    float: left;
}
$borderRadius: 22px;
.border-radius-16{
    border-radius: 16px 16px 0 0;
}
.sh3h-tab {
    width: 100%;
    height: 40px;
    position: relative;
    overflow: hidden; 
    &:after,
    &:before {
        content: "";
        height: 20px;
        position: absolute;
        width: 100%;
        z-index: 1;
    }
    &:before {
        top: 0;
        background:var(--sh3h-theme-background-color);
    }
    &:after {
        bottom: 0;
        background: var(--sh3h-theme-color-light-1);
    }
    .tab-list {
        display: block;
        width: 100%;
        height: 100%;
        font-size: 0;
        line-height: 0;
        position: relative;
        z-index: 11;
        margin: 0 -20px;
        padding: 0 20px;
        transform: skewX(10deg);
        &.active {
            transform: skewX(-10deg);
            .tab-item .text {
                transform: skewX(10deg);
            }
            .tab-item.left {
                border-bottom-right-radius: $borderRadius;
                border-top-right-radius: 0;
                background:var(--sh3h-theme-background-color);
                .text {
                    color:  var(--sh3h-theme-color-light-1);                    
                }
            }
            .tab-item.right {
                border-top-left-radius: $borderRadius;
                background: var(--sh3h-theme-color-light-1);
                border-bottom-left-radius: 0;
                .text {
                    color:  var(--sh3h-theme-background-color); 
                }
            }
        }
    }
    .tab-item {
        width: 50%;
        height: 40px;
        display: inline-block;
        vertical-align: top;
        .text {
            display: block;
            width: 100%;
            height: 100%;
            transform: skewX(-10deg);
            line-height: 40px;
            font-size:var(--el-font-size-base);
            font-family:var(--sh3h-font-family-medium) ;
            text-align: center;
            user-select: none;
        }
        &.left {
            background: var(--sh3h-theme-color-light-1);
            color: var(--sh3h-theme-background-color); 
            border-top-right-radius: $borderRadius;
        }
        &.right {
            background:var(--sh3h-theme-background-color);
            color: var(--sh3h-theme-color-light-1);
            border-bottom-left-radius: $borderRadius;
        }
    }
} 

.sh3h-tab-content{
  width: 100%;
  height: calc(100% - 40px);
  float: left;
  background: var(--sh3h-theme-background-color);
  margin: 0 0 0 0;
}

</style>