<template>
  <div class="work-indicates-container">
    <List title="工作提示" mark="WORK INDICATES" :lists="state.list" :typeHidden="false" @downloadFile="downloadFile"></List>
  </div>
</template>
<script setup lang="ts">
import { useStore } from '@/store'
import { computed, reactive, ref } from 'vue'
import { NewsService } from '@/api/service/Portal/NewsService'
import { WorkRemindService } from "@/api/service/Portal/WorkRemindService";
import { ElMessage } from 'element-plus';
import List from '@/views/login/components/list.vue'

const workRemindSever = new WorkRemindService()
const newsSever = new NewsService()
const store = useStore()
const state = reactive({
  list:[]
})

const getWorkReportData = ()=>{
  newsSever.getEsData('37').then(res => {
    if (res.values?.length > 0) {
      res.values.forEach((item:any)=>{
        item.year = item.NOTICE_TIME.split('-')[0]
        item.day = item.NOTICE_TIME.split('-')[1] + '-' + item.NOTICE_TIME.split('-')[2]
      })
      state.list = res.values
    }
  })
}
getWorkReportData()

const downloadFile = (id:string)=>{
  workRemindSever.findById(id).then(res=>{
    if(res.data.url){
      const link = document.createElement('a')
      link.href = res.data.url
      link.click()
    }else{
      ElMessage.error(res.message)
    }
  })
}
</script>
<style scoped lang="scss">
.work-indicates-container {
  width: 100%;
  height: 50%;
  background: url('@/assets/protal/gzts.png') no-repeat left bottom;
  padding: 0 350px;
  box-sizing: border-box;
  position: absolute;
  bottom: 0px;
}
</style>
