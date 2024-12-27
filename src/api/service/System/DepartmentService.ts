import RequestService from '@/utils/request' 
import { BaseInterface, Response, SearchParamsModel,Params } from '@/api/interface' 
import { DepartmentModel, SearchDepartmentModel } from "@/api/model/departmentModel";

export interface DepartmentInterface extends BaseInterface<DepartmentModel>{
} 

export class DepartmentService implements DepartmentInterface {
  protected baseUlr: string = "department"
  protected url: string = "departmentPermission"
  protected path: string = "departmentRole"
  protected userurl: string = 'userDepartment'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  find(id: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/${id}`)
  }
  save(permission: DepartmentModel): Promise<Response> {
    return this.request.post(this.baseUlr, permission)
  }
  saveOrUpdate(permission: DepartmentModel): Promise<Response> {
    return this.request.post(this.baseUlr + `/saveOrUpdate`, permission)
  }
  update(T: DepartmentModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.departmentCode}`, T)
  }
  list(searchParams: SearchParamsModel<DepartmentModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/search`, searchParams)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete( this.baseUlr + `/${id}`)
  }
  tree(searchParams: SearchParamsModel<DepartmentModel>): Promise<Response> {
    return this.request.post(this.baseUlr + `/tree`, searchParams)
  }
  getCodeIsUsed(departmentCode: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/departmentCode?departmentCode=${departmentCode}`)
  }
  getByDepartmentCode(departmentCode: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/getByDepartmentCode?departmentCode=${departmentCode}`)
  }
  getFilterDepartment(departmentCode: string, data: SearchDepartmentModel): Promise<Response> {
    return this.request.post(this.baseUlr + `/searchDepartmentTree/${departmentCode}`, data)
  }
  // 部门权限
  findDeptPer(id: string): Promise<Response> {
    return this.request.get(this.url + `/${id}`)
  }
  saveDeptPer(permission: DepartmentModel): Promise<Response> {
    return this.request.post(this.url, permission)
  }
  updateDeptPer(T: DepartmentModel): Promise<Response> {
    return this.request.put(this.url + `/${T.id}`, T)
  }
  listDeptPer(searchParams: SearchParamsModel<DepartmentModel>): Promise<Response> {
    return this.request.post(this.url + `/searchList`, searchParams)
  }
  deleteDeptPer(id: string): Promise<Response> {
    return this.request.delete( this.url + `/${id}`)
  }
  // 部门角色
  findDeptRole(id: string): Promise<Response> {
    return this.request.get(this.path + `/${id}`)
  }
  saveDeptRole(permission: any): Promise<Response> {
    return this.request.post(this.path, permission)
  }
  updateDeptRole(T: DepartmentModel): Promise<Response> {
    return this.request.put(this.path + `/${T.id}`, T)
  }
  listDeptRole(id:any): Promise<Response> {
    return this.request.get(this.path + `/searchByDepartment?departmentCode=${id}`)
  }
  deleteDeptRole(id: string): Promise<Response> {
    return this.request.delete( this.path + `/${id}`)
  }
  // 部门用户
  findDeptUser(departmentCode: string): Promise<Response> {
    return this.request.get(this.userurl + `/departmentCode?departmentCode=${departmentCode}`)
  }
}