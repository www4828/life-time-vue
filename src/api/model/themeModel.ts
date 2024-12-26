import { BaseModel } from '@/api/model/baseModel'

export class ThemeConfigModel extends BaseModel {
  "globalTitle": string
  "tagsStyle": string
  "footerText": string
  "isSortableTagsView": string | boolean
  "isTagsViewIcon": string | boolean
  "isFooter": string | boolean
  "animation": string
  "layout": string
  "isBreadCrumb": string | boolean
  "isShareTagsView": string | boolean
  "isShowLogo": string | boolean
  "isUniqueOpened": string | boolean
  "isTagsView": string | boolean
  "isCacheTagsView": string | boolean
  "isMenuIcon": string | boolean
  "isWarteMark": string | boolean
  "globalViceTitle": string
  "globalComponentSize": string
  "isCollapse":string | boolean
  "isBreadCrumbIcon": string | boolean
  [key:string]: any
}

export class ThemeStyleModel extends BaseModel {
  "sort": number
  "status": number
  "themeDes": string
  "themeKey": string
  "themeOpacity": string
  "themeType": string
  "themeValue": string
}

export class ColorModel{
  "name": string
  "value": string
  "type": string
  "opacity": boolean
  "description": string
  "status": boolean
}