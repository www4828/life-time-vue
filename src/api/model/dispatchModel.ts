import { CaseFormModel } from './caseModel'
import { BaseModel } from '@/api/model/baseModel'
import { NodeCodeKey } from './fileAttachmentModel'

interface PropsModel {
  additionalProp1: string
  additionalProp2: string
  additionalProp3: string
  empty: string
  innerMap: string
}
export interface ButtonInfoModel {
  id: string
  name: string
  code?: NodeCodeKey
  formPath?: string | 'dispatch' | 'return'
  fullName?: string
  props?: PropsModel
  sort?: string | number
  type?: string
  taskId: string
  processId?: string
  fn?: Function
}
export interface CaseInfoModel extends BaseModel, CaseFormModel {
  address: string
  chargeback: string
  cityBackCount: string
  citySource: string
  contactPhone: string
  deadline: string
  description: string
  district: string
  emergency: string
  eventSource: string
  eventSourceCode: string
  externalNumber: string
  flowState: string
  infoSourceId: string
  infoSource: string
  isYN: string
  repeatTaskId: string
  reportDepartmentCode: string
  reportDepartmentName: string
  eventSourceName: string
  reflectClassName: string
  reflectContentName: string
  reportPerson: string
  reportPhone: string
  reportTime: string
  sort: number
  status: number
  reflectSourceName?: string
  districtName?: string
  [key:string]:any
}

export interface DispatchResponseModel {
  buttonInfo: ButtonInfoModel[]
  caseInfo: CaseInfoModel
}
