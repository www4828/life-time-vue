import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { PortalModel } from '@/api/model/portalModel'

export interface WorkRemindInterface extends BaseInterface<PortalModel> { 
    updateStatus(id: number, status: number): Promise<Response>
}

export class WorkRemindService implements WorkRemindInterface {
    protected baseUlr: string = 'workRemind'
    private request
    constructor() {
        this.request = new RequestService('sysUrl').service!
    }
    save(T: PortalModel): Promise<Response> {
        return this.request.post(this.baseUlr, T)
    }
    delete(id: string): Promise<Response> {
        return this.request.delete(this.baseUlr + `/${id}`)
    }
    list(searchParams: SearchParamsModel<PortalModel>): Promise<Response> {
        return this.request.post(this.baseUlr + `/searchList`, searchParams)
    }
    updateStatus(id: number, status: number): Promise<Response> {
        return this.request.post(this.baseUlr + `/updateStatus/${id}/${status}`)
    }
    findById(id: string): Promise<Response> {
      return this.request.get(this.baseUlr + `/${id}`)
    }
}
