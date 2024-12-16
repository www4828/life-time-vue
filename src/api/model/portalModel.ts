import { BaseModel } from '@/api/model/baseModel'
export class PortalModel extends BaseModel {
    "NAME"?: string
    "name"?: string
    "NOTICE_TIME": string
    "URL": string
    "STATUS"?:number
    "type"?: string
    "noticeTime"?: string
    "status"?: string | number
}