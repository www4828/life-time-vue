import RequestService from '@/utils/request'
import { CaseBackApplyModel } from '@/api/model/returnModel'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'

export interface ReturnApplyInterface {
}

export class QuestionnairesService implements ReturnApplyInterface {
  protected baseUlr: string =  'task-sms'
  private request
  constructor() {
    this.request = new RequestService('taskSmsUrl').service!
  }
  checkMobile(id:string,phone:string): Promise<Response> {
    return this.request.post(`task-sms/check/${id}/${phone}`)
  }
  getInfo(id:any): Promise<Response> {
    return this.request.get('task-sms/' + id)
  }
  postForm(form:any): Promise<Response> {
    return this.request.post('task-sms-back', form)
  }
  postbackForm(form:any): Promise<Response> {
    return this.request.post('task-sms-back/searchList', form)
  }
  checkSignature(id:string,phone:string,signature:string): Promise<Response> {
    return this.request.get(`task-login/login/${id}/${phone}/${signature}`)
  }
}