import { BaseModel } from '@/api/model/baseModel'

export class LogModel extends BaseModel {
    "description": string
    "operationType": number
    "apiMethod": string
    "operationTypeName"?: string
    "requestArguments"?: string
    "errorMsg"?: string
    "responseResult"?: string
    "requestArgumentsData"?: any
    "responseResultData"?: any
}