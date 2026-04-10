import { componentSizeMap } from "element-plus";

/**
 * SSE 流式请求工具（Vue3 通用）
 * @param {string} url 接口地址
 * @param {object} data 要发送的参数
 * @param {function} onMessage 接收消息
 * @param {function} onComplete 结束回调
 * @param {function} onError 错误回调
 */
export function useSSE({ url, data, onMessage, onComplete, onError }) {
  // 1. 创建 EventSource
  // const encodedData = encodeURIComponent(JSON.stringify(data));
  const source = new EventSource(`${url}?${data}`);

  // 2. 接收消息
  source.onmessage = (event) => {  
    console.log(event)
    try {
      const content = event.data;
      console.log("content")
      console.log(content)
      if (content === "[DONE]") {
        source.close();
        onComplete?.();
        return;
      }
      if(content!=""){
        onMessage?.(content);
      }
      
      
    } catch (e) {}
  };

  // 3. 错误
  source.onerror = (err) => {
    console.error("SSE 错误", err);
    source.close();
    onError?.(err);
  };

  // 4. 返回关闭方法
  return () => source.close();
}


/**
 * POST 请求 + SSE 流式读取
 * @param {String} url 后端接口
 * @param {Object} data 要发送的参数
 * @returns {Promise<{ onMessage, onComplete, onError }>}
 */
export async function useStreamChat({ url, data, onMessage, onComplete, onError }) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    // 循环读取流
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onComplete?.()
        break
      }

      // 解析内容
      const text = decoder.decode(value, { stream: true })
      onMessage?.(text)
    }
  } catch (err) {
    onError?.(err)
  }
}


export async function useSSEStream({ url, data, onMessage, onComplete, onError }) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const msg = line.replace('data: ', '').trim()
          if (msg) onMessage?.(msg)
        }
      }
    }

    onComplete?.()
  } catch (err) {
    onError?.(err)
  }
}