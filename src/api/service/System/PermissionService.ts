import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { PermissionModel } from '@/api/model/permissionModel'

export interface PermissionInterface extends BaseInterface<PermissionModel> {
  getMenuTree(userCode: string): Promise<Response>
}

export class PermissionService implements PermissionInterface {
  protected baseUlr: string = 'permission'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  getMenuTree(userCode: string): Promise<Response> {
    return this.request.get(this.baseUlr + '/tree', { params: { userCode }})
  }
  find(id: string): Promise<Response> {
    return this.request.get(this.baseUlr + `${id}`)
  }
  save(permission: PermissionModel): Promise<Response> {
    return this.request.post(this.baseUlr, permission)
  }
  update(T: PermissionModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  list(searchParams: SearchParamsModel<PermissionModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/searchList`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
}
