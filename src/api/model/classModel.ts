export interface ClassModel {
  id: string
  name: string
  parentCode: number | string
  typeCode: number | string
  code?: number
  dictionaryType?: string
  typeLevel?: number
}


export interface ChildClassModel extends ClassModel {
  isNext: boolean
  childs: ChildClassModel[]
  nextCode: number

}
export interface MreflectDeptList {
  code: string
  deptCode:string
  id?:number
  codeType:string
}

export interface ReflectDeptModel {
  incrementFlag:boolean
  mreflectDeptList:MreflectDeptList[]
}