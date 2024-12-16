import { DepartmentModel } from './caseModel'
import { FlowModel } from './endCheckModel'
import { FileAttachmentModel } from './fileAttachmentModel'
import { DisposeFormModel, DisposeReportFormModel, ContactModel } from './disposeModel'

export interface CaseArchiveEntity {
  agent: string
  // 经办人

  appleTime: string
  // 申请时间

  departmentCode: string
  //操作部门

  description: string
  //存电描述

  dispatchId: string
  //派遣表ID

  flag: string
  //存电标记

  isArrive: string
  //有无实际现场

  person: string
  //来电人

  principal: string
  //负责人

  recordId: string
  //记录表ID

  relationTaskIdFifth: string
  //关联工单5

  relationTaskIdFirst: string
  //关联工单1

  relationTaskIdFourth: string
  //关联工单4

  relationTaskIdSecond: string
  //关联工单2

  relationTaskIdSixth: string
  //关联工单6

  relationTaskIdThird: string
  //关联工单3

  sort?: number
  //排序

  status?: string
  //状态

  taskId: string
  //工单编号
  phone: string
  [index: string]: any
}
export interface CaseArchiveCheckApproveEntity {
  archiveId: string
  //存电表ID
  content: string
  //审核意见
  person: string
  //审核处理人
  recordId: string
  //记录ID
  time: string
  //审核时间
  taskId: string
  //工单编号
  result: string
  //审核结果
}
export interface CaseArchiveModel {
  attachmentInfos: FileAttachmentModel[]
  caseArchiveEntity: CaseArchiveEntity
  caseDisposeDto: DisposeFormModel
  department: DepartmentModel
  caseDisposeReportDto: DisposeReportFormModel
  flowModel: FlowModel
}

export interface CaseArchiveApproveModel extends Pick<CaseArchiveModel, 'attachmentInfos' | 'caseArchiveEntity' | 'flowModel' |  'caseDisposeReportDto'> {
  caseDispose: DisposeFormModel
  departmentVo: DepartmentModel
  caseArchiveApproveEntity: CaseArchiveCheckApproveEntity
  relations: ContactModel[]
}

export interface CaseArchiveCheckModel extends Pick<CaseArchiveModel, 'attachmentInfos' | 'caseArchiveEntity' | 'flowModel' |  'caseDisposeReportDto'> {
  caseDispose: DisposeFormModel
  departmentVo: DepartmentModel
  caseArchiveCheckEntity: CaseArchiveCheckApproveEntity
}