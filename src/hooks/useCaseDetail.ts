import { useRoute } from 'vue-router'
import { encrypt } from '@/utils'
import { CaseService } from '@/api/service/WorkTicket/CaseService'
import { LettersVisitService } from '@/api/service/LettersVisit/LettersVisitService'

export function useCaseDetail() {
  const caseService = new CaseService()
  const lettersVisitService = new LettersVisitService()
  const route = useRoute()
  const jumpToDetail = (taskId: string, isHistoryCase: boolean = false) => {
    if (taskId === '') {
      return 
    }
    if (route.name === 'caseDetail' && !isHistoryCase) {
      return
    }
    window.open(
      location.origin +
      location.pathname +
      '#' +
      '/caseDetail?taskId=' +
      encrypt(taskId)
    )
  }
  const jumpToXFDetail = (taskId: string, isHistoryCase: boolean = false) => {
    if (taskId === '') {
      return 
    }
    if (route.name === 'caseDetailXF' && !isHistoryCase) {
      return
    }
    window.open(
      location.origin +
      location.pathname +
      '#' +
      '/caseDetailXF?taskId=' +
      encrypt(taskId)
    )
  }
  const jumpToOldDetail = (wpid: string) => {
    if (route.name === 'oldCaseDetail') {
      return
    }
    window.open(
      location.origin +
      location.pathname +
      '#' +
      '/oldCaseDetail?wpid=' + encrypt(wpid)
    )
  }
  const getDetail = (taskId: string) => {
    return caseService.getTaskInfo(taskId).then((res) => res.data)
  }
  const getDetailXF = (taskId: string) => {
    return lettersVisitService.getTaskInfo(taskId).then((res) => res.data)
  }
  return {
    jumpToDetail,
    getDetail,
    getDetailXF,
    jumpToXFDetail,
    jumpToOldDetail
  }
}
