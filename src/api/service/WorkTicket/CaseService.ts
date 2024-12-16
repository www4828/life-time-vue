import RequestService from '@/utils/request'
import { CaseModel, CaseNumModel, RecoveryModel } from '@/api/model/caseModel'
import { CaseInfoModel } from '@/api/model/dispatchModel'
import { Response, SearchParamsModel } from '@/api/interface'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'

export interface CaseInterface {
  save(T: CaseModel): Promise<Response>
  getTaskInfo(taskId: string): Promise<Response>
  getSmrxHotJs(wpid: string): Promise<Response>
  list(T: SearchParamsModel<CaseInfoModel>): Promise<Response>
  destroyCase(T: CaseModel): Promise<Response>
  dispatchCase(T: CaseModel): Promise<Response>
  getCommonList(nodeCode: NodeCodeKey, T: SearchParamsModel<CaseInfoModel>, flowName: string): Promise<Response>
  getDisposedList(T: SearchParamsModel<CaseInfoModel>, nodeCode: NodeCodeKey, flowName: string): Promise<Response>
  getApprovedList(T: SearchParamsModel<CaseInfoModel>, nodeCode: NodeCodeKey, flowName: string): Promise<Response>
  getHistoryCase(mobile: string, taskId: string): Promise<Response>
  getBackDelayList(nodeCode: string, T: SearchParamsModel<CaseInfoModel>, flowName: string): Promise<Response>
  back(T: RecoveryModel):  Promise<Response>
  getCaseNum(deptCode: string):  Promise<Response<CaseNumModel[]>>
  getMyList(T: SearchParamsModel<CaseInfoModel>, flag: string): Promise<Response>
  getLimitTime(taskId: string, deptCode: string):Promise<Response<string>>
  getSearchList(T: SearchParamsModel<CaseInfoModel>): Promise<Response>
  getXFCaseNum(userId: string): Promise<Response>
}
export class CaseService implements CaseInterface {
  protected baseUlr: string = 'caseMain'
  private request;
  constructor() {
    this.request = new RequestService('flowUrl').service!
  } 
  getXFCaseNum(userId: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/${userId}/totalByUser`, { params: { flowName: '12319信访流程' }})
  }
  getSearchList(T: SearchParamsModel<CaseInfoModel>): Promise<Response> {
    return this.request.post(this.baseUlr + '/searchList', T)
  }
  getSendList(T: SearchParamsModel<CaseInfoModel>): Promise<Response> {
    return this.request.post(this.baseUlr + '/send-to-dept-list/', T)
  }
  getLimitTime(taskId: string, deptCode: string): Promise<Response<string>> {
    return this.request.get(this.baseUlr + `/calculateDealLineTime/${taskId}/${deptCode}`)
  }
  getMyList(T: SearchParamsModel<CaseInfoModel>, flag: string = '0'): Promise<Response> { // 1是查本部门 0是查我的  
    return this.request.post(this.baseUlr + `/myList/${flag}`, T)
  }
  getCaseNum(deptCode: string): Promise<Response<CaseNumModel[]>> {
    return this.request.get(this.baseUlr + `/${deptCode}/total`)
  }
  back(T: RecoveryModel): Promise<Response> {
    return this.request.post(this.baseUlr + `/recovery`, T)
  }
  getBackDelayList(nodeCode: string, T: SearchParamsModel<CaseInfoModel>, flowName: string): Promise<Response> {
    return this.request.post(this.baseUlr + `/list_12345/${nodeCode}/${flowName}`, T)
  }
  getHistoryCase(mobile: string, taskId?: string): Promise<Response> {
    return this.request.post(this.baseUlr + `/getHistoryList`, { mobile, taskId })
  }
  getDisposedList(T: SearchParamsModel<CaseInfoModel>, nodeCode: NodeCodeKey, flowName: string): Promise<Response> {
    return this.request.post(this.baseUlr + `/list/disposing/${nodeCode}/${flowName}`, T)
  }
  getApprovedList(T: SearchParamsModel<CaseInfoModel>, nodeCode: NodeCodeKey, flowName: string): Promise<Response> {
    return this.request.post(this.baseUlr + `/list/approving/${nodeCode}/${flowName}`, T)
  }
  getCommonList(nodeCode: string, T: SearchParamsModel<CaseInfoModel>, flowName: string): Promise<Response> {
    return this.request.post(this.baseUlr + `/list/${nodeCode}/${flowName}`, T)
  }
  destroyCase(T: CaseModel): Promise<Response> {
    return this.request.post(this.baseUlr + '/destroy', T)
  }
  dispatchCase(T: CaseModel): Promise<Response> {
    return this.request.post(this.baseUlr + '/dispatch', T)
  }
  save(T: CaseModel): Promise<Response> {
    return this.request.post(this.baseUlr, T)
  }
  update(T: any): Promise<Response> {
    return this.request.put(this.baseUlr, T)
  }
  getTaskInfo(taskId: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/${taskId}`)
  }
  list(T: SearchParamsModel<CaseInfoModel>): Promise<Response> {
    return this.request.post(this.baseUlr + '/searchList', T)
  }
  getSmrxHotJs(wpid: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/smrxHotJs/${wpid}`)
  }
  postCaseHotLu(params: any): Promise<Response> {
    return this.request.post(`/case-hotLu`,params)
  }
  postExportCase(T: any): Promise<Response> {
    return this.request.post(this.baseUlr + '/export', T)
  }
  getDownloadLog(T: any): Promise<Response> {
    return this.request.post(this.baseUlr + '/downloadLog',{}, { params: {...T}})
  }
  
}