import { BaseModel } from '@/api/model/baseModel'

export class CodeModel extends BaseModel {
  "name": string
  "parentCode": string
  "parentCodeName"?: string
  "typeCode": string
  "code": string
  "status"?: number
  "sort"?: number
  "codeId"?: string
  "childs"?: CodeModel[]
  "nextCode"?: string
  "firstParam": string
  "secondParam": string
  "thirdParam": string
  "fourthParam": string
  "typeLevel"?: number
  "dictionaryType"?:string
  "departmentName"?:string
  "disposeLimitName"?:string
}

export class CodeTreeModel extends BaseModel {
  "codeName": string
  "codeParent": string
  "codeType": string
  "codeValue": string
  "sort"?: number
  "codeId"?: string
  "childs"?: CodeTreeModel[]
  "status": number
  "nextCode"?: string
  "firstParam": string
  "secondParam": string
  "thirdParam": string
  "fourthParam": string
  "dictionaryType"?:string
}