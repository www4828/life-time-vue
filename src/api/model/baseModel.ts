export class BaseModel {
  id?: string
  operaDeptCode?:string
  createTime?: string
  createTime_start?: string
  createTime_end?: string
  creatorId?: string
  modifierTime?: string
  modifierTime_start?: string
  modifierTime_end?: string
  modifierId?: string
  createUser?: string
}
export class TreeModel {
  "code": string
  "name": string
  "child": string
  "type"?: string
  "note"?: string
  "id": string
}
export type Match =
  | 'like'
  | 'eq'
  | 'ne'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'notLike'
  | 'likeLeft'
  | 'likeRight'
  | 'isNull'
  | 'isNotNull'
  | 'in'
  | 'inSql'
  | 'apply'
  | 'exists'
  | 'groupBy'
  | 'orderBy'
  | 'orderByAsc'
  | 'orderByDesc'
  | 'having'
  | 'notIn'

export class SearchModel<T> {
  key?: keyof T
  value?: string
  match?: Match
}

export class PageInfoModel {
  pageSize: number
  pageIndex: number
  total?: number
  constructor() {
    this.pageSize = 10
    this.pageIndex = 1
    this.total = 0
  }
}
