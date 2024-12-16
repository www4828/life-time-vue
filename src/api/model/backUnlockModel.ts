import { FileAttachmentModel } from './fileAttachmentModel'
interface BackUnlockDto {
  currentDepartment: string
  description: string
  taskId: string
  type: string
}
export interface BackUnlockModel {
  attachmentInfos: FileAttachmentModel[]
  backUnLockDto: BackUnlockDto
}
