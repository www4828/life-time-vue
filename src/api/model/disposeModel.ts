import { BaseModel } from '@/api/model/baseModel'
import { FileAttachmentModel } from './fileAttachmentModel'

export interface attachmentDto {
    departmentCode: string
    fileId: string
    fileName: string
    nodeCode: string
    taskId: string
    type: string
    url: string
}
export interface ContactModel extends BaseModel {
    attachment: string,
    departmentCode: string,
    description: string,
    person: string,
    phone: string,
    reason: string,
    result: string,
    taskId: string,
    time: string,
    type: string,
    nodeCode: string
    attachmentDto?:attachmentDto
    status?: number
}
export interface CompanyModel extends BaseModel{
  company: string
  taskId: string
  department: string
  loading?: boolean
}
export interface DisposeFormModel {
    id?: string
    content: string | number
    description: string
    person: string
    result: string | number
    taskId: string | number
    time: string
    type: string | number
    status?: string
    recordId?: string
    executeType?: string
    firstClass: string
    secondClass: string
    thirdClass: string
    fourthClass: string
    departmentCode: string
    [index: string]: any
}
export interface DisposeReportFormModel {
    appealExplain: string,
    appealFinding: string,
    factExplain: string,
    factFinding: string,
    feedback: string,
    isSmmy: string,
    isXcck: string,
    replyPoint: string,
    replyTime: string,
    replyType: string,
    secondaryAgent: string,
    secondaryDepartment: string,
    secondaryPrincipal: string,
    signedUnit: string,
    taskId: string,
    xcckTime:string,
    secondaryPhone:string,
    [index: string]: string
}
export interface DepartmentModel {
    departmentCode: string
    departmentLevel: string
    departmentName: string
    departmentShortName: string
    departmentTag: string
    distract: string
}

export interface CaseDisposeModel {
    attachmentInfos: FileAttachmentModel[]
    caseDisposeDto: DisposeFormModel
    caseDisposeReportDto: DisposeReportFormModel
    department: DepartmentModel
    relations: ContactModel[]
    flowModelList?: Array<any>
    warnId?: string
}

export interface CroupVisitModel {
  "createTime": string,
  "modifierTime": string,
  "createUser": string,
  "modifierUser": string,
  "recordId": string,
  "warnId": string,
  "warnName": string,
  "reportTime": string,
  "node": string,
  "nodeName": string,
  "taskId": string,
  "executeFlag": string,
  "caseNum": string,
  successNum: string,
  [index: string]: string
}