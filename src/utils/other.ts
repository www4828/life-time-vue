import { App, nextTick } from "vue";
import * as svg from "@element-plus/icons-vue";
import SvgIcon from '@/components/svgIcon/index.vue';
import SvgIconDefault from '@/components/svgIcon/default.vue';
import { store } from "@/store";
import router from "@/router";
import { Local } from "./storage";

/**
 * 导出全局注册 element plus svg 图标
 * @param app vue 实例
 * @description 使用：https://element-plus.gitee.io/zh-CN/component/icon.html
 */
 export function elSvg(app:App) {
	const icons = svg as any;
	for (const i in icons) {
		app.component(`ele-${icons[i].name}`, icons[i]);
	}
	app.component('SvgIcon', SvgIcon);
	app.component('svg-icon',SvgIconDefault);
} 
 
/**
 * 设置浏览器标题国际化
 * @method const title = useTitle(); ==> title()
 */
 export function useTitle() {
	nextTick(() => {
		let webTitle = '';
		let globalTitle: string = store.state.themeConfig.themeConfig.globalTitle;
        router.currentRoute.value.path === '/login'
        ? (webTitle = router.currentRoute.value.meta.title as any)
        : (webTitle = router.currentRoute.value.meta.title as any);
		// router.currentRoute.value.path === '/login'
		// 	? (webTitle = router.currentRoute.value.meta.title as any)
		// 	: (webTitle = i18n.global.t(router.currentRoute.value.meta.title as any));
		document.title = `${webTitle} - ${globalTitle}` || globalTitle;
	});
}
/**
 * 图片懒加载
 * @param el dom 目标元素
 * @param arr 列表数据
 * @description data-xxx 属性用于存储页面或应用程序的私有自定义数据
 */
 export const lazyImg = (el: any, arr: any) => {
	const io = new IntersectionObserver((res) => {
		res.forEach((v: any) => {
			if (v.isIntersecting) {
				const { img, key } = v.target.dataset;
				v.target.src = img;
				v.target.onload = () => {
					io.unobserve(v.target);
					arr[key]['loading'] = false;
				};
			}
		});
	});
	nextTick(() => {
		document.querySelectorAll(el).forEach((img) => io.observe(img));
	});
};

/**
 * 全局组件大小
 * @returns 返回 `window.localStorage` 中读取的缓存值 `globalComponentSize`
 */
 export const globalComponentSize: string = Local.get('themeConfig')?.globalComponentSize || store.state.themeConfig.themeConfig?.globalComponentSize;

 /**
  * 对象深克隆
  * @param obj 源对象
  * @returns 克隆后的对象
  */
 export function deepClone(obj: any) {
     let newObj: any;
     try {
         newObj = obj.push ? [] : {};
     } catch (error) {
         newObj = {};
     }
     for (let attr in obj) {
         if (typeof obj[attr] === 'object') {
             newObj[attr] = deepClone(obj[attr]);
         } else {
             newObj[attr] = obj[attr];
         }
     }
     return newObj;
 }

 /**
 * 判断数组对象中所有属性是否为空，为空则删除当前行对象
 * @description
 * @param list 数组对象
 * @returns 删除空值后的数组对象
 */
export function handleEmpty(list: any) {
	const arr = [];
	for (const i in list) {
		const d = [];
		for (const j in list[i]) {
			d.push(list[i][j]);
		}
		const leng = d.filter((item) => item === '').length;
		if (leng !== d.length) {
			arr.push(list[i]);
		}
	}
	return arr;
} 

const other = {
	elSvg: (app: App) => {
		elSvg(app);
	},
	useTitle: () => {
		useTitle();
	},
	lazyImg: (el: any, arr: any) => {
		lazyImg(el, arr);
	},
	globalComponentSize,
	deepClone: (obj: any) => {
		deepClone(obj);
	}, 
	handleEmpty: (list: any) => {
		return handleEmpty(list);
	},
};

// 统一批量导出
export default other;