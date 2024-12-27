import { Session } from '@/utils/storage'
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { staticRoutes, dynamicRoutes } from './route'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { store } from '@/store'
import { useCode } from '@/hooks/useCode'
import { RouteService } from '@/api/routesService'
import { loadAppConfig } from '@/utils/loadJson'
import { UserService } from '@/api/service/System/UserService'
const routeService = new RouteService()
/**
 * 创建一个可以被 Vue 应用程序使用的路由实例
 * @method createRouter(options: RouterOptions): Router
 * @link 参考：https://next.router.vuejs.org/zh/api/#createrouter
 */
let staticRoute = staticRoutes
if (
  Session.get('appConfig').filterRouters.length > 0 &&
  !location.host.startsWith('10')
) {
  const filterRouters = Session.get('appConfig').filterRouters
  staticRoute = staticRoute.filter((t: any) => !filterRouters.includes(t.path))
}
const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_BASE_PATH),
  routes: staticRoute,
})
/**
 * 定义404界面
 * @link 参考：https://next.router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
 */
const pathMatch = {
  path: '/:path(.*)*',
  redirect: '/404',
}

/**
 * 路由多级嵌套数组处理成一维数组
 * @param arr 传入路由菜单数据数组
 * @returns 返回处理后的一维路由菜单数组
 */
export function formatFlatteningRoutes(arr: any) {
  if (arr.length <= 0) return false
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].children) {
      arr = arr.slice(0, i + 1).concat(arr[i].children, arr.slice(i + 1))
    }
  }
  return arr
}
/**
 * 一维数组处理成多级嵌套数组（只保留二级：也就是二级以上全部处理成只有二级，keep-alive 支持二级缓存）
 * @description isKeepAlive 处理 `name` 值，进行缓存。顶级关闭，全部不缓存
 * @link 参考：https://v3.cn.vuejs.org/api/built-in-components.html#keep-alive
 * @param arr 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成 `定义动态路由（dynamicRoutes）` 的格式
 */
export function formatTwoStageRoutes(arr: any) {
  if (arr.length <= 0) return false
  const newArr: any = []
  const cacheList: Array<string> = []
  arr.forEach((v: any) => {
    if (v.path === '/') {
      newArr.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: [],
      })
    } else {
      // 判断是否是动态路由（xx/:id/:name），用于 tagsView 等中使用
      // 修复：https://gitee.com/lyt-top/vue-next-admin/issues/I3YX6G
      if (v.path.indexOf('/:') > -1) {
        v.meta['isDynamic'] = true
        v.meta['isDynamicPath'] = v.path
      }
      newArr[0].children.push({ ...v })
      // // 存 name 值，keep-alive 中 include 使用，实现路由的缓存
      // // 路径：/@/layout/routerView/parent.vue
      if (newArr[0].meta.isKeepAlive && v.meta.isKeepAlive) {
        cacheList.push(v.name)
        store.dispatch('keepAliveNames/setCacheKeepAlive', cacheList)
      }
    }
  })
  return newArr
}

/**
 * 获取当前用户权限标识去比对路由表（未处理成多级嵌套路由）
 * @description 这里主要用于动态路由的添加，router.addRoute
 * @link 参考：https://next.router.vuejs.org/zh/api/#addroute
 * @param chil dynamicRoutes（/@/router/route）第一个顶级 children 的下路由集合
 * @returns 返回有当前用户权限标识的路由数组
 */
export function setFilterRoute(chil: any) {
  let filterRoute: any = []
  chil.forEach((route: any) => {
    filterRoute.push({ ...route })
    // if (route.meta.roles) {
    // 	route.meta.roles.forEach((metaRoles: any) => {
    // 		filterRoute.push({ ...route });
    // 		// store.state.userInfos.userInfos.roles.forEach((roles: any) => {
    // 		// 	if (metaRoles === roles) filterRoute.push({ ...route });
    // 		// });
    // 	});
    // }
  })
  return filterRoute
}

/**
 * 获取有当前用户权限标识的路由数组，进行对原路由的替换
 * @description 替换 dynamicRoutes（/@/router/route）第一个顶级 children 的路由
 * @returns 返回替换后的路由数组
 */
