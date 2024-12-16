<template>
  <div
    class="receive-case"
    v-loading="loading"
    element-loading-background="rgba(255,255,255,0.3)"
    :element-loading-text="text"
  >
    <WorkLayout
      class="index"
      :node-name="currentFlowModel?.name"
      :active="activeTab"
      @tabClick="(index: number) => (activeTab = index)"
    >
      <template #baseInfo>
        <CaseBaseInfo 
          :task-id="props.taskId" 
          @setCaseInfo="setCaseInfo" 
          @isShowGroupVisits="val=>warnForm.warnId = warnInfo.warnId = val "
        />
        <DBForm is-detail :task-id="props.taskId" />
        <FileAttachments
          v-if="props.taskId"
          :task-id="props.taskId"
          ref="fileAttachments"
          :nodeCode="nodeCode"
        />
      </template>
      <template #actions>
        <component
          v-if="props.taskId && form.taskId"
          :is="currentComponents"
          :taskId="props.taskId"
          :flowModel="currentFlowModel"
          :submit="submit"
          :hidden="dialogState.hidden"
          :attachments="attachments"
          :allFiles="allFiles"
          @changeSubmit="submit = false"
          @changeLoading="(flag: boolean, txt?: string) => { loading = flag; txt && (text = txt) }"
          @done="done"
          :caseInfo="form"
          :nodeCode="props.nodeCode"
          @changeClass="(arr:any)=>{ codes.reflectIndustryCode = arr[0];codes.reflectClassCode=arr[1] }"
          :warnForm="warnForm"
          @showGroupVisit="showGroupVisit"
          @isShowGroupVisits="(val:string)=>warnForm.warnId = val === '1' ? warnInfo.warnId : '' "
        />
      </template>
      <template #history>
        <HistoryCase :phone="form.reportPhone || ''" :task-id="props.taskId" />
      </template>
      <template #process>
        <Process v-if="props.taskId" :taskId="props.taskId" />
      </template>
      <template #buttons>
        <el-link
          type="primary"
          @click="warnForm.showGroupVisits = true"
          v-if="warnForm.warnId && groupCodeList.indexOf(currentFlowModel.code) > -1 "
          :style="{'font-size': '18px'}"
        >
          批量操作工单：已勾选<span :style="{'font-size': '22px','margin' :'0 5px'}">{{ ' ( ' + warnForm.selectedCount + ' ) ' }}</span>
        </el-link>
        <el-button
          @click="personalizedFormRef.setDialogVisible(true)"
          v-if="showPerFormFlag"
          type="primary"
          plain
          :style="{fontWeight: 600}"
          >个性化表单</el-button
        >
        <el-button type="primary" @click="jumpToDetail(props.taskId)" plain
        :style="{fontWeight: 600}"
          >详情</el-button
        >
        <el-button
          type="primary"
          plain
          v-if="
            currentFlowModel?.code === 'C201' ||
            currentFlowModel?.code === 'C207' ||
            currentFlowModel?.code === 'C202'
          "
          @click="openComponent2"
          :style="{fontWeight: 600}"
          >先行联系</el-button
        >
        <template v-for="item in props.buttons" :key="item.id">
          <el-button
            plain
            v-if="item.id != currentFlowModel?.id"
            type="primary"
            @click="setCurrentComponents(item)"
            :style="{fontWeight: 600}"
            >{{ item.name }}</el-button
          >
        </template>
        <el-button type="primary" @click="save"> 
          {{ groupCodeList.indexOf(currentFlowModel.code) > -1 && warnForm.selectedCount > 0 && warnForm.warnId ? '批量提交' : '确定'}}
        </el-button>
        <el-button type="info" @click="back">返回</el-button>
      </template>
    </WorkLayout>
    <ContactDialog
      v-if="dialogState.hidden"
      :dialogVisible="dialogState.hidden"
      formType="先联"
      @close="closeContant"
      :taskId="props.taskId"
      :lineForm="form"
      :nodeCode="props.flowModel.code"
      @save="getFiles"
    />
    <PersonalizedForm
      :reflectCode="`${codes.reflectIndustryCode},${codes.reflectClassCode}`"
      :departmentCode="form.reportDepartmentCode"
      @showForm="(val) => (showPerFormFlag = val)"
      ref="personalizedFormRef"
      :taskId="props.taskId"
      @changeSubmitFormFlag="val=>submitFormFlag = val"
    />
    <el-dialog
      class="dialog"
      v-model="warnForm.showGroupVisits"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :modal="false"
      :show-close="false"
      top="100px"
    >
      <GroupVisits 
        showTable 
        ref="groupVisitsRef" 
        :warnInfo="warnInfo" 
        :caseInfo="form"
        v-if="form.taskId && currentFlowModel.code"
        @selectionChange="val=>warnForm.selectedCount = val" 
        @finish="batchFinish"
        @getNumber="val=>warnCount=val"
      />
      <template #footer>
        <div class="dialog-footer-between">
          <div class="countdown-box"  v-if="warnCount.total">
            共操作
            <el-link type="primary" :underline="false" :style="{'font-size': '20px'}">
              &nbsp;{{ warnCount.total }}&nbsp;
            </el-link>条，已成功
            <el-link type="success" :underline="false" :style="{'font-size': '20px'}">
              &nbsp;{{ warnCount.success }}&nbsp;
            </el-link>
            条，失败
            <el-link type="danger" :underline="false" :style="{'font-size': '20px'}">
              &nbsp;{{ warnCount.fail }}&nbsp;
            </el-link>
            条，具体操作详情可查看列表  &nbsp;&nbsp;&nbsp;&nbsp;查询统计>>批量操作查询 
          </div>
          <!-- <div class="countdown-box" v-if="warnForm.finish">
            已全部操作完成，将于 
            <CountDown :time="countdown" format='ss' ref="countDownRef" :auto-start="false" @finish="back"/>
            秒后自动返回列表
          </div> -->
        </div>
        <div class="dialog-footer">
          <el-button @click="emit('back')" v-if="warnForm.isListen">返回列表</el-button>
          <el-button @click="clickGroupVisits" v-else >关闭</el-button>
          <el-button type="primary" @click="clickGroupVisits" v-if="!warnForm.isListen">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  reactive,
  markRaw,
  nextTick,
  watch,
  getCurrentInstance,
  h,
} from 'vue'
import { debounce } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { useCode } from '@/hooks/useCode'
import { useLock } from '@/hooks/useLock'
import { useCaseDetail } from '@/hooks/useCaseDetail'
import Urge from '@/businessComponent/DealCase/urge.vue'
import WorkLayout from '@/components/Layout/WorkLayout.vue'
import Process from '@/businessComponent/Process/Process.vue'
import Completion from '@/businessComponent/DealCase/done.vue'
import TakeBack from '@/businessComponent/DealCase/takeBack.vue'
import { CaseService } from '@/api/service/WorkTicket/CaseService'
import TransferVue from '@/businessComponent/DealCase/transfer.vue'
import BackUnlock from '@/businessComponent/DealCase/backUnlock.vue'
import DelayApply from '@/businessComponent/DealCase/delayApply.vue'
import DelayCheck from '@/businessComponent/DealCase/delayCheck.vue'
import GroupVisits from "@/businessComponent/GroupVisits/GroupVisits.vue";
import DBForm from '@/views/workEntry/dbReport/components/dbForm.vue'
import AssistApply from '@/businessComponent/DealCase/assistApply.vue'
import AssistCheck from '@/businessComponent/DealCase/assistCheck.vue'
import ReturnCheck12345 from '@/businessComponent/DealCase/returnNew/returnCheck.vue'
import ReturnApply12345 from '@/businessComponent/DealCase/returnNew/returnApply.vue'
import ReturnApprove12345 from '@/businessComponent/DealCase/returnNew/returnApprove.vue'
import ReturnApproveTop from '@/businessComponent/DealCase/returnApprove/levelTop.vue'
import ReturnCheck from '@/businessComponent/DealCase/returnCheck.vue'
import ReturnApply from '@/businessComponent/DealCase/returnApply.vue'
import ReceiveCase from '@/businessComponent/DealCase/receiveCase.vue'
import ContactDialog from '@/businessComponent/ContactDialog/index-v2.vue'
import CaseBaseInfo from '@/businessComponent/CaseInfo/CaseBaseInfo.vue'
import PowerStorage from '@/businessComponent/DealCase/powerStorage.vue'
import DelayApprove from '@/businessComponent/DealCase/delayApprove.vue'
import HistoryCase from '@/businessComponent/HistoryCase/HistoryCase.vue'
import AssistApprove from '@/businessComponent/DealCase/assistApprove.vue'
import PersonalizedForm from '@/businessComponent/PersonalizedForm/index.vue'
import PowerStageCheck from '@/businessComponent/DealCase/powerStageCheck.vue'
import PowerStageApprove from '@/businessComponent/DealCase/powerStageApprove.vue'
import KnottyCheck from '@/businessComponent/DealCase/knottyCheck.vue'
import KnottyFinish from '@/businessComponent/DealCase/knottyFinish.vue'
import KnottyTrace from '@/businessComponent/DealCase/knottyTrace.vue'
import ConsultationApproval from '@/businessComponent/DealCase/consultationApproval.vue'
import ConsultationCheck from '@/businessComponent/DealCase/consultationCheck.vue'
import Instruction from '@/businessComponent/DealCase/Instruction.vue'
import FeedBack from '@/businessComponent/DealCase/feedBack.vue'
import {
  FileAttachmentModel,
  NodeCodeKey,
} from '@/api/model/fileAttachmentModel'
import FileAttachments from '@/businessComponent/FileAttachments/FileAttachments.vue'
import { layer } from '@layui/layer-vue'
import { CountDown } from 'vant';

