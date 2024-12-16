import RequestService from '@/utils/request'
import { CheckRequestModel } from '@/api/model/endCheckModel'
import { Response } from '@/api/interface'

export interface EndCheckInterface {
  save(T: CheckRequestModel): Promise<Response>
}

export class EndCheckService implements EndCheckInterface {
  protected baseUlr: string =  'endcheck'
  private request;
  constructor () {
      this.request = new RequestService('flowUrl').service!
  }
  save(T: CheckRequestModel): Promise<Response> {
      return this.request.post(this.baseUlr + '/check', T)
  }
  saveBatch(T: CheckRequestModel): Promise<Response> {
      return this.request.post(this.baseUlr + '/check/batch', T)
  }
  find(id: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/${id}`)
  }
}