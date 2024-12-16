import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { SupervisionModel } from '@/api/model/supervisionModel'

export interface SupervisionInterface extends BaseInterface<SupervisionModel> {
}

export class SupervisionService implements SupervisionInterface {
  protected baseUlr: string = 'supervision'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  find(id: string): Promise<Response> {
    return this.request.get(this.baseUlr + `${id}`)
  }
  save(permission: SupervisionModel): Promise<Response> {
    return this.request.post(this.baseUlr, permission)
  }
  update(T: SupervisionModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  list(searchParams: SearchParamsModel<SupervisionModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/searchList`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
}
