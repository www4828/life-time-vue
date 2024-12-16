
import RequestService from '@/utils/request'

export class phone {
  private request;
  private requestR;
  constructor() {
    this.request = new RequestService('phoneUrl').service!
    this.requestR = new RequestService('flowUrl').service!
  }

  getToken(data: any): Promise<Response> {
    return this.request.post(`/auth/exchange`, data)
  }
  save(T: any): Promise<Response> {
    return this.requestR.post(`/phone-record`, T)
  }
}