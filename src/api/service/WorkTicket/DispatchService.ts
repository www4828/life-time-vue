import RequestService from '@/utils/request'
import { DispatchResponseModel } from '@/api/model/dispatchModel'
import { Response, SearchParamsModel } from '@/api/interface'
import { CaseModel } from '@/api/model/caseModel'
export interface DispatchInterface {
  save(T: CaseModel,taskId:string): Promise<Response>

}

export class DispatchService implements DispatchInterface {
  protected baseUlr: string = 'caseDispatch'
  private request;
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  list(searchParams: SearchParamsModel<DispatchResponseModel>): Promise<Response> {
    return this.request.post(this.baseUlr + '/list', searchParams)
  }
  save(T: CaseModel,taskId:string): Promise<Response> {
    return this.request.post(this.baseUlr + `/${taskId}`, T)
  }
  getDisposeDepartment(taskId: string, departmentCode: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/getDisposeDepartment/${taskId}/${departmentCode}`)
  }
  getCaseDesTypeByTaskId(taskId: string, deptCode: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/findOneByTask`, {params: { taskId, deptCode }})
  }
  saveBatch(T: CaseModel): Promise<Response> {
    return this.request.post(this.baseUlr + `/batch`, T)
  }
}