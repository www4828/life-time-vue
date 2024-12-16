import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { LogModel } from '@/api/model/logModel'

export interface LogInterface extends BaseInterface<LogModel> {
}

export class LogService implements LogInterface {
  protected baseUrl: string = 'operationLog'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  list(searchParams: SearchParamsModel<LogModel>): Promise<Response> {
    return this.request.post(this.baseUrl + `/searchList`, searchParams)
  }
  typeList(): Promise<Response> {
    return this.request.get(this.baseUrl + `/getOperationType`)
  }
}
