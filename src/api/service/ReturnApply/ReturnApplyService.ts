import RequestService from '@/utils/request'
import { CaseBackApplyModel } from '@/api/model/returnModel'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'

export interface ReturnApplyInterface {
  returnCaseApply(T: CaseBackApplyModel): Promise<Response>
}

export class ReturnApplyService implements ReturnApplyInterface {
  protected baseUlr: string =  'caseback'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  returnCaseApply(T: CaseBackApplyModel): Promise<Response> {
    return this.request.post(this.baseUlr + '/apply', T)
  }
  

}