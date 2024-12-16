import { FileAttachmentModel } from './fileAttachmentModel'
import { DepartmentModel } from './caseModel'
import { DisposeReportFormModel, DisposeFormModel } from './disposeModel'

export interface FlowModel {
  lineId: string
  processId: string
  code: string
}

export interface EndCheckModel {
  content: string
  person: string
  recordId?: string
  result: string
  taskId: string
  time: string
  disposeId?: string
  disposeReportId: string
  executeType?: string
}

export interface CheckRequestModel {
  attachmentInfos: FileAttachmentModel[]
  caseEndCheckDto: EndCheckModel
  departmentVo: DepartmentModel
  flowModel: FlowModel
  flowModelList?: FlowModel[]
  warnId?: string
  caseDispose: DisposeFormModel
  caseDisposeReportDto?: DisposeReportFormModel
}
