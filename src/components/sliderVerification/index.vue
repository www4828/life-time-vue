<template>
	<div class="slider-verification" ref="sliderContainer">
		<div class="slider-left-bg" :style="sliderLeftWidthStyle"></div>
		<div class="prompt-text" :style="verifySuccess ? promptTextStyleSuccess: {}">
			{{ verifySuccess ? '验证通过' : '向右拖动滑块进行验证' }}
		</div>
		<div ref="slider" @mousedown="mouseDownHandler($event)"
		     :class="{'slider-verify-success':verifySuccess}"
		     class="slider"
		     :style="sliderToLeftStyle"></div>
	</div>
</template>

<script lang="ts"> 
import {defineComponent, ref, onMounted} from 'vue';

	/**
	 * 组件名称：
	 * 组件描述：
	 */
	export default defineComponent({
		name: 'SliderVerification',
		components: {},
		props: {
			/**
			 * 验证成功提示文字样式
			 */
			promptTextStyleSuccess: {
				type: Object,
				default: {
					color: '#ffffff'
				}
			},
			/**
			 * 验证成功需要拖动距离倍数，倍数越大验证成功需要拖动的距离越大
			 */
			multiple: {
				type: Number,
				default: 2
			},
		    success:{
				type:Function,
				default:(statue:boolean)=>{

				} 
			}
		},
		setup(props, context) {
			let sliderState = ref(false)
			let verifySuccess = ref(false)
			let beginClientX = ref(0)
			let maxWidth = ref(0)
			const slideWidth = ref(0)
			const mouseMoveHandler = (e:any) => {
				if (sliderState.value) {
					let width = (e.clientX - beginClientX.value) / props.multiple;
					if (width > 0 && width <= maxWidth.value) {
						slideWidth.value = width
					} else if (width > maxWidth.value) {
						slideWidth.value = maxWidth.value
						verifySuccessFun();
					}
				}
			}
			const moseUpHandler = (e:any) => {
				sliderState.value = false;
				let width = (e.clientX - beginClientX.value) / props.multiple;
				if (width < maxWidth.value) {
					slideWidth.value = 0
				}
			}
			const verifySuccessFun = () => {
				verifySuccess.value = true
				// context.emit('statusChange', true)
				document.getElementsByTagName('html')[0].removeEventListener('mousemove', mouseMoveHandler);
				document.getElementsByTagName('html')[0].removeEventListener('mouseup', moseUpHandler);
				slideWidth.value = maxWidth.value
				props.success(verifySuccess.value);
			}
			const slider = ref<HTMLDivElement | null>(null)
			const sliderContainer = ref<HTMLDivElement | null>(null)
			onMounted(() => {
				maxWidth.value = sliderContainer?.value!.offsetWidth - slider.value!.offsetWidth;
				addListener()
			})
			const addListener = () => {
				document.getElementsByTagName('html')[0].addEventListener('mousemove', mouseMoveHandler);
				document.getElementsByTagName('html')[0].addEventListener('mouseup', moseUpHandler)
			}
			return {
				sliderContainer, slider,
				beginClientX, // 鼠标按下的位置
				sliderState,     // 滑块是否可以移动
				maxWidth,// 滑块验证成功需要移动的最大距离
				verifySuccess,  // 是否验证成功
				slideWidth, // 滑块滑过的区域宽度
				reset() { // 重置
					addListener()
					context.emit('statusChange', false)
					beginClientX.value = 0
					sliderState.value = false
					verifySuccess.value = false
					slideWidth.value = 0
				},
				mouseDownHandler(e:any) { // 鼠标在滑块上按下事件
					if (!verifySuccess.value) {
						sliderState.value = true;
						beginClientX.value = e.clientX;
					 
						props.success(verifySuccess.value);
					}
				},
			}
		},
		computed: {
			sliderToLeftStyle() {
				return {
					left: this.slideWidth + 'px'
				}
			},
			sliderLeftWidthStyle() {
				return {
					width: this.slideWidth + 'px'
				}
			}
		}
	});
</script>
<style scoped lang="scss">

	.slider-verification {
		position: relative;
		background-color: #dbdde4;
		width: 100%;
		height: 100%; 
		user-select: none;
	}

	.slider {
		position: absolute;
		top: 0;
		width: 42px;
		height: 100%;
		cursor: move;
		background: rgb(144 145 147) url("data:image/png;base64,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") no-repeat center;
		background-size: 30px 30px;
	}

	.slider-verify-success {
		background: #08193a url("data:image/png;base64,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") no-repeat center;
		background-size: 30px 30px;
	}

	//滑块滑过区域的样式
	.slider-left-bg {
		background-color: rgb(8 25 55 / 70%);
		width: 0;
		height: 100%;
	}

	//提示文本样式
	.prompt-text {
		position: absolute;
		top: 0px;
		width: 100%;
		height: 100%; 
		font-size: 30px;  
		color:rgb(144 145 147 / 70%);
		font-family: SourceHanSansCN-Medium;
		display: flex;
		justify-content: center;
		align-items: center;
		 
	}
</style>

