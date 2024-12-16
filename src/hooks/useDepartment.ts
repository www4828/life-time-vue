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
  departmentList: DepartmentList[]
  token: string
  username: string
  name: string
  mobile: string
}
export function useDepartment() {
  const { departmentList, username, name, id, token, mobile }: UserInfo = JSON.parse(
    sessionStorage.getItem('userInfo')!
  )
  const currentDepartmentCode = departmentList[0].departmentCode
  const currentDepartmentCodeName = departmentList[0].departmentName
  const currentDepartmentLevel = departmentList[0].departmentLevel
  const contactNumber = departmentList[0].contactNumber
  const homeUrl = departmentList[0].homeUrl
  const parentDepartCode = departmentList[0].departmentParentCode
  return {
    departmentList,
    username,
    name,
    currentDepartmentCode,
    currentDepartmentCodeName,
    currentDepartmentLevel,
    parentDepartCode,
    contactNumber,
    id,
    token,
    homeUrl,
    mobile
  }
}
