import axios, { AxiosInstance } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Session } from '@/utils/storage'
import { loadAppConfig } from '@/utils/loadJson'
import { Response } from '@/api/interface'
import { useRouter } from "vue-router";

type AuthType = 'Bearer' | 'Token'
const {
  data,
} = await loadAppConfig()
class Service {
  public service: AxiosInstance | null = null
	protected key: string = ''
  constructor(key: string, authType?: AuthType | boolean) {
		this.key = key
    this.init(key, authType)
    return this
  }
  protected init(key: string, authType?: AuthType | boolean) {
    Session.set('appConfig', data)
    this.service = axios.create({
      baseURL: data.urls[key],
      timeout: 50000,
      headers: { 'Content-Type': 'application/json' },
    })
    this.interceptorsRequest(authType)
    this.interceptorsResponse()
  }

  protected interceptorsRequest(authType: boolean | AuthType = 'Bearer') {
    // 添加请求拦截器
    (this.service as AxiosInstance).interceptors.request.use(
      (config) => {
        // 在发送请求之前做些什么 token
        if (typeof authType !== 'boolean') {
          if (sessionStorage.getItem('token') && authType === 'Bearer') {
            ;(<any>config.headers).common['Authorization'] = `Bearer ${sessionStorage.getItem(
              'token'
            )}`
          } else if (sessionStorage.getItem('token') && authType === 'Token') {
            ;(<any>config.headers).common['Authorization'] = `${sessionStorage.getItem(
              'token'
            )}`
          }
        }
        return config
      },
      (error) => {
        // 对请求错误做些什么
        return Promise.reject(error)
      }
    )
  }
  protected interceptorsResponse() {
    // 添加响应拦截器
    (this.service as AxiosInstance).interceptors.response.use(
      (response) => {
        // 对响应数据做点什么

        const res:Response = response.data
        const router = useRouter();
        if (res.code && res.code !== 0) {
          // `token` 过期或者账号已在别处登录
          if (res.code === 401 || res.code === 4001) {
            Session.clear() // 清除浏览器全部临时缓存
            location.href = data.portalPath // 去登录页
            ElMessageBox.alert('token已失效，请重新登录', '提示', {})
              .then(() => {})
              .catch(() => {})
          } else {
            return Promise.resolve(response.data)
          }
        } else {
          return Promise.resolve(response.data)
        }
      },
      (error) => {
        // console.log(error.response)
        // 对响应错误做点什么
        const router = useRouter();
        if (error.message.indexOf('timeout') != -1) {
          ElMessage.error('网络超时')
        } else if (error.message == 'Network Error') {
          ElMessage.error('网络连接错误')
        } 
        else if(error.response.status === 401){
          sessionStorage.clear()
          ElMessage.error('你已被登出，请重新登录')
          // location.href = '/'
          router.push({ path: '/login' });
        } 
        else {
          if (error.response.data) ElMessage.error(error.response.data.message || error.response.data.error)
          else ElMessage.error('接口路径找不到')
        }
        ElMessage.error(error.response.data.message)
        return Promise.reject(error)
      }
    )
  }
}

// 导出 axios 实例
export default Service
