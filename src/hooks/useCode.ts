import { reactive, ref, Ref } from 'vue'
import { Session } from '@/utils/storage'
import { CodeTreeModel, CodeModel } from '@/api/model/codeModel'
import { CodeService } from '@/api/service/System/CodeService'
import { cloneDeep } from 'lodash-es'

export function useCode() {
  const codeService = new CodeService()
  const codes = ref<CodeModel[]>([])
  const types = reactive<any>({})
  const getCodesByType = (type: string,parent?: string): CodeModel[] => {
    parent = parent ? parent : type
    const allCodes = cloneDeep(codes.value) 
    return allCodes?.filter((code) => (code.codeParent == type) )
  }

  const setValue = () => {
    types.systemLayoutTypes = getCodesByType('1100')
    types.tagStyleTypes = getCodesByType('1200')
    types.animationTypes = getCodesByType('1300')
    types.deptTypes = getCodesByType('2100')
    types.SQLTypes = getCodesByType('3100')
    types.NoSQLTypes = getCodesByType('3200')
  }
  const getAllCode = () => {
    if (Session.get('allCode')) {
      codes.value = Session.get('allCode')
      setValue()
      return
    }
    codeService.list({
      pageParams: {
        pageIndex: 0,
        pageSize: -1
      },
      searchParams: []
    }).then((res) => {
      if (res.code === 200) {
        codes.value = res.data.results
        setValue()
        Session.set('allCode', res.data.results)
      }
    })
  }
  const getName = (key: string, source: Ref<CodeTreeModel[]>) => {
    return source.value.find(({ code }) => code === key)?.name
  }

  getAllCode()
  return {
    getName,
    types
  }
}
