<template>
    <div class="screenfull" @click="click">
        <el-tooltip class="item" :content="!isScreenfull?'全屏':'退出全屏'" placement="bottom">
            <svg-icon iconName="fullscreen" class="fullscreen" v-if="!isScreenfull" />
            <svg-icon iconName="fullscreen-exit" class="fullscreen-exit" v-else />
        </el-tooltip>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { ElMessage } from 'element-plus';
import screenfull from "screenfull";

export default defineComponent({
    name: "Screenfull",
    components: {},
    setup() {
        const isScreenfull = ref(false);
        const click = () => {
            if (!screenfull.isEnabled) {
                ElMessage.warning('暂不不支持全屏');
                return false;
            }
            screenfull.toggle();
            screenfull.on('change', () => {
                isScreenfull.value = screenfull.isFullscreen;
            });

        }

        return {
            click,
            isScreenfull
        }
    }
})
</script>
<style lang="scss" scoped>
.screenfull {
    width: auto;
    height: 100%;
    float: left;
    @include flex-box(center, center);

    .fullscreen {
        width: 20px;
        height: 20px;
        float: left;
        fill: var(--sh3h-head-font-color);
    }
    .fullscreen-exit {
        width: 23px;
        height: 23px;
        float: left;
        fill: var(--sh3h-head-font-color);
    }
}
</style>