export function setFilterRouteEnd() {
  let filterRouteEnd: any = formatTwoStageRoutes(
    formatFlatteningRoutes(dynamicRoutes)
  )

  filterRouteEnd[0].children = [
    ...setFilterRoute(filterRouteEnd[0].children),
    { ...pathMatch },
  ]
  return filterRouteEnd
}
/**
 * 获取当前用户权限标识去比对路由表，设置递归过滤有权限的路由
 * @param routes 当前路由 children
 * @param roles 用户权限标识，在 userInfos（用户信息）的 roles（登录页登录时缓存到浏览器）数组
 * @returns 返回有权限的路由数组 `meta.roles` 中控制
 */
export function setFilterHasRolesMenu(routes: any) {
  const menu: any = []
  routes.forEach((route: any) => {
    const item = { ...route }
    if (item.children) item.children = setFilterHasRolesMenu(item.children)
    menu.push(item)
  })
  return menu
}
/**
 * 添加动态路由
 * @method router.addRoute
 * @description 此处循环为 dynamicRoutes（/@/router/route）第一个顶级 children 的路由一维数组，非多级嵌套
 * @link 参考：https://next.router.vuejs.org/zh/api/#addroute
 */
export async function setAddRoute() {
  await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
    const routeName: any = route.name
    if (!router.hasRoute(routeName)) router.addRoute(route)
  })
}

/**
 * 设置递归过滤有权限的路由到 vuex routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 * @description 用于左侧菜单、横向菜单的显示
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setFilterMenuAndCacheTagsViewRoutes() {
  store.dispatch(
    'routesList/setRoutesList',
    setFilterHasRolesMenu(dynamicRoutes[0].children)
  )
  setCacheTagsViewRoutes()
}

/**
 * 缓存多级嵌套数组处理后的一维数组
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setCacheTagsViewRoutes() {
  // 获取有权限的路由，否则 tagsView、菜单搜索中无权限的路由也将显示
  let rolesRoutes = setFilterHasRolesMenu(dynamicRoutes)
  // 添加到 vuex setTagsViewRoutes 中
  store.dispatch(
    'tagsViewRoutes/setTagsViewRoutes',
    formatTwoStageRoutes(formatFlatteningRoutes(rolesRoutes))[0].children
  )
}
export async function initRouter(token: string) {
  if (!sessionStorage.getItem('userInfo')) {
    sessionStorage.setItem('token', token)
    const userService = new UserService()
    const data = await userService.getUserByToken().then((res) => {
      if (res.code === 200) {
        // Session.set('userInfo', res.data)
        return res.data
      }
    })
    Session.set('userInfo', data)
  }

  const res: any = await routeService.getRouters()
  dynamicRoutes[0].children = res

  // 添加动态路由
  await setAddRoute()
  await store.dispatch('themeConfig/setThemeConfig')
  await store.dispatch('themeConfig/setColorList')
  // 缓存字典表
  // await store.dispatch('dictionary/setCodeList')
  // 缓存用户
  // await store.dispatch('dictionary/setClientList')
  // 缓存配置文件
  // await store.dispatch('dictionary/setConfigList')
  // await setDictionary();
  // 设置递归过滤有权限的路由到 vuex routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
  setFilterMenuAndCacheTagsViewRoutes()
}
//await initRouter();
const whiteList = [ '/portal','/jumpPage']
// 路由加载前
router.beforeEach(async (to, from, next) => {
  console.log(to);
  
  if (to.meta.title) NProgress.start()
  const token = sessionStorage.getItem('token') || to.query.token as string
  if (to.path === '/login' && !token) {
    next()
    NProgress.done()
  } else {
    if (whiteList.indexOf(to.path) > -1) {
      next()
    } else if (!token) {
      let {data} = await loadAppConfig()
      next(data.portalPath)
      Session.clear()
      NProgress.done()
    } else {
      if (store.state.routesList.routesList.length === 0) {
        await initRouter(token)
        // 后端控制路由：路由数据初始化，防止刷新时丢失
        //  await  store.dispatch('routesList/setRoutesList');

        //  store.state.routesList.routesList.forEach((route:RouteRecordRaw)=>{
        // 	router.addRoute(route);
        //  });
        //  await initBackEndControlRoutes();
        // 动态添加路由：防止非首页刷新时跳转回首页的问题
        // 确保 addRoute() 时动态添加的路由已经被完全加载上去
        next({ ...to, replace: true })
      } else {
        // console.log(to)
        // const { hasLockCase } = useLock()
        // hasLockCase()
        next()
      }
    }
  }
})

// 路由加载后
router.afterEach(() => {
  NProgress.done()
})
export default router
