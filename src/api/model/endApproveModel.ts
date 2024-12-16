import { FileAttachmentModel } from './fileAttachmentModel'
import { DepartmentModel } from './caseModel'
import { FlowModel, EndCheckModel } from './endCheckModel'
import { DisposeReportFormModel, DisposeFormModel } from './disposeModel'
import { ContactModel } from "@/api/model/disposeModel";
export interface ApproveRequestModel {
  attachmentInfos: FileAttachmentModel[]
  caseEndApproveDto: EndCheckModel
  departmentVo: DepartmentModel
  flowModel: FlowModel
  flowModelList?: FlowModel[]
  warnId?: string
  caseDispose: DisposeFormModel
  caseDisposeReportDto?: DisposeReportFormModel
  relations: ContactModel[]
}
