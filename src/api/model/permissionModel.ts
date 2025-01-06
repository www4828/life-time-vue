import { BaseModel } from '@/api/model/baseModel'

export class PermissionModel extends BaseModel {
  "parentId": string
  "name": string
  "url": string
  "icon"?: string
  "remark": string
  "status": number
  "type": string
  "tag": string
  "openType": number
  "sort": number
  "permissionId": string
  "disabled"?: boolean
  "parentName"?: string
  [key:string]: any
}

export class PermissionButtonModel {
  "buttons": PermissionModel[]
  "permission": PermissionModel
}