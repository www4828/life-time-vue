import axios from "axios";
import.meta.env.VITE_APP_BASE_DISTRICT
//加载系统信息
export async function loadAppConfig() {
    const service = axios.create({
        "baseURL": process.env.BASE_URL // api 的 base_url
    });

    return service({
        "url": import.meta.env.VITE_BASE_PATH + "/static/json/"+import.meta.env.VITE_APP_BASE_DISTRICT+"/appConfig.json?"+(new Date()).getTime(),
        "method": "get"
    });
}
