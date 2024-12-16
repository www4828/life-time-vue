import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { UserModel } from '@/api/model/userModel'

export interface userInterface extends BaseInterface<UserModel> {}

export class UserService implements userInterface {
  protected baseUlr: string = 'user'
  protected url: string = 'userRole'
  protected path: string = 'userDepartment'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  find(id: string): Promise<Response> {
    return this.request.get(this.baseUlr + `${id}`)
  }
  save(uer: UserModel): Promise<Response> {
    return this.request.post(this.baseUlr, uer)
  }
  update(T: UserModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  list(searchParams: SearchParamsModel<UserModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/searchList`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
  getUserByToken() : Promise<Response> {
    return this.request.post(this.baseUlr + `/getUserByToken`)
  }
  // 用户角色
  listUserRole(searchParams: SearchParamsModel<UserModel>): Promise<Response> {
    return this.request.post(this.url + `/searchList`, searchParams)
  }
  saveUserRole(user: UserModel): Promise<Response> {
    return this.request.post(this.url, user)
  }
  deleteUserRole(id: string): Promise<Response> {
    return this.request.delete(this.url + `/${id}`)
  }
  saveOrUpdate(user: UserModel): Promise<Response> {
    return this.request.post(this.url + `/saveOrUpdate`, user)
  }

  // 用户部门
  listUserDept(departmentCode:string,searchParams: SearchParamsModel<UserModel>): Promise<Response> {
    return this.request.post(this.path + `/searchUserList/${departmentCode}`,searchParams)
  }
  saveUserDept(user: UserModel): Promise<Response> {
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
