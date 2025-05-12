import { loadAppConfig } from '@/utils/loadJson'
import { fetchEventSource } from '@microsoft/fetch-event-source'

let { data } = await loadAppConfig()
// 接受参数
export interface SSEChatParams {
  url: string // sse 连接
  onmessage: (event: MessageEvent) => void // 处理消息的函数
  onerror: () => void // 建立连接触发的事件
  data: Object
  finallyHandler: () => void // 相当于 try_finally 中的 finally 部分，不管出现异常或者关闭必然会执行的代码块
}

export class SSEService {
  // 当前是否回答中

  // 结束流时使用
  private ctrl
  constructor() {
    this.ctrl = new AbortController()
  }
  connect(params: any) {
    fetchEventSource(data.urls.SSEUrl + params.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params.data),
      signal: this.ctrl.signal,
      openWhenHidden: false,
      onmessage:(event)=>{
        // 接收服务器发送的每条事件
        console.log('收到数据:', event);
        params.onmessage(event.data)

        if(event.data === '[END]'){
          this.ctrl.abort();
        }
        // 请求完成
      },
      onclose() {
        // 连接关闭时触发
        console.log('连接终止');
      },
      onerror(err) {
        // 错误处理（默认会抛出异常并自动重试）
        console.error('错误:', err);
        params.onmessage(err)
        throw err; // 抛出错误会触发重试机制
      }
    });
  }
}
