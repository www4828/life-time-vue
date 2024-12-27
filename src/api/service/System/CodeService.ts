import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { CodeModel } from '@/api/model/codeModel'

export interface CodeInterface extends BaseInterface<CodeModel> {
}

export class CodeService implements CodeInterface {
  protected baseUlr: string =  'code'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  tree(searchParams?: SearchParamsModel<CodeModel>): Promise<Response> {
    return this.request.post(this.baseUlr + '/tree', searchParams)
  }
  find(id: string): Promise<Response> {
    return this.request.get(this.baseUlr + `${id}`)
  }
  save(permission: CodeModel): Promise<Response<CodeModel>> {
    return this.request.post(this.baseUlr, permission)
  }
  update(T: CodeModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  list(searchParams: SearchParamsModel<CodeModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/search`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
}
