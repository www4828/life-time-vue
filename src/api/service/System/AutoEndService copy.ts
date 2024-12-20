import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { AutoEndConfigModel } from '@/api/model/autoEndConfigModel'

export interface ClientInterface extends BaseInterface<AutoEndConfigModel> {
}

export class AutoEndService implements ClientInterface {
  protected baseUrl: string = 'autoEnd/config'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  save(permission: AutoEndConfigModel): Promise<Response> {
    return this.request.post(this.baseUrl, permission)
  }
  update(T: AutoEndConfigModel): Promise<Response> {
    return this.request.put(this.baseUrl + `/${T.id}`, T)
  }
  list(searchParams: SearchParamsModel<AutoEndConfigModel>): Promise<Response> {
    return this.request.post(this.baseUrl + `/searchList`, searchParams)
  }
  delete(id: any): Promise<Response> {
    return this.request.delete(this.baseUrl + `/${id}`)
  }
}
