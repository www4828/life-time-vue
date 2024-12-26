import { BaseModel } from '@/api/model/baseModel'

export class CodeModel extends BaseModel {
  "codeClass"?: string
  "codeName": string
  "codeNote"?: string
  "codeParent": string
  "codeType": string
  "codeValue": string
  "departCode"?: string
  "departName"?: string
  "firstParam"?: string
  "fourthParam"?: string
  "secondParam"?: string
  "remark"?: string
  "sort"?: string | number
  "status"?:string | number
  "thirdParam"?: string
}

export class CodeTreeModel extends BaseModel {
  "code": string
  "name": string
  "type": string
  "note"?: string
  "child"?: Array<CodeTreeModel>
}