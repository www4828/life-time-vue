import { FileAttachmentModel, NodeCodeKey } from './fileAttachmentModel'
import { DepartmentModel, CaseFormModel } from './caseModel'
import { FlowModel } from './endCheckModel'

export  interface CaseBackApply {
  applyPerson: string
  applyTime: string
  chargePerson: string
  chargeReason: string
  description: string
  nodeCode: NodeCodeKey
}

export interface CaseBackApplyModel {
  attachmentInfos: FileAttachmentModel[]
  caseBackApplyDto: CaseBackApply
  departmentVo: DepartmentModel
  flowModel: FlowModel
  caseInfo: CaseFormModel
}