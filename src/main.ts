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

import layer from '@layui/layer-vue';
import '@layui/layer-vue/lib/index.css'; 
 
import MateChat from '@matechat/core'; 
import '@devui-design/icons/icomoon/devui-icon.css';
const app=createApp(App);
other.elSvg(app);
// app.use(NumberKeyboard)
app.use(router).use(store,key).use(ElementPlus, {
  locale: zhCn,
}).use(layer).use(MateChat).mount("#app");
app.config.globalProperties.mittBus = mitt(); 
app.config.globalProperties.$onPerClick = onPerClick
 