<script lang="ts">
// 渲染函数：https://v3.cn.vuejs.org/guide/render-function.html
import { h, registerRuntimeCompiler, resolveComponent } from 'vue';

// 定义接口来定义对象的类型
interface SvgIconProps {
	name: string;
	size: number;
	color: string;
}

export default {
	name: 'svgIcon',
	props: {
		// svg 图标组件名字
		name: {
			type: String,
		},
		// svg 大小
		size: {
			type: Number,
			default: () => 14,
		},
		// svg 颜色
		color: {
			type: String,
		},
	},
	setup(props: SvgIconProps) { 
		const pxTorem=(px:number)=>{

			return px/192;

		}
		// 定义变量
		const linesString: any[] = ['https', 'http', '/src', '/icons', import.meta.env.VITE_PUBLIC_PATH];
		const onLineStyle: string = `font-size: ${pxTorem(props.size)}rem;color: ${props.color}`;
		const localsStyle: string = `width: ${pxTorem(props.size)}rem;height: ${pxTorem(props.size)}rem`;
		const eleSetStyle = { class: 'el-icon', style: onLineStyle };

		 

		// 逻辑判断
		if (props.name?.startsWith('ele-')) return () => h('i', eleSetStyle, [props.name === 'ele-' ? '' : h(resolveComponent(props.name))]);
		else if (linesString.find((str) => props.name?.startsWith(str))) return () => h('img', { src: props.name, style: localsStyle });
		else return () => h('i', { class: props.name, style: onLineStyle });
	},
};
</script>
