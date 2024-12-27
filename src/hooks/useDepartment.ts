interface DepartmentList {
  contactNumber: string
  departmentCode: string
  departmentLevel: string
  departmentMark: string
  departmentName: string
  departmentParentCode: string
  departmentShortName: string
  departmentTag: string
  distract: string
  homeUrl: string
}
interface UserInfo {
  id: string
  departmentList?: DepartmentList[]
  "address": string
  "avatar": string
  "createUserName": string
  "departCode": string
  "departName": string
  "email": string
  "idCard": string
  "mobile": string
  "passWord": string
  "remark": string
  "sex": string,
  "sort": string,
  "status": string,
  "userCode": string
  "userName": string
  "userNickName": string
  "wx": string
}
export function useDepartment() {
  const { departCode, departName, userName, userCode, id, mobile }: UserInfo = JSON.parse(sessionStorage.getItem('departments')!)
  const currentDepartmentCode = departCode
  const currentDepartmentCodeName = departName
  const currentDepartmentLevel = 0
  return {
    userName,
    userCode,
    currentDepartmentCode,
    currentDepartmentCodeName,
    currentDepartmentLevel,
    id,
    mobile
  }
}
