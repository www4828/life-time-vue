import { PageInfoModel, SearchModel } from '../model/baseModel'

export interface Response<T = any> {
  code: string | number
  data: T
  message?: string
}
export interface EsResponse<T = any> {
  access_token: string
  values: T
}
//查询对象
export class SearchParamsModel<T> {
  pageParams: PageInfoModel
  searchParams?: SearchModel<T>[]
  otherParams?:SearchModel<T>[]
  constructor() {
    this.pageParams = new PageInfoModel()
  }
}
export interface BaseInterface<T> {
  save?(T: T): Promise<Response> //保存⼀个实体
  update?(T: T): Promise<Response> //更新⼀个实体
  delete?(id: string): Promise<Response> //删除⼀个实体
  find?(id: string): Promise<Response> //根据主键id查询⼀个实体
  list?(searchParams: SearchParamsModel<T>): Promise<Response> //查询列表
}

export interface Params<T = any> {
  method: string
  url: string
  data: T
  urlKey: string
  headers?: T
}
