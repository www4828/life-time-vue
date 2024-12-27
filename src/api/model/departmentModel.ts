import { BaseModel } from '@/api/model/baseModel'

export class DepartmentModel extends BaseModel {
  "contactNumber": string
  "contactPerson": string
  "departmentCode": string
  "departmentGroup": string
  "departmentLevel": number
  "departmentName": string
  "departmentParentCode": string
  "departmentShortName": string
  "departmentTag": string
  "departmentType": string
  "status": number | string | string
  "sort": number | string
  "roleList": any
  "disabled"?: boolean
  "departmentRoles": string
  [key:string]:any
}

export interface SearchDepartmentModel {
  childNode?: boolean
  currentNode?: boolean
  optionList?: string[]
  removeList?: string[]
}