import 'vant/es/count-down/style'

const { operateButton } = useCode()
const { jumpToDetail } = useCaseDetail()
const currentComponents: any = ref()
const nodeCode = ref<NodeCodeKey>('C001')
const form: any = reactive({}) // 详情
const codes: any = reactive({}) // 事项类别

const groupCodeList = ['C201','C202','C101-2','C101']
const componentList: any = reactive({
  ReceiveCase: markRaw(ReceiveCase), // 接单
  Completion: markRaw(Completion), // 办结
  dispatch: markRaw(TransferVue), // 向下派遣
  ReturnApply: markRaw(ReturnApply), // 退单申请
  ReturnCheck: markRaw(ReturnCheck), // 退单审核
  ReturnApprove: markRaw(ReturnApproveTop), // 退单审批
  DelayApply: markRaw(DelayApply), // 延期审批
  DelayCheck: markRaw(DelayCheck), // 延期审核
  DelayApprove: markRaw(DelayApprove), // 延期审批
  AssistApply: markRaw(AssistApply), // 协办申请
  AssistCheck: markRaw(AssistCheck), // 协办审核
  AssistApprove: markRaw(AssistApprove), // 协办审批
  TaskBack: markRaw(TakeBack), // 收单
  Urge: markRaw(Urge), // 催单
  PowerStorage: markRaw(PowerStorage), // 申请存电
  BackUnlock: markRaw(BackUnlock), // 退单解锁
  PowerStageCheck: markRaw(PowerStageCheck), // 申请存电审核
  PowerStageApprove: markRaw(PowerStageApprove), // 申请存电审批
  KnottyCheck: markRaw(KnottyCheck), // 疑难审核
  KnottyFinish: markRaw(KnottyFinish), // 疑难完成
  KnottyTrace: markRaw(KnottyTrace), // 疑难跟踪
  ConsultationApproval: markRaw(ConsultationApproval), // 会商审批
  ConsultationCheck: markRaw(ConsultationCheck), // 会商审核
  FeedBack: markRaw(FeedBack), // 紧急/次紧急反馈
  Instruction: markRaw(Instruction), // 发起批示
})
const emit = defineEmits(['back'])
const props = withDefaults(
  defineProps<{
    flowModel: any
    taskId: string
    buttons: any
    nodeCode: NodeCodeKey
  }>(),
  {
    taskId: '',
  }
)


