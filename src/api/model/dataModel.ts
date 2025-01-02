import { BaseModel } from '@/api/model/baseModel'

export class DataSourceModel extends BaseModel {

  "remark"?: string
  "sort"?: string | number
  "status"?:string | number
  "dataType"?: number
}