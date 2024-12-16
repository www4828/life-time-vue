import RequestService from '@/utils/requestV2'
import { EsResponse, Response, SearchParamsModel } from '@/api/interface'
import { PortalModel } from '@/api/model/portalModel'

export class NewsService {
    protected baseUlr: string = '/data-db/api'
    private request
    constructor() {
        this.request = new RequestService('esUrl').service!
    }
    postEsToken(): Promise<EsResponse> {
      let data = new FormData()
      data.append('grant_type','client_credentials')
      data.append('client_id','41')
      data.append('client_secret','F57792BDB6Bb499dBB331bfB3493d531')
      data.append('Scope','api.read')
        return this.request.post(this.baseUlr + '/ids4/token',data,{
          headers:{'Content-Type': 'multipart/form-data'}
        })
    }
    getEsData(ResourceId:string,params?: any): Promise<EsResponse> {
        return this.request.get(this.baseUlr + `/v1/data-share/${ResourceId}/json`, {
          headers: {
            AppId: '41',
            ResourceId
          },
          params
        })
    }
}
