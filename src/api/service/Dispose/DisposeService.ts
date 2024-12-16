import RequestService from '@/utils/request'
import { CaseDispatchModel } from '@/api/model/caseModel'
import { ContactModel, CaseDisposeModel, DisposeFormModel, CompanyModel, CroupVisitModel } from '@/api/model/disposeModel'
import { Response, SearchParamsModel } from '@/api/interface'

export interface DisposeInterface {
    save(T: ContactModel): Promise<Response>
}
export class DisposeService implements DisposeInterface {
    protected baseUlr: string = 'caseRelation'
    protected url: string = 'caseDispose'
    protected reportUrl: string = 'caseDisposeReport'
    private request;
    constructor() {
        this.request = new RequestService('flowUrl').service!
    }
    save(T: ContactModel): Promise<Response> { // 先行联系
        return this.request.post(this.baseUlr, T)
    }
    saveCompany(T: {'caseRelation':ContactModel,'companies': Array<CompanyModel>}): Promise<Response> {
      return this.request.post('caseRelation/company/111', T)
    }
    list(searchParams: SearchParamsModel<ContactModel>): Promise<Response<any>> {
        return this.request.post(this.baseUlr + '/searchList', searchParams)
    }
    getReportList(searchParams: SearchParamsModel<ContactModel>): Promise<Response> {
      return this.request.post(this.reportUrl + '/searchList', searchParams)
    }
    getOneReport(taskId: string): Promise<Response> {
      return this.request.get(this.reportUrl + '/getOne'+ `/${taskId}`)
    }
    saveStaging(T: CaseDisposeModel): Promise<Response> {
      return this.request.post(this.url + '/Staging', T)
    }
    saveCaseDis(T: CaseDisposeModel, taskId: string): Promise<Response> {
      return this.request.post(this.url +`/${taskId}`, T)
    }
    saveCaseDisposeBatch(T: CaseDisposeModel): Promise<Response> {
      return this.request.post(this.url +`/batch`, T)
    }
    getCaseDisposeDetail(recorId: string): Promise<Response> {
      return this.request.get(this.url + `/${recorId}`)
    }
    getCaseDisposeList(searchParams: SearchParamsModel<DisposeFormModel>): Promise<Response> {
      return this.request.post(this.url + '/searchList', searchParams)
    }
    getCaseDisposeByTaskId(taskId: string, deptCode: string): Promise<Response> {
      return this.request.get(this.url + `/findByTaskId/${taskId}`, {params: { deptCode }})
    }
    findOhter(taskid:string, deptCode:string): Promise<Response> {
      return this.request.get(`caseDispatch/findOtherExecute/${taskid}/${deptCode}`)
    }
    getDepartmentList(deptCode: string): Promise<Response> {
      return this.request.get(this.url + `/findSignedUnit/${deptCode}`,)
    }
    caseReceive(T: ContactModel): Promise<Response> { // 接单
      return this.request.post('caseReceive', T)
    }
    caseReceiveBatch(T: ContactModel): Promise<Response> { // 接单
      return this.request.post('caseReceive/batch', T)
    }
    returnApply(T: ContactModel): Promise<Response> { // 退单申请
      return this.request.post('caseback/apply', T)
    }
    returnHotApply(T: ContactModel): Promise<Response> { // 退单申请
      return this.request.post('caseback/hotApply', T)
    }
    getReturnDetailByBackId(id:string): Promise<Response> { // 根据退单id获取12345退单详情
      return this.request.get('caseback/findByBackId/'+ id)
    }
    getReturnList(taskId:string,params:any): Promise<Response> { // 退单申请获取backid
      return this.request.get('caseback/findByTaskId/'+ taskId , { params })
    }
    backCheck(T: ContactModel): Promise<Response> { // 退单审核
      return this.request.post('back/check', T)
    }
    backHotCheck(T: ContactModel): Promise<Response> { // 退单审核
      return this.request.post('back/hotCheck', T)
    }
    backApprove(T: ContactModel,taskid:string): Promise<Response> { // 退单审批
      return this.request.post(`back/approve/${taskid}`, T)
    }
    backHotApprove(T: ContactModel): Promise<Response> { // 退单审批
      return this.request.post(`back/hotApprove`, T)
    }
    dispatchCase(T: ContactModel,taskId:string): Promise<Response> {
      return this.request.post(`/caseDispatch/${taskId}`, T) // 向下派遣
    }
    getDispatchDeptList(deptCode: string, taskId: string): Promise<Response<CaseDispatchModel[]>> {
      return this.request.post('/caseDispatch/findListByTask',  { baseDeptCode: deptCode, deptCode, taskId }) // 获取派遣部门
    }
    getDispatchList(searchParams: SearchParamsModel<DisposeFormModel>): Promise<Response> {
      return this.request.post('/caseDispatch/searchList',  searchParams) // 获取派遣部门
    }
    getDispatchNote(taskId:string,departmentCode:string): Promise<Response> {
      return this.request.get(`/caseDispatch/getDispatchNote/${taskId}/${departmentCode}`) // 获取派遣描述
    }
    postCaseSynergy(T: any): Promise<Response> { // 申请协办
      return this.request.post('caseSynergy', T)
    }
    synergyCheck(T: any): Promise<Response> { // 协办审核
      return this.request.post('caseSynergyCheck', T)
    }
    synergyApprove(T: any): Promise<Response> { // 协办审批
      return this.request.post('caseSynergyApprove', T)
    }
    getSynergyApplyInfo(taskId: string): Promise<Response> { // 获取协办申请信息
      return this.request.get('caseSynergy/getSynergy/'+taskId)
    }
    getSynergyCheckInfo(taskId: string): Promise<Response> { // 获取协办审核信息
      return this.request.get('caseSynergyCheck/getSynergyCheck/'+taskId)
    }
    getSynergyDepartment(taskId: string): Promise<Response> { // 获取协办部门code
      return this.request.get('caseSynergy/getSynergyDepartment/'+taskId)
    }
    delayApply(T: ContactModel): Promise<Response> { // 延期申请
      return this.request.post('delay/apply', T)
    }
    getDelayList(taskId:string,params:any): Promise<Response> { // 获取延期申请id
      return this.request.get('delay/findByTaskId/'+ taskId , { params })
    }
    getCheckList(taskId:string,params:any): Promise<Response> { // 获取延期审核信息
      return this.request.get('delay/check/'+ taskId , { params })
    }
    getApproveList(taskId:string,params:any): Promise<Response> { // 获取延期审批信息
      return this.request.get('delay/approve/'+ taskId , { params })
    }
    delayCheck(T: ContactModel): Promise<Response> { // 延期审核
      return this.request.post('delay/check', T)
    }
    delayApprove(T: ContactModel): Promise<Response> { // 延期审批
      return this.request.post('delay/approve', T)
    }
    delayFindDispatch(taskId:string,deptCode:string,baseDeptCode:string): Promise<Response> { // 根据部门查询派遣信息
      return this.request.get(`delay/findDispatch/${taskId}?deptCode=${deptCode}&baseDeptCode=${baseDeptCode}`)
    }
    delayApproveCheckTime(params:any): Promise<Response> { // 查询是否需要向上审批
      return this.request.get(`delay/approve/checkTime`,{params})
    }
    getBjZjgcForXfxt(bjbh:string): Promise<Response> { // 通过报建编号获取项目信息报送数据
      return this.request.post(`CiacAuthentication/getBjZjgcForXfxt/${bjbh}`)
    }
    getWorkerYg(params: any): Promise<Response> { // 通过报建编号、实名制工人姓名、实名制工人身份证号，验证该工人在该项目上，是否有进场记录
      return this.request.post(`CiacAuthentication/getWorkerYg`,{params})
    }
    getZbdwForXfxt(bjbh:string): Promise<Response> { // 通过报建编号获取施工总包单位信息
      return this.request.post(`CiacAuthentication/getZbdwForXfxt/${bjbh}`)
    }
    getQymcList(dwmc:string): Promise<Response> { // 查询单位名称
      return this.request.get(`CiacAuthentication/getQymcList/${dwmc}`)
    }
    getQyzz(dwmc:string): Promise<Response> { // 单位名称
      return this.request.get(`CiacAuthentication/getQyzz/${dwmc}`)
    }
    getFromConfig(departmnetCode:string,reflectCode:string): Promise<Response> { // 查询表单配置
      return this.request.get(`/from/getFromConfig/${departmnetCode}/${reflectCode}`)
    }
    saveForm(params:any): Promise<Response> { // 保存个性化表单
      return this.request.post(`CiacAuthentication`, params)
    }
    updateForm(params:any,id:String): Promise<Response> { // 更新个性化表单
      return this.request.put(`CiacAuthentication/${id}`, params)
    }
    getFromInfo(params:any): Promise<Response> { // 查询表单填写信息
      return this.request.post(`CiacAuthentication/searchList`, params)
    }
    getIsEnableBack(taskId:String,deptCode:String): Promise<Response> { // 查询是否能退单
      return this.request.get(`caseMain/isEnableBack/${taskId}/${deptCode}`)
    }
    getNextDepartment(externalNumber:String,deptId:string): Promise<Response> { // 根据12345工单号码 获取其他部门信息
      return this.request.get(`caseback/findNextDepartment/${externalNumber}?deptId=${deptId}`)
    }
    sendToDept(params:any): Promise<Response> { // 抄送部门批注接口
      return this.request.post(`caseMain/send-to-dept-comment`, params)
    }
    findCooperation(taskId:string,deptCode:string): Promise<Response> { // 
      return this.request.get(`/caseDispatch/findCooperation/${taskId}/${deptCode}`)
    }
    getWarnInfo(uuid:string,): Promise<Response> { // 
      return this.request.get(`/warn-alarm/${uuid}`)
    }
    getWarnList(taskId:string,warnId:string,flowName:string,nodeCode:string,params:any): Promise<Response> { // 
      return this.request.post(`/warn-alarm/task/${taskId}/${warnId}/${flowName}/${nodeCode}`,params)
    }
    getBatchRecordList(searchParams: SearchParamsModel<CroupVisitModel>): Promise<Response> { // 
      return this.request.post(`/batch/record/search/count`,searchParams)
    }
    getBatchCaseList(searchParams: SearchParamsModel<CroupVisitModel>): Promise<Response> { // 
      return this.request.post(`/batch/record/search`,searchParams)
    }
}