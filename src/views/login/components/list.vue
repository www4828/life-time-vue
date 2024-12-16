<template>
  <div class="list-container">
    <div class="left">
      <div class="key">{{ props.mark }}</div>
      <div class="title">{{ props.title }}</div>
      <div class="more" @click="moreClick">更多</div>
    </div>
    <div class="right">
      <Scrollbar class="caseWrapper">
        <div class="item" v-for="item in props.lists">
          <div class="time">
            <div class="day">{{ item.day }}</div>
            <span class="year">{{ item.year }}</span>
          </div>
          <div class="split"></div>
          <div class="wrap">
            <div class="header">{{ item.NAME }}</div>
            <div class="content" @click="downloadFile(item.ID)">
              {{ item.FILENAME }}
            </div>
          </div>
        </div>
      </Scrollbar>
    </div>
  </div>
  <MoreDialog
    v-if="state.dialogHidden"
    :dialogVisible="state.dialogHidden"
    :title="props.title"
    :addTitle="state.addTitle"
    @close="state.dialogHidden = false"
    :typeHidden="props.typeHidden"
  >
  </MoreDialog>
</template>
<script setup lang="ts">
import { useStore } from '@/store'
import { computed, reactive, ref } from 'vue'
import { NewsService } from '@/api/service/Portal/NewsService'
import { WorkRemindService } from '@/api/service/Portal/WorkRemindService'
import { ElMessage } from 'element-plus'
import MoreDialog from '@/views/news/components/MoreDialog.vue'
import Scrollbar from '@/components/scrollbar/index.vue'

const workRemindSever = new WorkRemindService()
const newsSever = new NewsService()
const store = useStore()
const emit = defineEmits(['report', 'downloadFile'])
const props = defineProps<{
  title: string
  mark: string
  lists: any
  typeHidden?: boolean
}>()

const state = reactive({
  dialogHidden: false,
  dialogTitle: '',
  addTitle: '',
  checkType: '',
})

const moreClick = () => {
  // emit('more', props.title)
  let isLogin = sessionStorage.getItem('token')
  if (isLogin) {
    state.dialogHidden = true
    // state.dialogTitle = type
    if (props.title == '工作提示') {
      state.addTitle = '提示标题'
    } else if (props.title == '热线简报') {
      state.addTitle = '简报标题'
    } else if (props.title == '政策文件') {
      state.addTitle = '文件标题'
    }
  } else {
    ElMessage.warning('请登录后查看更多')
  }
}
const reportType = (type: string) => {
  emit('report', type)
  state.checkType = type
}
const downloadFile = (id: string) => {
  let isLogin = sessionStorage.getItem('token')
  if (isLogin) {
    emit('downloadFile', String(id))
  } else {
    ElMessage.warning('请登录后查看')
  }
}
</script>
<style scoped lang="scss">
.list-container {
  display: flex;
  height: calc(100% - 110px);
  .left {
    width: 230px;
    @include fontStyle('SourceHanSansCN-Regular', $font-size-16, #000);
    .key {
      color: #999999;
      margin-bottom: 10px;
    }
    .title {
      font-size: 24px;
      margin-bottom: 90px;
    }
    .more {
      color: #2e2e2e;
      display: flex;
      align-items: center;
      cursor: pointer;
      &::after {
        content: ' ';
        width: 34px;
        height: 19px;
        background: url('@/assets/protal/more.png') no-repeat center;
        margin-left: 5px;
      }
    }
  }
  .right {
    @include fontStyle('SourceHanSansCN-Regular', $font-size-16, #6f6f6f);
    .item {
      display: flex;
      margin-bottom: 30px;
      .time {
        width: 100px;
        font-size: 22px;
        color: #575757;
        .year {
          font-size: 14px;
          padding: 0 5px;
          border: 1px solid #575757;
          letter-spacing: 2px;
        }
      }
      .split {
        width: 40px;
        height: 1px;
        background-color: #959595;
        margin-right: 30px;
        margin-top: 15px;
      }
      .wrap {
        .header {
          font-size: 18px;
          color: #2f2f2f;
          font-weight: 600;
          margin-bottom: 30px;
        }
        .content{
          cursor: pointer;
        }
      }
    }
  }
}
</style>

