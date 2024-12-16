import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { cloneDeep } from 'lodash-es'
import { Session } from '@/utils/storage'
import { SearchModel, Match } from '@/api/model/baseModel'
import { CaseInfoModel } from '@/api/model/dispatchModel'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'
interface SortBy {
  [index: string]: SearchModel<CaseInfoModel>[]
}
let reportTimeStart = Session.get('createTime')?.find((item:any)=> item.match === 'gt') ? Session.get('createTime').find((item:any)=> item.match === 'gt').value : dayjs().startOf('M').format("YYYY-MM-DD 00:00:00")
let reportTimeEnd = Session.get('createTime')?.find((item:any)=> item.match === 'lt') ? Session.get('createTime').find((item:any)=> item.match === 'lt').value : dayjs().format("YYYY-MM-DD 23:59:59")
export function useNodeCode() {
  const sortByMap: SortBy = {
    'B101,XF100,XF101,XF102,XF300,XF301,XF302,XF303,,XF200,XF201,XF202': [
      {
        key: '',
        value: 'sort',
        match: 'orderByDesc',
      },
      {
        key: '',
        value: 'createTime',
        match: 'orderByAsc',
      },
    ],
    B201: [
      {
        // 接单签收
        key: '',
        value: 'sort',
        match: 'orderByDesc',
      },
      {
        key: '',
        value: 'dispatchTime',
        match: 'orderByAsc',
      },
    ],
    B202: [
      {
        // 处置办结
        key: '',
        value: 'sort',
        match: 'orderByDesc',
      },
      {
        key: '',
        value: 'receiveTime',
        match: 'orderByAsc',
      },
    ],
    'C219': [
      {
          "key": "",
          "value": "reportTime",
          "match": "orderByDesc"
      },
      {
          "key": "emergency",
          "value": "2",
          "match": "eq"
      },
      {
          "key": "eventSourceCode",
          "value": "1",
          "match": "eq"
      }
    ],
    'B302,B301,B209,B205,B203,B206,B204,B210': [
      {
        // 审批审核
        key: '',
        value: 'sort',
        match: 'orderByDesc',
      },
      {
        key: '',
        value: 'disposeTime',
        match: 'orderByAsc',
      },
    ],
    "-1": [
      //办过案件
      {
        key: '',
        value: "createTime",
        match: 'orderByDesc',
      },
      {
        key: 'createTime',
        value: reportTimeStart,
        match: 'gt',
      },
      {
        key: 'createTime',
        value: reportTimeEnd,
        match: 'lt',
      },
      
    ],
    "0": [
      //修改案件
      {
        key: '',
        value: "reportTime",
        match: 'orderByDesc',
      }
    ]
  }
  const defaultParams: SearchModel<CaseInfoModel>[] = [
    {
      key: 'sort',
      value: 'sort',
      match: 'orderByDesc',
    },
  ]
  const route = useRoute()
  const nodeCode = route.meta.nodeCode as NodeCodeKey

  const getSortByNodeCode = (code: NodeCodeKey) => {
    const cloneData = cloneDeep(sortByMap)
    let sortQuery: SearchModel<CaseInfoModel>[] = []
    for (const key in cloneData) {
      if (key.includes(code)) {
        sortQuery = sortByMap[key]
        break
      }
    }
    return sortQuery ?? defaultParams
  }

  const hasSessionParams = () => {
    return !!Session.get('advSearch')
  }
  const getSessionParams = (
    nodeCode: NodeCodeKey,
    otherDefaultValue?: SearchModel<CaseInfoModel>[]
  ): SearchModel<CaseInfoModel>[] => {
    let defaultParams: SearchModel<CaseInfoModel>[] =
      getSortByNodeCode(nodeCode)

    if (hasSessionParams()) {
      const adv = Session.get('advSearch')
      const cloneSession: SearchModel<CaseInfoModel>[] = cloneDeep(
        Session.get('advSearch')
      )
      const matchTypes: Match[] = ['orderByDesc', 'orderByAsc', 'gt', 'lt']
      const filterSort = cloneSession.filter((item) =>
        matchTypes.includes(item.match!)
      )
      if (filterSort.length > 0) {
        defaultParams = []
      }
        
      if (otherDefaultValue) {
        return [...adv, ...defaultParams, ...otherDefaultValue]
      } else {
        return [...adv, ...defaultParams]
      }
    } else {
      return defaultParams
    }
  }
  return {
    nodeCode,
    getSortByNodeCode,
    getSessionParams,
    hasSessionParams,
  }
}
