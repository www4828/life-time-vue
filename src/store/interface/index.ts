import { RouteRecordRaw } from 'vue-router'
import { ThemeConfigModel, ColorModel } from "@/api/model/themeModel";
export interface RoutesListState {
  routesList: RouteRecordRaw[]
}

export interface ThemeConfigState {
  themeConfig: ThemeConfigModel,
  colorList: Array<ColorModel>
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