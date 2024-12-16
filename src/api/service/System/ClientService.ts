import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { ClientModel } from '@/api/model/clientModel'

export interface ClientInterface extends BaseInterface<ClientModel> {
}

export class ClientService implements ClientInterface {
  protected baseUrl: string = 'client'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  find(id: string): Promise<Response> {
    return this.request.get(this.baseUrl + `${id}`)
  }
  save(permission: ClientModel): Promise<Response> {
    return this.request.post(this.baseUrl, permission)
  }
  update(T: ClientModel): Promise<Response> {
    return this.request.put(this.baseUrl, T)
  }
  list(searchParams: SearchParamsModel<ClientModel>): Promise<Response> {
    return this.request.post(this.baseUrl + `/searchList`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUrl + `/${id}`)
  }
  resetPassword(password: string,clientId: string): Promise<Response> {
    return this.request.get(this.baseUrl + `/password/${password}/${clientId}`)
  }
}