const showPerFormFlag = ref(false)
const submitFormFlag = ref(false)
const personalizedFormRef = ref()
const { proxy } = <any>getCurrentInstance()!
const text = ref('正在提交数据请稍后!')
const submit = ref(false)
const loading = ref(false)
const { unlockCase, unlockAll } = useLock()
const fileAttachments = ref() // 附件组件
let attachments: any = reactive([]) //附件列表
let allFiles: any = reactive([])
let nodeName = ref('')
let currentFlowModel = ref({
  id: '',
  code: '',
  name: '',
}) // 环节id，进程id
const dialogState = reactive({
  // 先行联系弹窗
  hidden: false,
  flag: [false, false],
})
let activeTab = ref(0)

const countDownRef = ref()
const groupVisitsRef = ref()
const countdown = ref(1000 * 60)
const warnCount:any = ref({})
const warnForm = reactive({
  selectedCount: 0,
  isListen: false,
  showGroupVisits: false,
  warnId: '',
  flowModelList: [] as any,
  finish: false,
  recordId: '' 
})
const warnInfo = reactive({
  taskId: props.taskId,
  warnId: '',
  nodeCode: props.nodeCode
});

const id = ref()
const openComponent2 = () => {
  if (id.value) {
    layer.open({
      title: '先联',
      id: id.value,
      maxmin: true,
      shade: false,
      anim: '6',
      closeBtn: false,
      content: h(ContactDialog, {
        taskId: props.taskId,
        lineForm: form,
        nodeCode: props.flowModel.code,
        formType: '先联',
        onClose() {
          closeContant()
        },
        onSave(res: any) {
          getFiles(res)
        },
      }),
      close: () => {
        id.value = ''
        proxy.mittBus.emit('updateConcatInfo')
      },
    })
  } else {
    id.value = layer.open({
      title: '先联',
      maxmin: true,
      shade: false,
      closeBtn: false,
      content: h(ContactDialog, {
        taskId: props.taskId,
        lineForm: form,
        nodeCode: props.flowModel.code,
        formType: '先联',
        onClose() {
          closeContant()
        },
        onSave(res: any) {
          getFiles(res)
        },
      }),
      close: () => {
        id.value = null
        proxy.mittBus.emit('updateConcatInfo')
      },
    })
  }
}

