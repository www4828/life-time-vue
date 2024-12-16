<template>
  <div class="groupvisits" v-loading="state.loading" element-loading-background="rgba(255,255,255,0.2)"
    :element-loading-text="state.text">
    <Title :title="'群访件' +
      (state.info.alarType
        ? state.info.alarType == 1
          ? '（多人一诉）'
          : '（一人多诉）'
        : '')
      " class="marginB" align="flex-start" />
    <div class="content">
      <el-row>
        <el-col :span="24">
          <span class="label">报警标题:</span>
          <span class="value description"> {{ state.info.title }} </span>
        </el-col>
        <!-- <el-col :span="12">
          <span class="label">地址:</span>
          <span class="value description"> {{ state.info.address }} </span>
        </el-col> -->
      </el-row>
      <el-row>
        <el-col :span="8">
          <span class="label">报警产生:</span>
          <span class="value description"> {{ state.info.firstTime }} </span>
        </el-col>
        <el-col :span="8">
          <span class="label">报警更新:</span>
          <span class="value description"> {{ state.info.lastTime }} </span>
        </el-col>
        <el-col :span="8" class="count_col">
          <span class="label">涉及案件:</span>
          <el-link class="count" type="primary" @click="jumpPage">{{ state.count }}</el-link>件
          <!-- <span class="value description" @click="jumpPage">
            {{ state.count }}件
          </span> -->
        </el-col>
      </el-row>
    </div>
    <Title :title="state.submit ? '已选择案件' : `批量操作(${state.tableData.length}条)`
      " v-if="props.showTable" align="flex-start">
      <el-progress :percentage="state.progress" :stroke-width="15" striped :striped-flow="state.progress < 100"
        class="progress" v-if="state.submit" :duration="5" :indeterminate="state.progress === 100 || state.progress === 10 ? false : true
          ">
        已完成：<span>{{ state.progress }}%</span>
      </el-progress>
    </Title>
    <div class="groupvisits_table">
      <el-table ref="multipleTableRef" :data="state.tableData" top='100' style="width: 100%" height="100%"
        @selection-change="handleSelectionChange" v-if="props.showTable" scrollbar-tabindex="20" scrollbar-always-on>
        <el-table-column type="selection" :selectable="selectable" width="55" v-if="!state.submit" />
        <el-table-column label="处理状态" show-overflow-tooltip v-if="state.submit">
          <template #default="scope">
            <!-- :format="format" -->
            <el-progress 
              :percentage="scope.row.percentage" 
              :stroke-width="10" 
              :indeterminate="scope.row.percentage === 100 || scope.row.percentage === 5 ? false : true " 
              :duration="8" 
              :status="scope.row.status"
            >
              <span v-if="!scope.row.status" class="">处理中...</span>
              <el-tooltip
                  placement="bottom"
                  effect="dark"
                  :content="scope.row.reason"
                  raw-content
                  popper-class="descriptionContent"
                   v-if="scope.row.status === 'exception'"
                >
                  <el-icon v-if="scope.row.status === 'exception' " style="vertical-align: middle">
                    <Search @click="getFailList(scope.row.taskId)" />
                  </el-icon>
                </el-tooltip>
            </el-progress>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="reason" label="失败原因" show-overflow-tooltip v-if="state.submit" /> -->
        <el-table-column prop="taskId" label="工单编号" show-overflow-tooltip />
        <el-table-column prop="caseInfo.externalNumber" label="外系统编号" show-overflow-tooltip />
        <el-table-column prop="caseInfo.reportTime" label="接报时间" show-overflow-tooltip />
        <el-table-column prop="caseInfo.businessTypeName" label="业务类型" show-overflow-tooltip />
        <el-table-column label="反映人" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.caseInfo.reportPerson }} -
            {{ scope.row.caseInfo.contactPhone }}</template>
        </el-table-column>
        <el-table-column prop="caseInfo.address" label="发生地址" show-overflow-tooltip />
        <el-table-column prop="caseInfo.description" label="问题描述" show-overflow-tooltip />
        <el-table-column label="禁选状态" show-overflow-tooltip v-if="!state.submit">
          <template #default="scope">
            <el-link type="danger" :underline="false" v-if="scope.row.canCheck == '1'">业务类型不同</el-link>
            <el-link type="danger" :underline="false" v-if="scope.row.canCheck == '2'">已被其他用户锁定</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { MarkIcon } from '../CaseIcon/type'
import Title from '@/components/Title/Title.vue'
import { Loading } from '@element-plus/icons-vue'
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { useRoute } from 'vue-router'
import { Session } from '@/utils/storage'
import { Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const emit = defineEmits(['selectionChange', 'finish', 'getNumber'])
const props = withDefaults(
  defineProps<{
    uuid?: string
    showTable?: boolean
    isListen?: boolean
    warnInfo?: any
    caseInfo?: any
    recordId?: string
  }>(),
  {
    taskId: '',
    showTable: false,
    isListen: false,
  }
)
const disposeService = new DisposeService()
const route = useRoute()
let ws
const multipleTableRef = ref()

const state = reactive({
  info: {} as any,
  tableData: [] as any,
  submit: false,
  count: 0,
  progress: 10,
  loading: false,
  text: '加载中...',
})

const selectable = (row: any) => row.canCheck == '0' && !state.submit

const handleSelectionChange = (val: any[]) => {
  state.tableData.map((i: any) => (i.checked = false))
  val.map((i) => (i.checked = true))
  emit('selectionChange', val.length)
}

const getFailList = (taskId: string) => {
  disposeService
    .getBatchCaseList({
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
      },
      searchParams: [
        {
          key: 'taskId',
          value: taskId,
          match: 'eq',
        },
        {
          key: 'recordId',
          value: props.recordId,
          match: 'eq',
        },
      ],
    })
    .then((res) => {
      res.data.results.forEach((ele:any)=>{
        state.tableData.forEach((item:any)=>{
          if(item.taskId === ele.taskId){
            item.reason = ele.remark
          }
        })
      })
    })
}

