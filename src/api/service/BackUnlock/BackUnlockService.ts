import RequestService from '@/utils/request'
import { BackUnlockModel } from '@/api/model/backUnlockModel'
import { BaseInterface, Response } from '@/api/interface'

export interface BackUnlockInterface extends BaseInterface<BackUnlockModel> {}

export class BackUnlockService implements BackUnlockInterface {
  protected baseUlr: string = '/backUnLock'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  save(model: BackUnlockModel): Promise<Response> {
    return this.request.post(this.baseUlr, model)
  }
}
