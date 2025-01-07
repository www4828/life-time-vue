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
  catalog(id: string): Promise<Response> { // 数据库目录
    return this.request.post(this.baseUlr + `/catalog/${id}`)
  }
  column(schema: string, table: string, id: string): Promise<Response> { // 数据库字段
    return this.request.post(this.baseUlr + `/column/${schema}/${table}/${id}`)
  }
  connect(id: string): Promise<Response> { // 测试链接
    return this.request.post(this.baseUlr + `/connect/${id}`)
  }
  schema(catalog: string, id: string): Promise<Response> { //  数据库模式
    return this.request.post(this.baseUlr + `/schema/${catalog}/${id}`)
  }
  table(schema: string, id: string): Promise<Response> { // 数据库表单
    return this.request.post(this.baseUlr + `/table/${schema}/${id}`)
  }
}
