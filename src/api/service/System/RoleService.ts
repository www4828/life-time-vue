import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { RoleModel } from '@/api/model/roleModel'

export interface RoleInterface extends BaseInterface<RoleModel> { }

export class RoleService implements RoleInterface {
  protected baseUlr: string = 'role'
  protected url: string = 'rolePermission'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  find?(id: string): Promise<Response> {
    return this.request.get(this.baseUlr + `${id}`)
  }
  save(permission: RoleModel): Promise<Response> {
    return this.request.post(this.baseUlr, permission)
  }
  update(T: RoleModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  list(searchParams: SearchParamsModel<RoleModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/searchList`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
  
  // 角色权限
  findPer?(id: string): Promise<Response> {
    return this.request.get(this.url + `${id}`)
  }
  savePer(permission: any): Promise<Response> {
    return this.request.post(this.url, permission)
  }
  updatePer(T: RoleModel): Promise<Response> {
    return this.request.put(this.url + `/${T.id}`, T)
  }
  listPer(
    searchParams: SearchParamsModel<RoleModel>
  ): Promise<Response> {
    return this.request.post(this.url + `/searchList`, searchParams)
  }
  deletePer(id: string): Promise<Response> {
    return this.request.delete(this.url + `/${id}`)
  }
  deleteRolePer(roleId: string): Promise<Response> {
    return this.request.delete(this.url + `/roleId?roleId=${roleId}`)
  }
}


