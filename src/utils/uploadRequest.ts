import Service from "./request";
import { AxiosInstance } from 'axios'
import { UploadModel } from "@/api/model/uploadModel";
import { ElMessage, ElMessageBox } from 'element-plus'
import { Session } from "./storage";

class UploadService extends Service {
	protected interceptorsResponse() {
    // 添加响应拦截器
    (this.service as AxiosInstance).interceptors.response.use(
      (response) => {
        // 对响应数据做点什么
        
        const res:UploadModel[] = response.data
        return Promise.resolve(res)
      },
      (error) => {
        console.log(error.response)
        if(error.response.status == 401){
          Session.clear() // 清除浏览器全部临时缓存
          window.location.href = '/' // 去登录页
          ElMessageBox.alert('Token过期，请重新登录', '提示', {})
            .then(() => {})
            .catch(() => {})
        }
        // 对响应错误做点什么
        if (error.message.indexOf('timeout') != -1) {
          ElMessage.error('网络超时')
        } else if (error.message == 'Network Error') {
          ElMessage.error('网络连接错误')
        } else {
          if (error.response.data) ElMessage.error(error.response.data.error || error.response.data.message)
          else ElMessage.error('接口路径找不到')
        }
        return Promise.reject(error.response.data)
      }
    )
  }
}
// 导出 axios 实例
export default UploadService;
