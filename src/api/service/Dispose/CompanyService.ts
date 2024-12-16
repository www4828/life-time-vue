import RequestService from '@/utils/request'
import { Response, SearchParamsModel } from '@/api/interface'
import { CompanyModel } from '@/api/model/disposeModel'
export interface UrgeInterface {
    save(T: CompanyModel): Promise<Response>
}
export class CompanyService implements UrgeInterface {
    protected baseUlr: string = '/caseRelationCompany'
    
    private request;
    constructor() {
        this.request = new RequestService('flowUrl').service!
    }
    save(T: CompanyModel): Promise<Response> { 
        return this.request.post('/caseRelationCompany', T)
    }
    update(T: CompanyModel): Promise<Response> {
      return this.request.put(this.baseUlr + `/${T.id}`, T)
    }
    list(searchParams: SearchParamsModel<CompanyModel>): Promise<Response> {
      return this.request.post(this.baseUlr + `/searchList`, searchParams)
    }
    delete(id: string): Promise<Response> {
      return this.request.delete(this.baseUlr + `/${id}`)
    }
    getById(id: string): Promise<Response> {
      return this.request.get(this.baseUlr + `/${id}`)
    }
    postFindByTaskId(taskId: string): Promise<Response> {
      return this.request.post(`/caseRelationCompany/findByTaskId/${taskId}`)
    }
    getQyzz(dwmc:string): Promise<Response> { // 单位名称
      return this.request.get(`CiacAuthentication/getQyzz/${dwmc}`)
    }
}