import { BaseModel } from '@/api/model/baseModel'

export class RoleModel extends BaseModel {
    "roleId": string
    "rolename": string
    "sort": number
    "remark": string
    "status": number|string
    "permissionId": string | number
}
