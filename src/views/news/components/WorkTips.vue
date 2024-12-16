<template>
  <List title="工作提示" :lists="state.workReportData" :typeHidden="false" @report="changeReport" @downloadFile="downloadFile"></List>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import List from './List.vue'
import { PortalModel } from "@/api/model/portalModel";
import { SearchModel } from "@/api/model/baseModel";
import { NewsService } from "@/api/service/Portal/NewsService";
import { WorkRemindService } from "@/api/service/Portal/WorkRemindService";
import { ElMessage } from 'element-plus';
const workRemindSever = new WorkRemindService()
const newsSever = new NewsService()
// const props = withDefaults(defineProps<{}>(), {})

const state = reactive({
  workReportData:[]
})

const changeReport=(type:string)=>{
  getWorkReportData()
}
const getWorkReportData = ()=>{
  newsSever.getEsData('37').then(res => {
    if (res.values?.length > 0) {
      state.workReportData = res.values
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

<style lang="scss" scoped>
</style>
