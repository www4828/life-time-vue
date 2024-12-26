import { SetMenu } from '@/utils'
import { BaseInterface } from './interface'
import { RouteModel } from './model/routerModel'

export interface RouteInteface extends BaseInterface<RouteModel> {
  getRouters(): Promise<RouteModel[]>
}

export class RouteService implements RouteInteface {
  getRouters = (): Promise<RouteModel[]> => {
    // return SetMenu()
    return new Promise((resolve) => {
      resolve([
        {
          path: '/home',
          name: 'home',
          component: () => import('@/views/home/index.vue'),
          meta: {
            title: '主页',
            icon: 'globe',
            isLink: '',
            isHide: false,
            isKeepAlive: false,
            isAffix: true,
            isIframe: false,
          },
        },
        {
          "path": "/system",
          "name": "/system",
          "meta": {
              "title": "系统管理",
              "icon": "gear",
              "isLink": "",
              "isHide": false,
              "isKeepAlive": false,
              "isAffix": false,
              "isIframe": false,
              "flowName": "all",
              "flag": "1",
              "nodeCode": "-1",
              "caseNum": 0
          },
          "permissionId": "1658733693058945024",
          "parentId": "1",
          "children": [
              {
                  "path": "/system/department",
                  "name": "/system/department",
                  component: () => import('@/views/system/department/index.vue'),
                  "meta": {
                      "title": "部门管理",
                      "icon": "point",
                      "isLink": "",
                      "isHide": false,
                      "isKeepAlive": false,
                      "isAffix": false,
                      "isIframe": false,
                      "flowName": "all",
                      "flag": "1",
                      "nodeCode": "-1",
                      "caseNum": 0
                  },
                  "permissionId": "1658734627805728768",
                  "parentId": "1658733693058945024",
                  "children": []
              },
              {
                  "path": "/system/role",
                  "name": "/system/role",
                  component: () => import('@/views/system/role/index.vue'),
                  "meta": {
                      "title": "角色管理",
                      "icon": "point",
                      "isLink": "",
                      "isHide": false,
                      "isKeepAlive": false,
                      "isAffix": false,
                      "isIframe": false,
                      "flowName": "all",
                      "flag": "1",
                      "nodeCode": "-1",
                      "caseNum": 0
                  },
                  "permissionId": "1658734836027756544",
                  "parentId": "1658733693058945024",
                  "children": []
              },
              {
                  "path": "/system/user",
                  "name": "/system/user",
                  component: () => import('@/views/system/user/index.vue'),
                  "meta": {
                      "title": "用户管理",
                      "icon": "point",
                      "isLink": "",
                      "isHide": false,
                      "isKeepAlive": false,
                      "isAffix": false,
                      "isIframe": false,
                      "flowName": "all",
                      "flag": "1",
                      "nodeCode": "-1",
                      "caseNum": 0
                  },
                  "permissionId": "1658735134532177920",
                  "parentId": "1658733693058945024",
                  "children": []
              },
              {
                  "path": "/system/permission",
                  "name": "/system/permission",
                  component: () => import('@/views/system/permission/index.vue'),
                  "meta": {
                      "title": "权限管理",
                      "icon": "point",
                      "isLink": "",
                      "isHide": false,
                      "isKeepAlive": false,
                      "isAffix": false,
                      "isIframe": false,
                      "flowName": "all",
                      "flag": "1",
                      "nodeCode": "-1",
                      "caseNum": 0
                  },
                  "permissionId": "1658735400362971136",
                  "parentId": "1658733693058945024",
                  "children": []
              },
              {
                  "path": "/system/code",
                  "name": "/system/code",
                  component: () => import('@/views/system/code/index.vue'),
                  "meta": {
                      "title": "字典管理",
                      "icon": "point",
                      "isLink": "",
                      "isHide": false,
                      "isKeepAlive": false,
                      "isAffix": false,
                      "isIframe": false,
                      "flowName": "all",
                      "flag": "1",
                      "nodeCode": "-1",
                      "caseNum": 0
                  },
                  "permissionId": "1658735581473017856",
                  "parentId": "1658733693058945024",
                  "children": []
              },
              {
                  "path": "/system/client",
                  "name": "/system/client",
                  component: () => import('@/views/system/client/index.vue'),
                  "meta": {
                      "title": "客户端管理",
                      "icon": "point",
                      "isLink": "",
                      "isHide": false,
                      "isKeepAlive": false,
                      "isAffix": false,
                      "isIframe": false,
                      "flowName": "all",
                      "flag": "1",
                      "nodeCode": "-1",
                      "caseNum": 0
                  },
                  "permissionId": "1668812297960689664",
                  "parentId": "1658733693058945024",
                  "children": []
              },
              {
                  "path": "/system/setting",
                  "name": "/system/setting",
                  component: () => import('@/views/system/setting/index.vue'),
                  "meta": {
                      "title": "主题管理",
                      "icon": "point",
                      "isLink": "",
                      "isHide": false,
                      "isKeepAlive": false,
                      "isAffix": false,
                      "isIframe": false,
                      "flowName": "all",
                      "flag": "1",
                      "nodeCode": "-1",
                      "caseNum": 0
                  },
                  "permissionId": "1668812297960689664",
                  "parentId": "1658733693058945024",
                  "children": []
              }
          ]
      }
      ])
    })
  }
}