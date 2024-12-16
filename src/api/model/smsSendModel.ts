import { BaseModel } from '@/api/model/baseModel'

export class SmsSendModel extends BaseModel {
    "content": string
    "departmentCode"?: string
    "grade"?: string
    "receiver": string
    "sendChannel": string
    "type"?: string
    "status"?: string
}
