import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { ApiModel, ApiGroupModel, ApiSqlInfoModel } from '@/api/model/apiModel'

export interface ApiInterface extends BaseInterface<ApiModel> {
}

export class ApiInfoService implements ApiInterface {
  protected baseUlr: string =  'api/info'
  private request
  constructor() {
    this.request = new RequestService('apiUrl').service!
  }
  save(apiInfo: ApiModel): Promise<Response<ApiModel>> {
    return this.request.post(this.baseUlr, apiInfo)
  }
  update(T: ApiModel): Promise<Response> {
    return this.request.put(this.baseUlr, T)
  }
  list(searchParams: SearchParamsModel<ApiModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/search`, searchParams)
  }
  delete(code: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${code}`)
  }
  execute(dataSourceId: string,T: any): Promise<Response<ApiModel>> {
    return this.request.post(this.baseUlr+ `/execute/${dataSourceId}`, T)
  }
  publish(code: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/publish/${code}`)
  }
}
export class ApiGroupService{
  protected baseUlr: string =  'api/group'
  private request
  constructor() {
    this.request = new RequestService('apiUrl').service!
  }
  save(apiInfo: ApiGroupModel): Promise<Response<ApiModel>> {
    return this.request.post(this.baseUlr, apiInfo)
  }
  tree(apiInfo: ApiGroupModel): Promise<Response<ApiModel>> {
    return this.request.post(this.baseUlr + '/tree', apiInfo)
  }
  update(id: string,T: ApiGroupModel): Promise<Response> {
    return this.request.put(this.baseUlr + '/' + id, T)
  }
  list(searchParams: SearchParamsModel<ApiGroupModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/search`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
}

