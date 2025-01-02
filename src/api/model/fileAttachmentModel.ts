import { BaseModel } from '@/api/model/baseModel'
import { NODE_CODE } from "@/utils";
export type CaseType = 'audio' | 'video' | 'doc' | 'voice'

export type NodeCodeKey = keyof typeof NODE_CODE

export interface FileAttachmentModel extends BaseModel {
  nodeCode?: string
  taskId?: string
  type: string
  url: string
  departmentCode: string
  departmentName: string
  fileId: string
  fileName: string
  createUser?: string
  nodeCodeName?: string
  departmentCodeName?: string
  time?: string
  userName?: string
  fileSize: number
  status?: number | string
  checked?: boolean
  fileIndex: number
  fileNewName: string
  fileShowName: string
  batchOperaId?: string
}