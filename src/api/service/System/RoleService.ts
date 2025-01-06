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
  save(permission: RoleModel): Promise<Response> {
    return this.request.post(this.baseUlr, permission)
  }
  update(T: RoleModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  list(searchParams: SearchParamsModel<RoleModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/search`, searchParams)
  }
  tree(searchParams: SearchParamsModel<RoleModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/tree`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
  deptRoleTree(deptCode: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/tree/${deptCode}`)
  }

}


