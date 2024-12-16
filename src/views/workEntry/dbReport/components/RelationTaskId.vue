<template>
  <div class="relation-container" v-if="data.oldTaskId">
    <el-link
      type="primary"
      :underline="false"
      @click="jumpToOldDetail(data.oldTaskId)"
    >
      {{ data.oldTaskId }}
    </el-link>
    <span v-if="data.relationTaskIdList.length > 0">（</span>
    <el-link
      type="primary"
      :underline="false"
      v-for="(item, index) in data.relationTaskIdList"
      :key="item"
      @click="jumpToDetail(item)"
    >
      {{ item }}
      {{ (data.relationTaskIdList.length > 1 && index !== data.relationTaskIdList.length - 1) ? ',' : ''}}
    </el-link>
    <span v-if="data.relationTaskIdList.length > 0">）</span>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useCaseDetail } from '@/hooks/useCaseDetail'

const { jumpToDetail, jumpToOldDetail } = useCaseDetail()

const props = defineProps<{
  code: string
}>()

const data = reactive({
  relationTaskIdList: [] as Array<string>,
  oldTaskId: '',
})

const init = () => {
  data.oldTaskId = props.code?.split('（')[0]
  if (props.code.indexOf('（') > -1) {
    let list = props.code.match(/\（(\S*)\）/)

    if (list && list[1]) {
      data.relationTaskIdList = list[1].split(',')
    }
  }
}
init()
</script>
<style lang="scss"></style>
