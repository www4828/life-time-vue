<template>
  <div class="audio-player">
    <AudioPlayer :audioSrc="audioSrc" @download="download"/>
    <!-- <el-icon color="#3571D4" @click="download()"><Download /></el-icon> -->
  </div>
</template>
<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { ref } from 'vue'
import { useRoute } from 'vue-router';
import AudioPlayer from './player.vue'
import { FileAttachmentService } from "@/api/service/WorkTicket/FileAttachmentService";
import { Download } from '@element-plus/icons-vue'

const fileAttachmentService = new FileAttachmentService();
const route = useRoute();
const audioSrc = ref('')
const disabled = ref(false)

const init = ()=>{
  if(route.query.id){
    fileAttachmentService.getVideoById(String(route.query.id)).then(res=>{
      audioSrc.value = res.data?.recordName || ''
    })
  }else{
    ElMessage.warning('请传入音频编号！')
  }
}
init()

const download = (()=>{
  if(audioSrc.value){
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = audioSrc.value
    document.body.appendChild(link);
    link.click();
  }else{
    ElMessage.warning('无可下载文件')
  }
})
</script>
<style lang="scss" scoped>
.audio-player{
  width: 100%;
  height: 100%;
}
</style>