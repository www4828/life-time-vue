import { RouteRecordRaw } from 'vue-router'
export interface RoutesListState {
  routesList: RouteRecordRaw[]
}

export interface ThemeConfigState {
  themeConfig: {
    footerText: string //底部文字
    isMenuIcon: boolean //显示菜单按钮
    isUniqueOpened: boolean //是否只保持一个子菜单的展开
    tagsStyle: string //标签样式
    isShowLogo: boolean //显示logo
    isBreadCrumb: boolean //显示面包屑
    isBreadCrumbIcon: boolean //显示面包屑图标
    isTagsView: boolean //显示标签页
    isTagsViewIcon: boolean //显示标签页图标
    isFooter: boolean //显示底部系统信息
    isWarteMark: boolean //显示水印(默认当前用户)
    animation: string //动画方式
    globalTitle: string //系统标题
    globalViceTitle: string //系统副标题
    layout: string //布局样式
    isCollapse: boolean
    isShareTagsView: boolean
    isCacheTagsView: boolean
    isSortableTagsView: boolean
    colorList: StyleState[]
    globalComponentSize: number
  }
}

export interface UserInfosState {
  userInfos: {
    clientId: string
    clientName: string
    description: string
    token: string
  }
}
// 路由缓存列表
export interface KeepAliveNamesState {
  keepAliveNames: string[]
}

// TagsView 路由列表
export interface TagsViewRoutesState {
  tagsViewRoutes: object[]
  isTagsViewCurrenFull: Boolean
}
export interface RootStateTypes {
  userInfos: UserInfosState
  routesList: RoutesListState
  themeConfig: ThemeConfigState
  keepAliveNames: KeepAliveNamesState
  tagsViewRoutes: TagsViewRoutesState
}

export interface StyleState {
  name: string
  value: string
  type: string
  opacity: boolean
  description: string
  status: boolean
}

export interface AppState {
  appConfig: {}
}