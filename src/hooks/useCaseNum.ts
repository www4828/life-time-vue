import { useDepartment } from '@/hooks/useDepartment'
import { CaseService } from '@/api/service/WorkTicket/CaseService'
export function useCaseNum() {
  const caseService = new CaseService()
  const getXFCaseNum = (userId: string) => {
    return caseService.getXFCaseNum(userId).then(res => res.data)
  }
  const getCaseNum = () => {
    const { currentDepartmentCode, username } = useDepartment()
    return caseService.getCaseNum(currentDepartmentCode).then(async(res) => {
      if (res.code === 200) {
        const data = await getXFCaseNum(username)
        return [...res.data, ...data]
      }
    })
  }
  return {
    getCaseNum
  }
}
