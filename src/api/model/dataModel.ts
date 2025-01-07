import { BaseModel } from '@/api/model/baseModel'

export class DataSourceModel extends BaseModel {

  "remark"?: string
  "sort"?: string | number
  "status"?:string | number
  "dataType"?: number
  "dataSourceName":	string
  "dataSourceType": string
  "dataSourceUrl": string
  "userName": string
  "passWord": string
  "driver": string
}