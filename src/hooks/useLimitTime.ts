import dayjs from 'dayjs'
import { ref } from 'vue'
import { useDepartment } from './useDepartment'
import { CaseService } from '@/api/service/WorkTicket/CaseService'

export function useLimitTime(isDefault: boolean = false) {
  const timeLimit  = ref('')
  if(isDefault) {
    timeLimit.value = dayjs().format("YYYY-MM-DD HH:mm")
  }
  const caseService = new CaseService()
  const { currentDepartmentCode } = useDepartment()
  const getLimitTime = (taskId: string): Promise<string> => {
    return caseService
      .getLimitTime(taskId, currentDepartmentCode)
      .then((res) => {
        if (res.code === 200) {
          return res.data
        }
      }).catch((err) => {
        return err
      })
  }
  
  const disabledDate = (date: Date): boolean => {
    return dayjs(timeLimit.value).toDate() <= date || date <= dayjs().toDate();
  };
  return {
    getLimitTime,
    disabledDate,
    timeLimit,
  }
}
