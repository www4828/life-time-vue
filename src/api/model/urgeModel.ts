import { FileAttachmentModel } from './fileAttachmentModel'

export interface Dto {
  content: string
  departmentCode: string
  sendMethod: string
  sort?: number
  status?: number
  taskId: string
  type: string
  userCode:string
  person?:any
}
export interface UrgeModel {
    dto: Dto
    attachmentInfos: FileAttachmentModel[]
  }