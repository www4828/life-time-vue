import RequestService from '@/utils/request'
import { ClassModel, ChildClassModel, ReflectDeptModel } from '@/api/model/classModel'
import { CodeModel } from '@/api/model/codeModel'
import { BaseInterface, Response } from '@/api/interface'

export interface ClassInterface extends BaseInterface<CodeModel> {
  getAllClass(): Promise<Response<ClassModel[]>>
  getClassByCode(params: ClassModel): Promise<Response<ClassModel[]>>
  getFirstClass(deptCode: string, deptLevel: string, departmentParentCode: string): Promise<Response<CodeModel[]>>
  getClassByDepartCode(deptCode: string, departmentLevel: string): Promise<Response>
  saveReflectDept(T: ReflectDeptModel): Promise<Response>
}
export class ClassService implements ClassInterface {
  protected baseUlr: string = 'reflect'
  protected Ulr: string = 'refletDept'
  private request;
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  getAllClass(): Promise<Response<ClassModel[]>> {
    return this.request.get(this.baseUlr)
  }
  getClassByCode(params: Partial<ChildClassModel>): Promise<Response<ChildClassModel[]>> {
    return this.request.get(this.baseUlr + '/type', { params })
  }
  getClassByDepartCode(departmentCode: string, departmentLevel: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/unit/${departmentCode}/parent`, { params: { deptLevel: departmentLevel } })
  }
  save(permission: CodeModel): Promise<Response<CodeModel>> {
    return this.request.post(this.baseUlr, permission)
  }
  update(T: CodeModel): Promise<Response> {
    return this.request.put(this.baseUlr + `/${T.id}`, T)
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + `/${id}`)
  }
  getFirstClass(deptCode: string, deptLevel: string, departmentParentCode: string): Promise<Response> {
    return this.request.get(this.baseUlr + '/unit' + `/${deptCode}?deptLevel=${deptLevel}&departmentParentCode=${departmentParentCode}`)
  }
  getSecondeClass(params: ClassModel): Promise<Response> {
    return this.request.get(this.baseUlr + '/type', { params })
  }
  saveReflectDept(T: ReflectDeptModel): Promise<Response> {
    return this.request.post(this.Ulr + '/save', T)
  }

}