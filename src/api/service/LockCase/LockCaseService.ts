import RequestService from '@/utils/request'
import { Response } from '@/api/interface'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'

export interface LockCaseInterface {
  lock(taskId: string): Promise<Response>
  unLock(taskId: string): Promise<Response>
  isLock(taskId: string, nodeCode: NodeCodeKey): Promise<Response<boolean>>
  hasLockCase(userCode: string): Promise<Response<boolean>>
}

export class LockCaseService implements LockCaseInterface {
  protected baseUlr: string =  'case-lock'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  hasLockCase(userCode: string): Promise<Response<boolean>> {
    return this.request.get(this.baseUlr + `/hasLockCase/${userCode}`)
  }
  isLock(taskId: string, nodeCode: NodeCodeKey): Promise<Response<boolean>> {
    return this.request.get(this.baseUlr + `/isLock/${taskId}/${nodeCode}`)
  }
  lock(taskId: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/lock/${taskId}`)
  }
  unLock(taskId: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/unlock/${taskId}`)
  }
  unLockAll(): Promise<Response> {
    return this.request.get(this.baseUlr + `/unlock/all`)
  }
  checkTaskStatus(nodeCode: string,flowName: string,taskId: string): Promise<Response> {
    return this.request.post(`caseMain/checkTaskStatus/${nodeCode}/${flowName}/${taskId}`)
  }

}
