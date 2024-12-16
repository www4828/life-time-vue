import { NodeCodeKey } from './fileAttachmentModel'
import { BaseModel } from '@/api/model/baseModel'

export interface PhraseEntity extends BaseModel {
  departmentCode: string
  operateCode: NodeCodeKey
  phraseContent?: string
  phraseName?: string
  userCode?: string
  sort?: number
  isPublish: string // 0为本人 1为本部门
  count?: number
}