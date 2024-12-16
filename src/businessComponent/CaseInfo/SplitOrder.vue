<template>
  <div class="split_wrap">
    <div class="item" v-for="(item, index) in list" :key="item">
      <span>{{ item.splitFlag == '1' ? '母单' : '子单' }}</span >:
      <el-link type="primary" :underline="false" @click="jumpToXFDetail(item.taskId)">
        {{ item.taskId }}
      </el-link> - 
      <span>{{ item.flowStateName }}</span >( <span>{{ item.executeDepartmentName }}</span >)
      <span>{{ index === list.length - 1 ? '' : ',' }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, reactive } from 'vue'
import { LettersVisitService } from '@/api/service/LettersVisit/LettersVisitService'
import { Response } from '@/api/interface'
import { useCaseDetail } from '@/hooks/useCaseDetail'

const { jumpToXFDetail } = useCaseDetail()

const lettersVisitService = new LettersVisitService()
const props = withDefaults(defineProps<{ taskId: string }>(), {
  taskId: '',
})
const list: any = ref([])

const getInfo = () => {
  // TODO: 接入接口
  lettersVisitService
    .getFormatSplitOrder(props.taskId)
    .then((res: Response) => {
      console.log(res)
      list.value = res.data
    })
}
getInfo()
defineExpose({})
</script>

<style lang="scss" scoped>
.split_wrap {
  display: flex;
  flex-wrap: wrap;
  .item {
    margin-right: 10px;
  }
}
</style>
