import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel, Params } from '@/api/interface'

export interface ProcessModel {
    taskId: string
    createTime: string
  }
export interface CaseRecodeInterface {
    //   save(T: CaseModel): Promise<Response>
    //   getTaskInfo(taskId: string): Promise<Response>
    //   list(T: SearchParamsModel<CaseInfoModel>): Promise<Response>
    //   destroyCase(T: CaseModel): Promise<Response>
    //   dispatchCase(T: CaseModel): Promise<Response>
    //   getCommonList(nodeCode: NodeCodeKey, T:SearchParamsModel<CaseInfoModel>): Promise<Response>
    find(taskId: string): Promise<Response>
}
export class CaseRecodeService implements CaseRecodeInterface {
    protected baseUlr: string = 'CaseRecode'
    private request;
    constructor() {
        this.request = new RequestService('flowUrl').service!
    }
    find(taskId: string): Promise<Response> {
        return this.request.get(this.baseUlr + `/getRecord/${taskId}`)
    }
    list(T: SearchParamsModel<ProcessModel>): Promise<Response> {
        return this.request.post(this.baseUlr + '/searchList', T )
    }
    detail(params: any): Promise<Response> {
      return this.request.get('process/detail',{params})
    }
    getCompareRecord(params: any): Promise<Response> {
      return this.request.get(this.baseUlr + `/getCompareRecord/${params.reviewTaskId}/${params.taskId}`)
    }
}