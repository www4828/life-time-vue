import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { UserModel } from '@/api/model/userModel'

export interface userInterface extends BaseInterface<UserModel> {}

export class UserService implements userInterface {
  protected baseUlr: string = 'user'
  protected url: string = 'user/role'
  protected path: string = 'user/department'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  // save(uer: UserModel): Promise<Response> {
  //   return this.request.post(this.baseUlr, uer)
  // }
  save(uer: UserModel): Promise<Response> {
    return this.request.post(this.baseUlr + `/${uer.departmentCode}`, uer)
  }
  update(T: UserModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.userCode}`, T)
  } 
  listUserDept(departmentCode:string,searchParams: SearchParamsModel<UserModel>): Promise<Response> {
    return this.request.post(`/user/search/${departmentCode}`,searchParams)
  }
  list(searchParams: SearchParamsModel<UserModel>): Promise<Response> {
    return this.request.post(`/user/search`,searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
  getUserByToken() : Promise<Response> {
    return this.request.post(this.baseUlr + `/getUserByToken`)
  }
  // 用户角色
  getUserRole(userCode: string,deptCode: string): Promise<Response> {
    return this.request.get(this.url + `/${userCode}/${deptCode}`)
  }
  saveUserRole(user: UserModel[]): Promise<Response> {
    return this.request.post(this.url, user)
  }
  saveUserRoleFull(user: UserModel[]): Promise<Response> {
    return this.request.post(this.url+'/full', user)
  }
  deleteUserRole(id: string): Promise<Response> {
    return this.request.delete(this.url + `/${id}`)
  }

  // 用户部门
  getUserDept(userCode:string): Promise<Response> {
    return this.request.get(this.path + '/' + userCode)
  }
  saveUserDept(user: UserModel[]): Promise<Response> {
    return this.request.post(this.path, user)
  }
  deleteUserDept(id: string): Promise<Response> {
    return this.request.delete(this.path + `/${id}`)
  }
  // 密码
  checkPassword(user: any): Promise<Response> {
    return this.request.post('user/checkPassword', user)
  }
  searchPWLevel(user: any): Promise<Response> {
    return this.request.post('user/searchPWLevel', user)
  }
  updatePassword(user: any): Promise<Response> {
    return this.request.post('user/updatePassword', user)
  }
  resetPassword(user: any): Promise<Response> {
    return this.request.post('user/resetPassword/'+user)
  }
  getSsoToken(type: any): Promise<Response> {
    return this.request.get('user/ssoToken/'+type)
  }
}
