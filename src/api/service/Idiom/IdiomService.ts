import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { PhraseEntity } from '@/api/model/idiomModel'

export interface IdiomInterface extends BaseInterface<PhraseEntity> {
  countNum(id: string): Promise<Response>
}

export class IdiomService implements IdiomInterface {
  protected baseUlr: string = 'phrase'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  countNum(id: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/count/${id}`)
  }
  list(
    searchParams: SearchParamsModel<PhraseEntity>
  ): Promise<Response> {
    return this.request.post(this.baseUlr + '/searchList', searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
  find(id: string): Promise<Response<PhraseEntity>> {
    return this.request.get(this.baseUlr + `/${id}`)
  }
  update(T: PhraseEntity): Promise<Response<PhraseEntity>> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  save(T: PhraseEntity): Promise<Response<PhraseEntity>> {
    return this.request.post(this.baseUlr, T)
  }
}
