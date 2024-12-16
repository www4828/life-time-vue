<template>
  <List title="工作简报" :lists="state.workReportData" :typeHidden="true" @report="changeReport" @downloadFile="downloadFile"></List>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import List from './List.vue'
import { PortalModel } from "@/api/model/portalModel";
import { SearchModel } from "@/api/model/baseModel";
import { NewsService } from "@/api/service/Portal/NewsService";
import { JobBriefService } from "@/api/service/Portal/JobBriefService";
import { ElMessage } from 'element-plus';
const newsSever = new NewsService()
const jobBriefSever = new JobBriefService()
// const props = withDefaults(defineProps<{}>(), {})

const state = reactive({
  workReportData:[]
})
const changeReport=(type:string)=>{
  getWorkReportData()
}
const getWorkReportData = ()=>{
  newsSever.getEsData('39').then(res => {
    if (res.values?.length > 0) {
      state.workReportData = res.values
    }
  })
}
getWorkReportData()

const downloadFile = (id:string)=>{
  jobBriefSever.findById(id).then(res=>{
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
