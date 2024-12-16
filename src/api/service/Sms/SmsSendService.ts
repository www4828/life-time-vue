import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { SmsSendModel } from '@/api/model/smsSendModel'

export interface SmsSendInterface extends BaseInterface<SmsSendModel> {
    send(T: SmsSendModel): Promise<Response>
    getSendType(type:string):Promise<Response>
}

export class SmsSendService implements SmsSendInterface {
    protected baseUrl: string = 'smsRecord'
    private request
    constructor() {
        this.request = new RequestService('smsUrl').service!
    }
    list(searchParams: SearchParamsModel<SmsSendModel>): Promise<Response> {
        return this.request.post(this.baseUrl + `/searchList`, searchParams)
    }
    send(T: SmsSendModel): Promise<Response> {
        return this.request.post(this.baseUrl + `/send`, T)
    }
    getSendType(type:string): Promise<Response> {
        return this.request.post(this.baseUrl + `/smsConfigure/${type}`)
    }
}
