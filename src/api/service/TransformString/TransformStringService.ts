import RequestService from '@/utils/request'
import { Response } from '@/api/interface'

export interface TransformInterface {
  transformTo(str: string): Promise<Response>
  getLimitTime(date: number, minute: string): Promise<Response>
  getDeadlineWithTime(date: number, minute: string, time?:string): Promise<Response>
}

export class TransformToService implements TransformInterface {
  protected baseUlr: string = '/calculate'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  transformTo(str: string): Promise<Response<string>> {
    return this.request.get(this.baseUlr + `/getExchange/${str}`)
  }
  getLimitTime(date: number, minute: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/getDeadline/${date}/${minute}`)
  }
  getDeadlineWithTime(date: number, minute: string, time?:string): Promise<Response> {
    return this.request.get(this.baseUlr + `/getDeadlineWithTime/${date}/${minute}` + (time ? `/${time}` : ''))
  }
  getDeadline(taskId: string, type: string, dayTime: string): Promise<Response> {
    return this.request.get(`/calculate/deadline/${taskId}/${dayTime}/${Number(type)}`)
  }
}