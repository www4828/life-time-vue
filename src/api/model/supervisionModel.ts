import { BaseModel } from '@/api/model/baseModel'

export interface SupervisionModel extends BaseModel {
  argument: string
  description: string
  reason: string
  relationTaskIdFirst: string
  relationTaskIdSecond: string
  relationTaskIdThird: string
  relationTaskIdFourth: string
  source: string
  type: string
  supervisionId: string
  taskId?: string
  [key:string]:any
}