import { BaseModel } from '@/api/model/baseModel'
import { DepartmentModel } from '@/api/model/caseModel'
import { FileAttachmentModel } from './fileAttachmentModel'


export class CallBackModel extends BaseModel {
    "timeType"?: string
    "taskId"?: string
    "eventSourceCode"?: string
    "district"?: string
    "reportDepartmentCode"?: string
    "reflectIndustryCode"?: string
    "reportPhone"?: string
    "repeatCount"?: string
    "callbackStatus"?: any
    "startTime"?: string
    "endTime"?: string
    "description"?: string
    "pagesize"?: number

}
export class AllocationModel {
    "callbackSource": string
    "callbackStatus": string
    "taskId": string
    "userCode": string
}
export class CallBackCaseModel {
    "callbackId": string
    "departmentVo": DepartmentModel
    "dxal": string
    "hfjg": string
    "hfry": string
    "hfsj": string
    "hfxs": string
    "myd": string
    "recordId": string
    "sfdx": boolean
    "sfxl": string
    "taskId": string
    "hfms": string
    "attachmentInfos": FileAttachmentModel[]

}