// const format = (percentage: number) => ( percentage === 100 ? '成功' : `处理中...`)

const scrollTo = (index: number) => {
  multipleTableRef.value?.scrollTo(0, index * 40 - 200)
}

const getWarnInfo = (id: string) => {
  disposeService.getWarnInfo(id).then((res) => {
    state.info = res.data.warnAlarm
    state.info.firstTime = dayjs(res.data.warnAlarm.firstTime).format('YYYY-MM-DD HH:mm')
    state.info.lastTime = dayjs(res.data.warnAlarm.lastTime).format('YYYY-MM-DD HH:mm')
    state.count = res.data.count
  })
}
const getWarnList = (
  taskId: string,
  warnId: string,
  flowName: string,
  nodeCode: string
) => {
  state.loading = true
  disposeService
    .getWarnList(taskId, warnId, flowName, nodeCode, {
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
      },
      searchParams: [],
    })
    .then((res) => {
      state.info = res.data.warnAlarm
      state.count = res.data.count
      res.data.caseList.map((i: any) => {
        i.status = ''
        i.percentage = 5
        i.reason = '点击查看失败原因'
      })
      state.tableData = res.data.caseList
      state.loading = false
      // getData()
    })
}
const listenerHandle = () => {
  state.submit = true
  let url = Session.get('appConfig').urls.wsUrl

  state.tableData = state.tableData.filter(
    (i: any) => i.canCheck == '0' && i.checked
  )
  state.tableData.push({
    canCheck: '0',
    checked: true,
    status: '',
    taskId: props.caseInfo.taskId,
    percentage: 5,
    caseInfo: props.caseInfo,
    xfCaseInfo: '',
    buttonInfo: [],
  })

  ws = new WebSocket(url + sessionStorage.getItem('token'))
  // 监听接收到消息的事件
  ws.onopen = (val) => {
    console.log('onopen', val)
  }
  ws.onmessage = (event) => {
    console.log('onmessage', event)

    let data = event.data.split(',')

    state.tableData.map((i: any, index: number) => {
      if (i.taskId === data[0]) {
        index > 9 && i.percentage < 100 && scrollTo(index)
        i.percentage = 100
        i.status = data[2] == '1' ? 'success' : 'exception'
      }
    })

    let list = state.tableData.filter((i: any) => i.status)
    state.progress = Math.ceil((list.length / state.tableData.length) * 90 + 10)
    if (state.progress >= 100) {
      emit('finish')
    }
    emit('getNumber',{
      total: state.tableData.length,
      success: state.tableData.filter((i: any) => i.status === 'success' ).length,
      fail: state.tableData.filter((i: any) => i.status === 'exception' ).length
    })
  }
}
onBeforeUnmount(() => {
  if (ws!) {
    ws.close()
  }
})

const jumpPage = ()=>{
  let url = Session.get('appConfig').urls.warnUrl
  window.open(url, 'blank')
}
watch(
  () => props.uuid,
  () => {
    props.uuid && getWarnInfo(props.uuid)
  },
  {
    deep: true,
    immediate: true,
  }
)
watch(
  () => props.warnInfo,
  (val) => {
    if (val?.warnId) {
      let flowName: any = route.query.flowName || 'all'
      getWarnList(val.taskId, val.warnId, flowName, val.nodeCode)
    }
  },
  {
    deep: true,
    immediate: true,
  }
)
// listenerHandle()
defineExpose({
  getCheckedData() {
    return multipleTableRef.value.getSelectionRows()
  },
  listenerHandle,
  clearSelection() {
    multipleTableRef.value.clearSelection()
  },
})
</script>

<style lang="scss" scoped>
.groupvisits {
  max-height: 700px;

  .progress {
    width: 90%;
    margin-left: 15px;
  }

  .content {
    width: 100%;
    padding: 20px 10px 10px;
    box-sizing: border-box;

    .row {
      width: 100%;
      display: flex;
    }

    .el-row {
      margin-bottom: 20px;
    }
    .el-col{
      display: flex;
      &.count_col{
        align-items: center
      }
    }
  }

  .label {
    // width: 100px;
    @include fontStyle(var(--sh3h-font-family-medium),
      $font-size-16,
      var(--sh3h-label-color));
    margin-right: 5px;
  }

  .value {
    @include fontStyle(var(--sh3h-font-family-medium),
      $font-size-16,
      var(--sh3h-value-color));
    font-weight: bold;

    &.address {
      width: calc(100% - 90px);
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    &.description {
      width: calc(100% - 150px);
      max-height: 75px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 5px;
      }
    }
  }
  .count{
    font-size: 18px;
    font-weight: 600;
    margin-right: 3px;
  }
  .groupvisits_table{
    height: 500px;
  }
}
</style>
