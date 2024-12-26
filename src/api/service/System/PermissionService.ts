import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { PermissionModel, PermissionButtonModel } from '@/api/model/permissionModel'

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
  tree(searchParams: SearchParamsModel<PermissionModel>): Promise<Response> {
    return this.request.post(this.baseUlr + '/tree', searchParams)
  }
  find(id: string): Promise<Response> {
    return this.request.post(this.baseUlr + `/search/${id}`)
  }
  save(permission: PermissionModel): Promise<Response> {
    return this.request.post(this.baseUlr, permission)
  }
  saveWithButton(permission: PermissionButtonModel): Promise<Response> {
    return this.request.post(this.baseUlr +  `/with/buttons`, permission)
  }
  update(T: PermissionModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  updateWithButton(T: PermissionButtonModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/with/buttons`, T)
  }
  list(searchParams: SearchParamsModel<PermissionModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/searchList`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
}
