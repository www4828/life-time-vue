import { BaseModel } from '@/api/model/baseModel'
import { FileAttachmentModel, NodeCodeKey } from './fileAttachmentModel'
import { FlowModel } from '@/api/model/endCheckModel'
import { SupervisionModel } from '@/api/model/supervisionModel'
import { key } from '@/store'
export interface CaseFormModel {
  taskId: number
  eventSourceCode: string
  eventSource: string
  repeatCount: number
  emergency: string
  reportTime: string
  reportPerson: string
  repeatTaskId: string
  address: string
  reportPhone: string
  district: string
  reflectSourceCode: string
  caseType: string
  reflectIndustryCode: number | string
  reflectIndustry: string
  reflectIndustryName?: string
  reflectClassCode: number | string
  reflectClass: string
  reflectClassName?: string
  reflectContentCode: number | string
  reflectContent: string
  reflectContentName?: string
  description: string
  contactPhone: number | string
  isNM: string
  reportDepartmentCode: string
  eventSourceName?: string
  externalNumber?: string
  flowState?: string
  [index: string]: any
}
export interface SpecialTipsModel extends BaseModel {
  specialName: string
  specialCode: number
  taskId: number | string
}

export interface DispatchFormModel extends BaseModel {
  deadline: string
  description: string
  dispatchDepartmentCode: string
  disposeDepartmentCode: string
  disposeTime: string
  taskId?: string
  type: string // 主办1 协办0
  firstClass?: string
  secondClass?: string
  thirdClass?: string
  fourthClass?: string
  firstClassName?: string
  secondClassName?: string
  thirdClassName?: string
  fourthClassName?: string
  [key:string]:any
}

export interface DepartmentModel {
  departmentCode: string
  departmentLevel: string
  departmentMark?: string
  departmentGroup?: string
  departmentName: string
  departmentParentCode?: string
  departmentShortName: string
  departmentTag: string
  distract: string
}
export interface XFSLSCEntity extends BaseModel {
  slqk: string
  importLevel: string
  yjsm: string
  nextCode: string
  nextDept: string
  nextUser: string
  nextRole: string
  disposeTime: string
  deadline: string
}
export interface CaseModel {
  caseInfo: CaseFormModel
  specialFlags: SpecialTipsModel[]
  dispatchInfos: DispatchFormModel[]
  attachmentInfos: FileAttachmentModel[]
  isAuto: string
  department: DepartmentModel
  flowModel?: FlowModel
  flowModelList?: FlowModel[]
  supervision?: SupervisionModel
  xfslsc?: XFSLSCEntity
  sendToDepts?:string
  warnId?:string
}


export interface CaseNumModel {
  count: number
  flowName: string
  nodeCode: string
}
export interface CaseDispatchModel extends BaseModel {
  deadline: string
  dispatchDepartmentCode: string
  description: string
  dispatchDeptName: string
  disposeDepartmentCode: string
  disposeDeptName: string
  disposeTime: string
  firstClass: string
  firstClassName: string
  fourthClass: string
  recordId: string
  secondClass: string
  secondClassName: string
  status: string
  taskId: string
  thirdClass: string
  thirdClassName: string
  type: string
}
export interface RecoveryModel {
  departmentCode: string
  departmentName: string
  nodeCode: NodeCodeKey
  taskId: string
  userId: string
  userName: string
  recoveryDeptArray: CaseDispatchModel[]
  attachmentInfos: FileAttachmentModel[]
}
export interface EsCaseModel {
  TASKID: string
  CASETYPE: string
  REPORT_TIME: string
  FYNR: string
  DESCRIPTION: string
}
export interface ReturnModel {
  "applyPerson": string
  "applyTime": string
  "approver": string
  "chargePerson": string
  "chargeReason": string
  "chargeReason2": string
  "concatNum": string
  "concatPerson": string
  "description": string
  "detailContent": string
  "missingElements": string
  "nextDepartment": string
  "nextSource": string
  "nodeCode": string
  "practicalDemands": string
  "repeatWpid": string
  "replenish": string
  "viewCondition": string
  "repeatWpidList"?: any
  "mcaseFileDto"?: any
  [key:string]:any
}
export interface UrgentModel{
  "applicationTime"?: string,
  "count"?: string,
  "deptId"?: string,
  "deptLevel2By"?: string,
  "deptLevel2Name"?: string,
  "deptLevel3"?: string,
  "deptLevel3By"?: string,
  "isContact"?: string,
  "isOsi"?: string,
  "isSolved"?: string,
  "linkUrl"?: string,
  "passwd"?: string,
  "recordId"?: string,
  "summary"?: string,
  "taskId"?: string,
  "unResolvedReasons"?: string,
  "userName"?: string,
  "wpid"?: string
}