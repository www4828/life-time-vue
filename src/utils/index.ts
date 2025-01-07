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
export enum NODE_CODE {
  C001 = '录单',
  C002 = '12345推送',
  C003 = '网格推送',
  C207 = '存电审批',
  C208 = '存电审核',
  C209 = '协办审批',
  C210 = '协办审核',
  C211 = '市延期审批',
  C217 = '催办',
  C216 = '收单',
  C218 = '退单解锁',
  C219 = '次紧急反馈',
  C302 = '办结审核',
  C101 = '核验派遣',
  C201 = '接单',
  C202 = '处置办结',
  C1001 = '再派遣',
  'C101-2' = '向下派遣',
  'C205-1' = '申请退单',
  'C204-1' = '申请延期',
  'C209-1' = '申请协办',
  'C207-1' = '申请存电',
  'C101-1' = '核验派遣',
  C203 = '延期审批',
  C204 = '延期审核',
  C205 = '退单审批',
  C206 = '退单审核',
  C301 = '办结审批',
  C401 = '自动办结',
  C501 = '案件回访',
  XC001 = '信访录单',
  XC000 = '12319派单',
  XC100 = '信访受理审查',
  XC101 = '信访受理复核',
  XC102 = '信访受理审核',
  XC103 = '12319退单审核',
  XC200 = '信访办理核实',
  XC201 = '信访办理复核',
  XC202 = '信访办理审核',
  XC300 = '信访结果审查',
  XC301 = '信访结果复核',
  XC302 = '信访结果审核',
  XC303 = '信访结果审定',
  XC304 = '12319结案审核',
  XC400 = '归档',
  XC401 = '收单归档',
  //无意义 只是为了一个页面上出现多个惯用语
  'C202-1' = '申请结案',
  'XC200-1' = '办理核实-处理描述',
  'XC200-2' = '办理核实-事实认定说明',
  'XC200-3' = '办理核实-诉求认定说明',
  'XC200-4' = '办理核实-答复市民要点',
  'XC200-5' = '办理核实-市民反馈说明',
  'XC201-1' = '办理复核-处理描述',
  'XC201-2' = '办理复核-事实认定说明',
  'XC201-3' = '办理复核-诉求认定说明',
  'XC201-4' = '办理复核-答复市民要点',
  'XC201-5' = '办理复核-市民反馈说明',
  'XC202-1' = '办理审核-处理描述',
  'XC202-2' = '办理审核-事实认定说明',
  'XC202-3' = '办理审核-诉求认定说明',
  'XC202-4' = '办理审核-答复市民要点',
  'XC202-5' = '办理审核-市民反馈说明',
  'XC300-1' = '结果审查-办理描述',
  'XC300-2' = '结果审查-事实认定说明',
  'XC300-3' = '结果审查-诉求认定说明',
  'XC300-4' = '结果审查-答复市民要点',
  'XC300-5' = '结果审查-市民反馈说明',
  'XC301-1' = '结果复核-办理描述',
  'XC301-2' = '结果复核-事实认定说明',
  'XC301-3' = '结果复核-诉求认定说明',
  'XC301-4' = '结果复核-答复市民要点',
  'XC301-5' = '结果复核-市民反馈说明',
  'XC302-1' = '结果复核-办理描述',
  'XC302-2' = '结果审核-事实认定说明',
  'XC302-3' = '结果审核-诉求认定说明',
  'XC302-4' = '结果审核-答复市民要点',
  'XC302-5' = '结果审核-市民反馈说明',
  'XC303-1' = '结果审定-办理描述',
  'XC303-2' = '结果审定-事实认定说明',
  'XC303-3' = '结果审定-诉求认定说明',
  'XC303-4' = '结果审定-答复市民要点',
  'XC303-5' = '结果审定-市民反馈说明',
  'all' = '',
  'FK001' = '反馈',
  'SEND' = '批示'
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
