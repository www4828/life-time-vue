<template>
	<div class="layout-footer">
		<div class="layout-footer-warp"> 
            {{getThemeConfig.footerText}}
		</div>
	</div>
</template>

<script lang="ts">
import { useStore } from '@/store';
import { toRefs, reactive, defineComponent,computed } from 'vue';
import { onBeforeRouteUpdate } from 'vue-router';
export default defineComponent({
	name: 'layoutFooter',
	setup() {
		const store=useStore();
		const state = reactive({
			isDelayFooter: true,
		});
		// 获取布局配置信息
		const getThemeConfig = computed(() => {
			return store.state.themeConfig.themeConfig;
		});
		// 路由改变时，等主界面动画加载完毕再显示 footer
		onBeforeRouteUpdate(() => {
			setTimeout(() => {
				state.isDelayFooter = false;
				setTimeout(() => {
					state.isDelayFooter = true;
				}, 800);
			}, 0);
		});
		return {
			getThemeConfig,
			...toRefs(state),
		};
	},
});
</script>

<style scoped lang="scss">
.layout-footer {
	width: 100%;
    height: $footer-height;
    float: left;
	background: var(--lt-footer-background-color); 
    box-shadow: -1px -1px 5px var(--lt-adow-color);
    @include flex-box(center,center);
    
	&-warp { 
        width: auto; 
        height: 100%;
        line-height:$footer-height ;
        float: left;
		color: var(--lt-oter-font-color);
        font-size: $font-size-14;
        font-family: SourceHanSansCN-Medium; 
		animation: error-num 1s ease-in-out;
        
	}
}
</style>
