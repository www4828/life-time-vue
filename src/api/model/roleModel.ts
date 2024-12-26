import { BaseModel } from '@/api/model/baseModel'

export class RoleModel extends BaseModel {
    "sort": number
    "status": number
    "remark": string
    "roleCode": string
    "roleName": string
    "roleParentCode": string
    "roleType": string
    "dataDepts": string
    "dataScope": string
    "dataUsers": string
    "permissions": string
}
