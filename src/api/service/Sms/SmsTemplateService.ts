import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { SmsTemplateModel } from '@/api/model/smsTemplateModel'

export interface SmsTemplateInterface extends BaseInterface<SmsTemplateModel> {
}

export class SmsTemplateService implements SmsTemplateInterface {
    protected baseUrl: string = 'smsTemplate'
    private request
    constructor() {
        this.request = new RequestService('smsUrl').service!

    }
    save(T: SmsTemplateModel): Promise<Response> {
        return this.request.post(this.baseUrl, T)
    }
    update(T: SmsTemplateModel): Promise<Response> {
        return this.request.put(this.baseUrl + `/${T.id}`, T)
    }
    delete(id: string): Promise<Response> {
        return this.request.delete(this.baseUrl + `/${id}`)
    }
    list(searchParams: SearchParamsModel<SmsTemplateModel>): Promise<Response> {
        return this.request.post(this.baseUrl + `/searchList`, searchParams)
    }
}
