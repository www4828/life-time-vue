import { BaseModel } from '@/api/model/baseModel'

export class AutoEndConfigModel extends BaseModel {
  "configName": string
  "configType": string
  "intervalTime": string
  "isValid": string
  "overdueTime": string
  "status": string
}