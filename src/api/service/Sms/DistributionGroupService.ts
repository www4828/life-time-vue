import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { DistributionGroupModel } from '@/api/model/distributionGroupModel'

export interface DistributionGroupInterface extends BaseInterface<DistributionGroupModel> {
}
export class DistributionGroupService implements DistributionGroupInterface {
    protected baseUrl: string = 'distributionGroup'
    private request
    constructor() {
        this.request = new RequestService('smsUrl').service!

    }
    save(T: DistributionGroupModel): Promise<Response> {
        return this.request.post(this.baseUrl, T)
    }
    update(T: DistributionGroupModel): Promise<Response> {
        return this.request.put(this.baseUrl + `/${T.id}`, T)
    }
    delete(id: string): Promise<Response> {
        return this.request.delete(this.baseUrl + `/${id}`)
    }
    list(searchParams: SearchParamsModel<DistributionGroupModel>): Promise<Response> {
        return this.request.post(this.baseUrl + `/searchList`, searchParams)
    }
    getTreeList(depatementCode:string): Promise<Response> {
        return this.request.get(this.baseUrl + `/tree/${depatementCode}`)
    }
}
