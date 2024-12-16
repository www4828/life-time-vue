<template>
  <div
    class="edit_wrapper"
    v-loading="loading"
    element-loading-text="正在提交数据请稍后!"
  >
    <div class="tabsWrapper">
      <div
        class="tab"
        v-for="(tab, index) in ['工单修改', 'GIS地图']"
        :class="{ active: cur === index }"
        @click="() => (cur = index)"
      >
        {{ tab }}
      </div>
    </div>
    <div class="tabsContent" >
      <div class="workLayout" v-show="cur === 0">
        <BaseCaseForm
          ref="baseCaseForm"
          @getValue="getValue"
          is-detail
          :task-id="props.listPrams?.taskId!"
        />
      </div>
      <div v-show="cur === 1" class="mapWrapper">
        <BaiduMap @clickDone="cur = 0" />
      </div>
    </div>
    <div class="button_box">
      <el-button type="primary" @click="save">确定</el-button>
      <el-button type="info" @click="back">返回</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, getCurrentInstance, onBeforeUnmount } from 'vue'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'
import { ButtonInfoModel } from '@/api/model/dispatchModel'
import { useDepartment } from '@/hooks/useDepartment'
import BaseCaseForm from '@/businessComponent/BaseCaseForm/BaseCaseForm.vue'
import { DispatchFormModel, CaseModel } from '@/api/model/caseModel'
import { useLock } from '@/hooks/useLock'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
import { CaseService } from '@/api/service/WorkTicket/CaseService'
import BaiduMap from "@/businessComponent/GisMap/BaiduMap.vue";

interface ListPrams {
  id: string
  taskId: string
  processId: string
  code: NodeCodeKey
  name: string
  formPath: string
}
const { proxy } = <any>getCurrentInstance()!;

proxy.mittBus.on("tabClick", () => {
  cur.value = 1;
});
onBeforeUnmount(() => {
  proxy.mittBus.off("tabClick");
});

const caseService = new CaseService()
const emit = defineEmits(['back'])
const props = defineProps<{
  listPrams?: ListPrams
  buttons: ButtonInfoModel[]
}>()
const { currentDepartmentLevel, currentDepartmentCode, departmentList, name } =
  useDepartment()
const { unlockCase } = useLock()

const sourceCode = ref('')
const baseCaseForm = ref()
const submit = ref(false)
const loading = ref(false)
const formData = reactive<DispatchFormModel>({
  type: '',
  taskId: props.listPrams?.taskId,
  disposeTime: '10',
  disposeDepartmentCode: '',
  dispatchDepartmentCode: currentDepartmentCode,
  description: '',
  deadline: '',
  firstClass: '',
  secondClass: '',
  fourthClass: undefined,
  thirdClass: undefined,
  firstClassName: '',
  secondClassName: '',
  thirdClassName: undefined,
  fourthClassName: undefined,
})
const screeningForm = reactive({
  dialogVisible: false,
  nodeCode: 'all',
  taskId: props.listPrams?.taskId,
  lineForm: {
    contactPhone: '',
    reportPhone: '',
    reportPerson: '',
  },
  resultForm: {
    result: '',
    type: '',
    typeName: '',
    time: '',
    reason: '',
    reasonName: '',
  },
})
const cur = ref(0)

const getValue = async (result: string[]) => {
  const [
    firstClass,
    secondClass,
    reportPhone,
    contactPhone,
    reportPerson,
    eventSourceCode,
    taskId,
    firstClassName,
    secondClassName,
  ] = result

  formData.firstClass = firstClass
  formData.firstClassName = firstClassName
  formData.secondClass = secondClass
  formData.secondClassName = secondClassName
  screeningForm.lineForm.contactPhone = contactPhone
  screeningForm.lineForm.reportPhone = reportPhone
  screeningForm.lineForm.reportPerson = reportPerson
  // screeningForm.taskId = taskId;
  if (eventSourceCode === '1') {
    sourceCode.value = eventSourceCode
  }
}

const back = () => {
  unlockCase(props.listPrams?.taskId!).then((status) => {
    if (status) {
      emit('back')
    } else {
      ElMessage.error('解锁失败！')
    }
  })
}
// 点击确认
const save = debounce(async () => {
  loading.value = true
  console.log(
    baseCaseForm.value.getFormData(),
    baseCaseForm.value.getSpecialTips()
  )

  caseService
    .update({
      caseInfo: baseCaseForm.value.getFormData(),
      specialFlags: baseCaseForm.value.getSpecialTips(),
    })
    .then((res) => {
      loading.value = false
      ElMessage({
        message: res.message,
        type: res.code == 200 ? 'success' : 'error',
      })
    })
}, 500)
</script>
<style lang="scss" scoped>
.edit_wrapper {
  width: 100%;
  height: 100%;
  // padding: 20px;
  
  
  position: relative;
  .button_box {
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
  .tabsWrapper {
    display: flex;
    margin-bottom: 20px;

    .tab {
      position: relative;
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-18,
        var(--sh3h-label-form-color)
      );
      font-weight: bold;
      margin-right: 20px;
      cursor: pointer;

      &.active {
        color: var(--sh3h-menu-active-font-color);

        &::before {
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%);
          content: "";
          width: 40px;
          height: 2px;
          border-radius: 5px;
          background-color: var(--sh3h-menu-active-font-color);
        }
      }
    }
  }
  .tabsContent {
    height: calc(100% - 40px);
    padding: 20px;
    box-sizing: border-box;
    background-color: var(--sh3h-workTicket-background-color);
  }
  .mapWrapper {
    width: 100%;
    height: 100%;
  }
}
</style>
