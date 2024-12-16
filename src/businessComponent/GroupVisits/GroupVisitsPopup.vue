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
        <el-col :span="24">
          <span class="label">报警产生:</span>
          <span class="value description"> {{ state.info.firstTime }} </span>
        </el-col>
        <el-col :span="24">
          <span class="label">报警更新:</span>
          <span class="value description"> {{ state.info.lastTime }} </span>
        </el-col>
        <el-col :span="24" class="count_col">
          <span class="label">涉及案件:</span>
          <el-link class="count" type="primary" @click="jumpPage">{{ state.count }}</el-link>件
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import Title from '@/components/Title/Title.vue'
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { Session } from '@/utils/storage'
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

const state = reactive({
  info: {} as any,
  tableData: [] as any,
  submit: false,
  count: 0,
  progress: 10,
  loading: false,
  text: '加载中...',
})


const getWarnInfo = (id: string) => {
  disposeService.getWarnInfo(id).then((res) => {
    state.info = res.data.warnAlarm
    state.info.firstTime = dayjs(res.data.warnAlarm.firstTime).format('YYYY-MM-DD HH:mm')
    state.info.lastTime = dayjs(res.data.warnAlarm.lastTime).format('YYYY-MM-DD HH:mm')
    state.count = res.data.count
  })
}

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

</script>

<style lang="scss" scoped>
.groupvisits {
  max-height: 700px;

  .content {
    width: 100%;
    background-color: var(--sh3h-workTicket-background-color);
    padding: 10px 10px 0;
    box-sizing: border-box;

    .el-col{
      display: flex;
      margin-bottom: 10px;
      &.count_col{
        align-items: center
      }
    }
  }

  .label {
    width: 80px;
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


    &.description {
      width: calc(100% - 90px);
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
}
</style>
