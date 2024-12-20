import { nextTick } from 'vue'
import { RouteRecordRaw } from 'vue-router'
import { beforeStyleSet } from '@/utils'
import { useTheme } from '@/hooks/useTheme'
import { setRem } from '@/utils/rem'
/**
 * 路由meta对象参数说明
 * meta: {
 *      title:          菜单栏及 tagsView 栏、菜单搜索名称（国际化）
 *      isLink：        是否超链接菜单，开启外链条件，`1、isLink:true 2、链接地址不为空`
 *      isHide：        是否隐藏此路由
 *      isKeepAlive：   是否缓存组件状态
 *      isAffix：       是否固定在 tagsView 栏上
 *      isIframe：      是否内嵌窗口，，开启条件，`1、isIframe:true 2、链接地址不为空`
 *      roles：         当前路由权限标识，取角色管理。控制路由显示、隐藏。超级管理员：admin 普通角色：common
 *      icon：          菜单、tagsView 图标，阿里：加 `iconfont xxx`，fontawesome：加 `fa xxx`
 * }
 */
export const dynamicRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/home',
    meta: {
      isKeepAlive: true,
    },
    children: [],
  },
]

export const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/caseDetail',
    name: 'caseDetail',
    component: () => import('@/views/CaseDetail/CaseDetail.vue'),
    meta: {
      title: '案件详情',
    },
    beforeEnter: (to, from, next) => {
      beforeStyleSet(to, next)
    },
  },
  {
    path: '/caseDetailXF',
    name: 'caseDetailXF',
    component: () => import('@/views/CaseDetail/CaseDetailXF.vue'),
    meta: {
      title: '案件详情',
    },
    beforeEnter: (to, from, next) => {
      beforeStyleSet(to, next)
    },
  },
  {
    path: '/oldCaseDetail',
    name: 'oldCaseDetail',
    component: () => import('@/views/OldCaseDetail/OldCaseDetail.vue'),
    meta: {
      title: '原始工单',
    },
    beforeEnter: (to, from, next) => {
      setRem()
      useTheme()
      next()
    },
  },
  {
    path: '/portal',
    name: 'portal',
    component: () => import('@/views/login/portal.vue'),
    meta: {
      title: 'message.staticRoutes.notFound',
    },
    beforeEnter: (to, from, next) => {
      setRem()
      useTheme()
      next()
    },
  }, 
  {
    path: '/404',
    name: 'notFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: 'message.staticRoutes.notFound',
    },
  },
  {
    path: '/401',
    name: 'noPower',
    component: () => import('@/views/error/401.vue'),
    meta: {
      title: 'message.staticRoutes.noPower',
    },
  },
  {
    path: '/audioPlayer',
    name: 'audioPlayer',
    component: () => import('@/components/AudioPlayer/index.vue'),
    meta: {},
  },
  {
    path: '/jumpPage',
    name: 'jumpPage',
    component: () => import('@/views/jumpPage/index.vue'),
    meta: {},
  }
]