const closeContant = () => {
  layer && layer.close(id.value)
  id.value = ''
  dialogState.hidden = false
  proxy.mittBus.emit('updateConcatInfo')
}
const getFiles = (file: FileAttachmentModel) => {
  fileAttachments.value.pushFile(file)
}
const setCaseInfo = (data: any) => {
  // 案件详情
  Object.keys(data).forEach((key) => {
    form[key] = data[key]
  })
  codes.reflectIndustryCode = data.reflectIndustryCode
  codes.reflectClassCode = data.reflectClassCode
  dialogState.flag[1] = true

  currentComponentFlag()
  // console.log(form);
}
// 切换组件
const setCurrentComponents = (flowModel: any) => {
  currentFlowModel.value = flowModel
  console.log(currentFlowModel.value, props.nodeCode);
  nodeName.value = flowModel.name
  nodeCode.value = flowModel.code
  nextTick(() => {
    fileAttachments.value.clearNotIDsFile()
  })
  
  let component: any = props.flowModel.formPath === 'Instruction' ? 'Instruction' : operateButton.value.find(
    (item) => item.codeValue == flowModel.code
  )?.fourthParam

  nextTick(() => {
    if (form.eventSourceCode === '1') {
      switch (component) {
        case 'ReturnApply':
          currentComponents.value = markRaw(ReturnApply12345)
          break
        case 'ReturnCheck':
          currentComponents.value = markRaw(ReturnCheck12345)
          break
        case 'ReturnApprove':
          currentComponents.value = markRaw(ReturnApprove12345)
          break
        default:
          currentComponents.value = eval(componentList[component])
      }
    } else {
      currentComponents.value = eval(componentList[component])
    }
  })
}
const done = () => {
  loading.value = false
  submit.value = false
  back()
}
const back = () => {
  if(warnForm.warnId){
    unlockAll().then((status) => {
      if (status) {
        emit('back')
      } else {
        ElMessage.error('解锁失败！')
      }
    })
  }else{
    unlockCase(props.taskId!).then((status) => {
      if (status) {
        emit('back')
      } else {
        ElMessage.error('解锁失败！')
      }
    })
  }
}
const currentComponentFlag = () => {
  if (dialogState.flag.every((item) => item)) {
    setCurrentComponents(props.flowModel)
  }
}
// 点击确认
const save = debounce(async () => {
  attachments = fileAttachments.value.getFiles()
  allFiles = fileAttachments.value.getAllFiles()
  if (
    (codes.reflectIndustryCode == '139' ||
      (codes.reflectIndustryCode == '140' &&
        codes.reflectClassCode == '1203')) &&
    !submitFormFlag.value &&
    nodeCode.value === 'C202'
  ) {
    ElMessage.warning("请打开个性化表单并完善相关信息！")
  } else {
    submit.value = true
  }
}, 500)


const showGroupVisit = ()=>{
  warnForm.showGroupVisits = true;
  warnForm.isListen = true
  groupVisitsRef.value.listenerHandle();
}
const clickGroupVisits = ()=>{
  let checkedData = groupVisitsRef.value.getCheckedData()
  warnForm.flowModelList = []
  warnForm.showGroupVisits = false
  checkedData.forEach((item:any)=>{
    warnForm.flowModelList.push({
      lineId: currentFlowModel.value.id,
      processId: item.processId,
      taskId: item.taskId
    })
  })
}

const batchFinish = ()=>{
  warnForm.finish = true
  nextTick(()=>{
    countDownRef.value.start();
  })
}

watch(
  () => props.flowModel,
  () => {
    if (props.flowModel) {
      dialogState.flag[0] = true
      currentComponentFlag()
    }
  },
  {
    deep: true,
    immediate: true,
  }
)
</script>
<style lang="scss" scoped>
.receive-case {
  width: 100%;
  height: 100%;
}

.from {
  // height: 100%;

  ::v-deep(.el-select) {
    width: 100%;
  }

  .processWrapper {
    padding: 10px;
  }
}

.dispatchWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;

  .formWrapper {
    flex: 1;
  }
}


</style>
