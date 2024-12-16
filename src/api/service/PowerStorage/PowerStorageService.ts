import RequestService from '@/utils/request'
import { CaseArchiveModel, CaseArchiveApproveModel, CaseArchiveCheckModel, CaseArchiveEntity } from '@/api/model/powerStorageModel'
import { Response, SearchParamsModel } from '@/api/interface'

export interface PowerStorageInterface {
  save(model: CaseArchiveModel): Promise<Response>
  powerStageApprove(T: CaseArchiveApproveModel): Promise<Response<CaseArchiveEntity>>
  powerStageCheck(T: CaseArchiveCheckModel): Promise<Response<CaseArchiveEntity>>
  getApproveInfoByRecordId(recordId: string): Promise<Response>
  getCheckInfoByRecordId(recordId: string): Promise<Response>
  searchList(searchParams: SearchParamsModel<CaseArchiveEntity>): Promise<Response>
}

export class PowerStorageService implements PowerStorageInterface {
  protected baseUlr: string = '/archive'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  searchList(searchParams: SearchParamsModel<CaseArchiveEntity>): Promise<Response> {
    return this.request.post(this.baseUlr + '/searchList', searchParams)
  }
  powerStageCheck(T: CaseArchiveCheckModel): Promise<Response> {
    return this.request.post(this.baseUlr + '/check', T)
  }
  getApproveInfoByRecordId(recordId: string): Promise<Response<CaseArchiveEntity>> {
    return this.request.get(this.baseUlr + '/approve/' + recordId)
  }
  getCheckInfoByRecordId(recordId: string): Promise<Response<CaseArchiveEntity>> {
    return this.request.get(this.baseUlr + '/check/' + recordId)
  }
  powerStageApprove(T: CaseArchiveApproveModel): Promise<Response> {
    return this.request.post(this.baseUlr + '/approve', T)
  }
  save(model: CaseArchiveModel): Promise<Response> {
    return this.request.post(this.baseUlr, model)
  }
}
