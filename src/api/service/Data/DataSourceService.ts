import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { DataSourceModel } from '@/api/model/dataModel'

export interface DataSourceInterface extends BaseInterface<DataSourceModel> {
}

export class DataSourceService implements DataSourceInterface {
  protected baseUlr: string =  'dataSource'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  tree(searchParams?: SearchParamsModel<DataSourceModel>): Promise<Response> {
    return this.request.post(this.baseUlr + '/tree', searchParams)
  }
  save(permission: DataSourceModel): Promise<Response<DataSourceModel>> {
    return this.request.post(this.baseUlr, permission)
  }
  update(T: DataSourceModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  list(searchParams: SearchParamsModel<DataSourceModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/search`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
}
