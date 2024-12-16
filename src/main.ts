import { createApp } from 'vue';
import App from './App.vue';
import router from "./router";
import ElementPlus from 'element-plus'; 
import 'element-plus/dist/index.css'; 
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import mitt from 'mitt'; 
import other from "@/utils/other"; 
import { store, key } from '@/store';  
import 'xe-utils'
import { onPerClick } from '@/utils/permission'
import SliderVerify from 'slider-verify-v3'
import 'slider-verify-v3/lib/SliderVerify.css'
import layer from '@layui/layer-vue';
import '@layui/layer-vue/lib/index.css';


const app=createApp(App);
other.elSvg(app);
// app.use(NumberKeyboard)
app.use(router).use(store,key).use(ElementPlus, {
  locale: zhCn,
}).use(SliderVerify).use(layer).mount("#app");
app.config.globalProperties.mittBus = mitt(); 
app.config.globalProperties.$onPerClick = onPerClick
 