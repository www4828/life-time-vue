import qs from 'qs'
import cryptoJs from 'crypto-js'
import { setRem } from '@/utils/rem'
import { Session } from '@/utils/storage'
import { Response } from '@/api/interface'
import { useCode } from '@/hooks/useCode'
import { useTheme } from '@/hooks/useTheme'
import { cloneDeep, uniqueId } from 'lodash-es'

import { useDepartment } from '@/hooks/useDepartment'
import { UserService } from '@/api/service/System/UserService'
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { PermissionService } from '@/api/service/System/PermissionService'

const iv = '1ci5crnda6ojzgtr',
  key = 'f1e336ca53304ef788908ee6853e5c0e'

const permissionSever = new PermissionService()

export function randomString(){
  return cryptoJs.lib.WordArray.random(16).toString(cryptoJs.enc.Hex);
}
export function encrypt(message: string) {
  const keyHex = cryptoJs.enc.Utf8.parse(key),
    ivHex = cryptoJs.enc.Utf8.parse(iv),
    messages = cryptoJs.enc.Utf8.parse(message),
    option = {
      iv: ivHex,
      mode: cryptoJs.mode.CBC,
      padding: cryptoJs.pad.Pkcs7,
    },
    encrypted = cryptoJs.AES.encrypt(messages, keyHex, option)

  return encrypted.ciphertext.toString() // 返回hex格式密文，如需返回base64格式：encrypted.toString()
}

export function decrypt(message: string) {
  const keyHex = cryptoJs.enc.Utf8.parse(key),
    ivHex = cryptoJs.enc.Utf8.parse(iv),
    messages = cryptoJs.enc.Hex.parse(message),
    messageStr = cryptoJs.enc.Base64.stringify(messages),
    decrypt = cryptoJs.AES.decrypt(messageStr, keyHex, {
      iv: ivHex,
      mode: cryptoJs.mode.CBC,
      padding: cryptoJs.pad.Pkcs7,
    }),
    decryptedStr = decrypt.toString(cryptoJs.enc.Utf8)

  return decryptedStr.toString()
}

const getParams = (url: string) => {
  if (url.indexOf('http') > 0) {
    //对于http来头的参数直接encode编码一下
    url = url.replace(/https?\:\/\/[^ ]+/g, (str: string) => {
      return encodeURIComponent(str)
    })
  }
  const pattern = /[?&](\w+)(?:=([^&]*))?/g
  let match
  let params: { [index: string]: string } = {}
  const baseUrl = url.split('?')[0]
  while ((match = pattern.exec(url)) !== null) {
    var key = match[1]
    var value = match[2] || ''
    params[key] = value
  }
  return {
    baseUrl,
    obj: { ...params, baseUrl },
  }
}

export function getFullPath(path: string) {
  const config = JSON.parse(sessionStorage.getItem('appConfig')!).urls
  let url = ''
  const { mediaUrl } = config
  url = mediaUrl + 'resource/' + path
  return url
}

const modules = import.meta.glob('@/views/**/*.vue')
function dealUrl(url: string, child: any) {
  let objectParams: any = {}
  if (url.indexOf('?') > -1) {
    const params = getParams(child.url)
    url = params.baseUrl
    objectParams = params.obj
  } else {
    return url
  }
  return objectParams
}
function getQueryParams(child: any) {
  if (typeof child === 'string') {
    return undefined
  } else {
    const obj = cloneDeep(child)
    delete obj.baseUrl
    return obj
  }
}
function getPath(url: string | any, i: number, data: any) {
  if (typeof url === 'string') {
    return url
  } else {
    if (i === 0) {
      return url.baseUrl + uniqueId()
    } else {
      const item = data[i]
      const prev = data[i - 1]
      if (item.url.split('?')[0] === prev.url.split('?')[0]) {
        return url.baseUrl + uniqueId()
      } else {
        return url.baseUrl + uniqueId()
      }
    }
  }
}
function dealOpenWindowUrl(url: string, openType?: number) {
  if (url.indexOf('$') > 0 && url.startsWith('http')) {
    const departmentInfo = useDepartment()
    type Value = keyof typeof departmentInfo
    let [baseUlr, params] = url.split('?')
    const dealParams = qs.parse(params)
    Object.entries(dealParams).forEach((value) => {
      const [key, val] = value as string[]
      if (val?.indexOf('$')! > -1) {
        const valueReg = /\w+/
        const currentValue = val.match(valueReg)![0] as Value
        baseUlr += `&${key}=${departmentInfo[currentValue]}`
      } else {
        baseUlr += `&${key}=${val}`
      }
    })
    return baseUlr.replace('&', '?')
  } else if (url.startsWith('http')) {
    return url
  } else if (url.startsWith('/') && openType == 3) {
    //新标签打开

    return (
      location.origin +
      import.meta.env.VITE_BASE_PATH +
      '/#' +
      url +
      '?tagClose=true'
    )
  } else {
    return ''
  }
}
function calField (tree: any) {
  tree.forEach((node: any) => {
    if (node.children && node.children.length > 0) {
        calField(node.children)
        node.meta.caseNum = node.children.reduce((sum: any, item: any) => sum + item.meta.caseNum, 0)
    }
  })
  return tree
}
function deepMenu(data: any, arr: any, parentId: string) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (item.parentId === parentId) {
      const url = dealUrl(item.url, item)
      const isString = typeof url === 'string'
      const path = getPath(url, i, data)
      const flowName = url.flowName || 'all'
      const flag = url.flag || '1'
      const nodeCode = item.nodeCode
      arr.push({
        path: path,
        name: path,
        component: modules[`../views${isString ? url : url.baseUrl}/index.vue`],
        meta: {
          title: item.name,
          icon: item.icon,
          isLink: dealOpenWindowUrl(item.url, item.openType),
          isHide: false,
          isKeepAlive: false,
          isAffix: false,
          isIframe: false,
          flowName: flowName,
          flag: flag, // 标识位 如果是0就不展示案件数字
          nodeCode: nodeCode
        },
        query: getQueryParams(url),
        permissionId: item.permissionId,
        parentId: item.parentId,
        children: [],
      })
      deepMenu(item.child, arr[i].children, item.permissionId)
    }
  }
}
export async function setCaseNum() {
  const menus = Session.get("menus")
  const result: any = []
  
  deepMenu(menus, result, menus[0].parentId)
  let data = calField(result)
  data.unshift({
    path: '/home',
    name: '工作台',
    component: modules[`../views/home/index.vue`],
    meta: {
      title: '工作台',
      icon: 'contrast',
      isLink: '',
      isHide: false,
      isKeepAlive: false,
      isAffix: true,
      isIframe: false,
    },
    permissionId: '',
    parentId: '',
    children: [],
  })
  return data
}
export function SetMenu(): Promise<object[]> {
  const { userCode } = Session.get('userInfo')
  const activeDept = Session.get('activeDept')
  return new Promise((resolve) => {
    permissionSever.getMenuTree(userCode, activeDept).then(async (res: Response) => {
      if (res.code === 200) {
        Session.set("menus", res.data[0].child)
        resolve(setCaseNum())
      }
    })
  })
}

export function beforeStyleSet(
  to: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  if (to.query.check_token) {
    sessionStorage.setItem('token', to.query.check_token as string)
    setRem()
    useTheme()
    const userService = new UserService()
    userService.getUserByToken().then((res) => {
      if (res.code === 200) {
        Session.set('userInfo', res.data)
        useCode()
        next()
      }
    })
  } else {
    if (decrypt(to.query.taskId as string) !== '') {
      setRem()
      useTheme()
      next()
    } else {
      next('/404')
    }
  }
}
