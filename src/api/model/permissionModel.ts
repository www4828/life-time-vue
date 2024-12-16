import { BaseModel } from '@/api/model/baseModel'

export class PermissionModel extends BaseModel {
  "parentID": string
  "name": string
  "url": string
  "icon": string
  "nodeCode": string
  "remark": string
  "status": number
  "type": string
  "tag": string
  "openType": number
  "sort": number
  "permissionID": string
  "disabled"?: boolean
}