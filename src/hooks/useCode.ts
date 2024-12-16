import { ref, Ref } from 'vue'
import { Session } from '@/utils/storage'
import { CodeTreeModel, CodeModel } from '@/api/model/codeModel'
import { CodeService } from '@/api/service/System/CodeService'
import { cloneDeep } from 'lodash-es'

export function useCode() {
  const urgentTypes = ref<CodeTreeModel[]>([])
  const sourceTypes = ref<CodeTreeModel[]>([])
  const ticketTypes = ref<CodeTreeModel[]>([])
  const fromTypes = ref<CodeTreeModel[]>([])
  const districtTypes = ref<CodeTreeModel[]>([])
  const timeLimitTypes = ref<CodeTreeModel[]>([])
  const returnCheckTypes = ref<CodeTreeModel[]>([])
  const approveTypes = ref<CodeTreeModel[]>([])
  const specialTypes = ref<CodeTreeModel[]>([])
  const reactionTypes = ref<CodeTreeModel[]>([])
  const hotlineTypes = ref<CodeTreeModel[]>([])
  const urbanTypes = ref<CodeTreeModel[]>([])
  const gridTypes = ref<CodeTreeModel[]>([])
  const groupTypes = ref<CodeTreeModel[]>([])
  const resultTypes = ref<CodeTreeModel[]>([])
  const factTypes = ref<CodeTreeModel[]>([])
  const appealTypes = ref<CodeTreeModel[]>([])
  const satisfiedTypes = ref<CodeTreeModel[]>([])
  const replyTypes = ref<CodeTreeModel[]>([])
  const liveTypes = ref<CodeTreeModel[]>([])
  const businessTypes = ref<CodeTreeModel[]>([])
  const audiResultsTypes = ref<CodeTreeModel[]>([])
  const operateButton = ref<CodeTreeModel[]>([])
  const codes = ref<CodeTreeModel[]>([])
  const delayTypes = ref<CodeTreeModel[]>([])
  const resourceTypes = ref<CodeTreeModel[]>([])
  const authTypes = ref<CodeTreeModel[]>([])
  const returnApplyTypes = ref<CodeTreeModel[]>([])
  const delayApplyTypes = ref<CodeTreeModel[]>([])
  const applyDaysTypes = ref<CodeTreeModel[]>([])
  const seatGroupTypes = ref<CodeTreeModel[]>([])
  const callBackTypes = ref<CodeTreeModel[]>([])
  const callBackResultTypes = ref<CodeTreeModel[]>([])
  const contactTypes = ref<CodeTreeModel[]>([])
  const contactReasonTypes = ref<CodeTreeModel[]>([])
  const urgeTypes = ref<CodeTreeModel[]>([])
  const sendMethodsTypes = ref<CodeTreeModel[]>([])
  const concatMethodsTypes = ref<CodeTreeModel[]>([])
  const returnApproveTypes = ref<CodeTreeModel[]>([])
  const powerTypes = ref<CodeTreeModel[]>([])
  const backUnlockTypes = ref<CodeTreeModel[]>([])
  const sendChannelTypes = ref<CodeTreeModel[]>([])
  const PowerStorageCheckTypes = ref<CodeTreeModel[]>([])
  const knottyCheckTypes = ref<CodeTreeModel[]>([])
  const knottyTraceTypes = ref<CodeTreeModel[]>([])
  const knottyFinishTypes = ref<CodeTreeModel[]>([])
  const autoEndLimitTypes = ref<CodeTreeModel[]>([])
  const xfTacheTypes = ref<CodeTreeModel[]>([])
  const supervisingTypes = ref<CodeTreeModel[]>([])
  const supervisingSources = ref<CodeTreeModel[]>([])
  const supervisingReason = ref<CodeTreeModel[]>([])
  const backReason = ref<CodeTreeModel[]>([])
  const emergencyFeedback = ref<CodeTreeModel[]>([])
  const unresolvedCauses = ref<CodeTreeModel[]>([])
  const missingElements = ref<CodeTreeModel[]>([])
  const backSource = ref<CodeTreeModel[]>([])
  const emergencyIsSolved = ref<CodeTreeModel[]>([])

  const codeService = new CodeService()
  const getCodesByType = (type: string): CodeTreeModel[] => {
    const allCodes = cloneDeep(codes.value)
    return allCodes.find((code) => code.codeType === type)?.childs!
  }

  const setValue = () => {
    urgentTypes.value = getCodesByType('4000') // 紧急程度
    sourceTypes.value = getCodesByType('1000') // 反映类别类型
    ticketTypes.value = getCodesByType('5000') // 工单类型
    autoEndLimitTypes.value = getCodesByType('5150') // 办结处理时限
    fromTypes.value = getCodesByType('3000') // 反映来源
    const districtResult: CodeTreeModel[] = []
    getCodesByType('6000').forEach((item) => {
      item.childs?.forEach((child) => {
        districtResult.push(child)
      })
    })
    districtTypes.value = districtResult // 反映区名
    timeLimitTypes.value = getCodesByType('8000') // 处置时限
    specialTypes.value = getCodesByType('9000') // 特殊标签
    reactionTypes.value = getCodesByType('10000') // 反映来源
    groupTypes.value = getCodesByType('7000') // 部门分组
    resultTypes.value = getCodesByType('12000') // 处理结果
    factTypes.value = getCodesByType('13000') // 事实认定
    appealTypes.value = getCodesByType('14000') // 诉求认定
    satisfiedTypes.value = getCodesByType('15000') // 市民是否满意
    replyTypes.value = getCodesByType('16000') // 答复方式
    liveTypes.value = getCodesByType('17000') // 现场查看
    businessTypes.value = getCodesByType('1000') // 业务类型
    returnCheckTypes.value = getCodesByType('1900') // 退单审核结果
    approveTypes.value = getCodesByType('1800') // 退单审批结果
    returnApproveTypes.value = getCodesByType('190000') // 非12319退单审批结果
    audiResultsTypes.value = getCodesByType('18000') // 审核结果
    operateButton.value = getCodesByType('11000') // 操作按钮
    delayTypes.value = getCodesByType('2001') // 延期审批
    resourceTypes.value = getCodesByType('19000') // 可访问资源
    authTypes.value = getCodesByType('20000') // 授权类型
    seatGroupTypes.value = getCodesByType('seat') // 坐席分组
    returnApplyTypes.value = getCodesByType('100001') // 退单申请原因
    delayApplyTypes.value = getCodesByType('100002') // 延期申请原因
    applyDaysTypes.value = getCodesByType('100003') // 申请天数
    callBackTypes.value = getCodesByType('A500') // 回访状态
    callBackResultTypes.value = getCodesByType('22000') // 回访结果
    contactTypes.value = getCodesByType('220000') // 是否先行联系
    contactReasonTypes.value = getCodesByType('240000') // 未联原因
    urgeTypes.value = getCodesByType('27000') // 催办类型
    sendMethodsTypes.value = getCodesByType('28000') // 催办方式
    concatMethodsTypes.value = getCodesByType('230000') // 先联方式
    powerTypes.value = getCodesByType('21000') // 存电标记
    backUnlockTypes.value = getCodesByType('200000') // 退单解锁分类
    sendChannelTypes.value = getCodesByType('32000') //发送渠道
    PowerStorageCheckTypes.value = getCodesByType('23000') //存电同意不同意
    knottyCheckTypes.value = getCodesByType('knottyCheckResult') //疑难审核结果
    knottyTraceTypes.value = getCodesByType('knottyTraceResult') //疑难跟踪结果
    knottyFinishTypes.value = getCodesByType('knottyFinishResult') //疑难完成结果
    xfTacheTypes.value = getCodesByType('100') // 信访流程环节
    supervisingSources.value = getCodesByType('33000') //督办来源
    supervisingTypes.value = getCodesByType('34000') // 督办类型
    supervisingReason.value = getCodesByType('35000') // 督办结果
    backReason.value = getCodesByType('backClass') // 新退单原因
    emergencyFeedback.value = getCodesByType('EmergencyFeedback') // 紧急/次紧急反馈
    unresolvedCauses.value = getCodesByType('UnresolvedCauses') // 未解决原因
    missingElements.value = getCodesByType('missingElements')
    backSource.value = getCodesByType('backSource') // 退单走向
    emergencyIsSolved.value = getCodesByType('EmergencyIsSolved') // 次紧急情况是否处置
    const reactions = cloneDeep(reactionTypes.value)
    hotlineTypes.value = reactions.find(
      ({ codeValue }) => codeValue === '10001'
    )!.childs!
    urbanTypes.value = reactions.find(
      ({ codeValue }) => codeValue === '10003'
    )!.childs!
    gridTypes.value = reactions.find(
      ({ codeValue }) => codeValue === '10002'
    )!.childs!
  }
  const getAllCode = () => {
    if (Session.get('allCode')) {
      codes.value = Session.get('allCode')
      setValue()
      return
    }
    codeService.getTree().then((res) => {
      if (res.code === 200) {
        codes.value = res.data
        setValue()
        Session.set('allCode', res.data)
      }
    })
  }
  const getName = (code: string, source: Ref<CodeTreeModel[]>) => {
    return source.value.find(({ codeValue }) => codeValue === code)?.codeName
  }
  const getXFSelectOpt = (deptCode: string) => {
    const FILTER_KEY = ['10001', '10002', '10003']
    const reactions = cloneDeep(reactionTypes.value).filter(
      ({ codeValue }) => !FILTER_KEY.includes(codeValue)
    )

    return  reactions.find(({ codeValue }) => codeValue === deptCode)?.childs!
  }
  const getEventSource = (deptCode: string): Promise<CodeModel[]> => {
    return codeService.getEventSource(deptCode).then(res => {
      if (res.code === 200) {
        return res.data
      }
    })
  }
  getAllCode()
  return {
    knottyFinishTypes,
    knottyTraceTypes,
    knottyCheckTypes,
    urgentTypes,
    sourceTypes,
    ticketTypes,
    fromTypes,
    districtTypes,
    timeLimitTypes,
    returnCheckTypes,
    approveTypes,
    specialTypes,
    reactionTypes,
    hotlineTypes,
    gridTypes,
    urbanTypes,
    groupTypes,
    resultTypes,
    factTypes,
    appealTypes,
    satisfiedTypes,
    replyTypes,
    liveTypes,
    businessTypes,
    audiResultsTypes,
    operateButton,
    delayTypes,
    authTypes,
    resourceTypes,
    returnApplyTypes,
    delayApplyTypes,
    applyDaysTypes,
    seatGroupTypes,
    callBackTypes,
    callBackResultTypes,
    contactTypes,
    contactReasonTypes,
    urgeTypes,
    sendMethodsTypes,
    concatMethodsTypes,
    returnApproveTypes,
    powerTypes,
    backUnlockTypes,
    sendChannelTypes,
    PowerStorageCheckTypes,
    autoEndLimitTypes,
    xfTacheTypes,
    supervisingTypes,
    supervisingSources,
    supervisingReason,
    backReason,
    emergencyFeedback,
    unresolvedCauses,
    missingElements,
    backSource,
    emergencyIsSolved,
    getName,
    getXFSelectOpt,
    getEventSource
  }
}
