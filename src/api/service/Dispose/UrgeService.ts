import RequestService from '@/utils/request'
import { UrgeModel } from '@/api/model/urgeModel'
import { Response, SearchParamsModel } from '@/api/interface'
export interface UrgeInterface {
    save(T: UrgeModel): Promise<Response>
}
export class UrgeService implements UrgeInterface {
    protected baseUlr: string = 'caseUrge'
    
    private request;
    constructor() {
        this.request = new RequestService('flowUrl').service!
    }
    save(T: UrgeModel): Promise<Response> { 
        return this.request.post(this.baseUlr, T)
    }
}