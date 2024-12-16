import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { CodeModel } from '@/api/model/codeModel'

export interface CodeInterface extends BaseInterface<CodeModel> {
  getTree(codeType?: string): Promise<Response>
  getTimeLimit(codes: string, typeCodes: string): Promise<Response>
  getEventSource(deptCode: string): Promise<Response>
}

export class CodeService implements CodeInterface {
  protected baseUlr: string =  'dictionary'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  getEventSource(deptCode: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/findEventSource/${deptCode}`)
  }
  getTree(codeType?: string): Promise<Response> {
    return this.request.get(this.baseUlr + '/tree', { params: { codeType } })
  }
  getTimeLimit(codes: string, typeCodes: string): Promise<Response> {
    return this.request.get(this.baseUlr + '/query', { params: { codes, typeCodes } })
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
    return this.request.post(this.baseUlr + `/searchList`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
}
