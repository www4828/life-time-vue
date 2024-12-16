import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { DistributionUserModel } from '@/api/model/distributionUserModel'

export interface DistributionUserInterface extends BaseInterface<DistributionUserModel> {
}
export class DistributionUserService implements DistributionUserInterface {
    protected baseUrl: string = 'distributionUser'
    private request
    constructor() {
        this.request = new RequestService('smsUrl').service!

    }
    save(T: DistributionUserModel): Promise<Response> {
        return this.request.post(this.baseUrl, T)
    }
    update(T: DistributionUserModel): Promise<Response> {
        return this.request.put(this.baseUrl + `/${T.id}`, T)
    }
    delete(id: string): Promise<Response> {
        return this.request.delete(this.baseUrl + `/${id}`)
    }
    list(searchParams: SearchParamsModel<DistributionUserModel>): Promise<Response> {
        return this.request.post(this.baseUrl + `/searchList`, searchParams)
    }
}
