import RequestService from '@/utils/request'
import { ApproveRequestModel } from '@/api/model/endApproveModel'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'

export interface EndApproveInterface extends BaseInterface<ApproveRequestModel>{
  
}

export class EndApproveService implements EndApproveInterface {
  protected baseUlr: string =  'endapprove'
  private request;
  constructor () {
      this.request = new RequestService('flowUrl').service!
  }
  save(T: ApproveRequestModel): Promise<Response> {
      return this.request.post(this.baseUlr + '/approve', T)
  }
  approve(T: ApproveRequestModel,taskid:string): Promise<Response> {
    return this.request.post(this.baseUlr + '/approve/'+ taskid, T)
  }
  approveBatch(T: ApproveRequestModel,taskid:string): Promise<Response> {
    return this.request.post(this.baseUlr + `/batch/${taskid}`, T)
  }
  find(id: string): Promise<Response> {
      return this.request.get(this.baseUlr + `/${id}`)
  }
}