import RequestService from '@/utils/request'
import { CaseModel, CaseNumModel, RecoveryModel } from '@/api/model/caseModel'
import { ContactModel,CaseDisposeModel, CompanyModel } from '@/api/model/disposeModel'
import { CaseInfoModel } from '@/api/model/dispatchModel'
import { Response, SearchParamsModel } from '@/api/interface'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'

export interface CaseInterface {
  save(T: ContactModel): Promise<Response>
  getTaskInfo(taskId: string): Promise<Response>
  getSmrxHotJs(wpid: string): Promise<Response>
  list(T: SearchParamsModel<CaseInfoModel>): Promise<Response>
  destroyCase(T: CaseModel): Promise<Response>
  getCommonList(nodeCode: NodeCodeKey, T: SearchParamsModel<CaseInfoModel>, flowName: string): Promise<Response>
  getDisposedList(T: SearchParamsModel<CaseInfoModel>, nodeCode: NodeCodeKey, flowName: string): Promise<Response>
  getApprovedList(T: SearchParamsModel<CaseInfoModel>, nodeCode: NodeCodeKey, flowName: string): Promise<Response>
  getHistoryCase(mobile: string, taskId: string): Promise<Response>
  getBackDelayList(nodeCode: string, T: SearchParamsModel<CaseInfoModel>, flowName: string): Promise<Response>
  back(T: RecoveryModel):  Promise<Response>
  getCaseNum(deptCode: string):  Promise<Response<CaseNumModel[]>>
  getMyList(T: SearchParamsModel<CaseInfoModel>, flag: string): Promise<Response>
  getSearchList(T: SearchParamsModel<CaseInfoModel>): Promise<Response>
}
export class LettersVisitService implements CaseInterface {
  protected baseUlr: string = 'xf-caseMain'
  private request;
  constructor() {
    this.request = new RequestService('flowUrl').service!
  } 
  getDeptByRoleId(roleId: string,deptCode: string): Promise<Response> { // 根据roleId获取部门列表
    return this.request.get(`xf-other/getDept/${roleId}/${deptCode}`)
  }
  getUserByDeptCode(roleId: string,deptCode: string): Promise<Response> { // 根据roleId和部门获取用户列表
    return this.request.get(`xf-other/getUser/${roleId}/${deptCode}`)
  }
  getSearchList(T: SearchParamsModel<CaseInfoModel>): Promise<Response> { // 获取信访案件列表
    return this.request.post(this.baseUlr + '/searchList', T)
  }
  find(taskId: string): Promise<Response> { // 获取信访案件流程
    return this.request.get(`XF-CaseRecode/getRecord/${taskId}`)
  }
  getRecordList(T: SearchParamsModel<CaseInfoModel>): Promise<Response> { // 获取信访案件流程
    return this.request.post(`XF-CaseRecode/searchList`, T)
  }
  getCompareRecord(params: any): Promise<Response> {
    return this.request.get(`XF-CaseRecode/getCompareRecord/${params.reviewTaskId}/${params.taskId}`)
  }
  getReflectType(code: string,type: string): Promise<Response> { // 获取当前可跳转环节
    return this.request.get(`/reflect/type?dictionaryType=0&parentCode=${code}&typeCode=${type}`)
  }
  postXfAcceptCensor(T:any): Promise<Response> { // 受理审查
    return this.request.post(`xf-slsc`,T)
  }
  getAcceptCensorList(T: SearchParamsModel<CaseInfoModel>): Promise<Response> { // 获取受理审查结果
    return this.request.post('xf-slsc/searchList', T)
  }
  postXfAcceptCheck(T:any): Promise<Response> { // 受理复核-审核
    return this.request.post(`xf-sl-check`,T)
  }
  getXfAcceptCheckList(T: SearchParamsModel<CaseInfoModel>): Promise<Response> { // 获取受理复核审核结果
    return this.request.post('xf-sl-check/searchList', T)
  }
  postXfDeal(T:any): Promise<Response> { // 办理
    return this.request.post(`xf-bl`,T)
  }
  postXfResult(T:any): Promise<Response> { // 结果
    return this.request.post(`xf-jg`,T)
  }
  getCaseDisposeByTaskId(taskId: string, deptCode: string): Promise<Response> {
    return this.request.get(`caseDispose/findByTaskId/${taskId}`, {params: { deptCode }})
  }
  getCaseDisposeList(searchParams: SearchParamsModel<CaseInfoModel>): Promise<Response> {
    return this.request.post(`caseDispose/searchList`,searchParams)
  }
  getIsEnableBack(taskId: string,deptcode: string): Promise<Response> { // 查询是否退单
    return this.request.get(`caseMain/isEnableBack/${taskId}/${deptcode}`)
  }

  postXfCaseHotLu(params: any): Promise<Response> { // 信访次紧急反馈
    return this.request.post(`xf-case-hotLu`,params)
  }
  

  getFormatSplitOrder(taskId: string): Promise<Response> { // 格式化信拆单的信息
    return this.request.get(`/xf-caseMain/format/${taskId}`)
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
  // getMyCaseList(nodeCode: string, T: SearchParamsModel<CaseInfoModel>, flowName: string): Promise<Response> {
  //   return this.request.post(this.baseUlr + `/list/my-case/${nodeCode}/${flowName}/${flag}`, T)
  // }
  getMyCaseList(T: SearchParamsModel<CaseInfoModel>, flag: string = '3'): Promise<Response> {
    return this.request.post(this.baseUlr + `/list/my-case-record/${flag}`, T)
  }
  destroyCase(T: CaseModel): Promise<Response> {
    return this.request.post(this.baseUlr + '/destroy', T)
  }

  save(T: ContactModel): Promise<Response> {
    return this.request.post('caseRelation/xf', T)
  }
  saveCompany(T: {'caseRelation':ContactModel,'companies': Array<CompanyModel>}): Promise<Response> {
    return this.request.post('caseRelation/company/xf', T)
  }
  getTaskInfo(taskId: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/${taskId}`)
  }
  list(T: SearchParamsModel<CaseInfoModel>): Promise<Response> {
    return this.request.post('caseRelation' + '/searchList', T)
  }
  getSmrxHotJs(wpid: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/smrxHotJs/${wpid}`)
  }
}