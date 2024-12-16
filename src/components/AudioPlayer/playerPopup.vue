<template>
  <el-popover
    ref="popoverRef"
    :virtual-ref="audioButtonRef"
    trigger="click"
    virtual-triggering
    @hide="hideHandle"
    width="400"
    :popper-style="{ height: '110px' }"
    :visible="state.showPopover"
  >
    <el-icon class="closeIcon" @click="state.showPopover = false"><Close /></el-icon>
    <AudioPlayer
      :audioSrc="audio.url || audio.recordName"
      v-if="audio?.url || audio?.recordName"
    />
  </el-popover>
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import {  Close } from "@element-plus/icons-vue";
import { FileAttachmentService } from "@/api/service/WorkTicket/FileAttachmentService";
import { cloneDeep } from "lodash-es";
import AudioPlayer from "@/components/AudioPlayer/player.vue";

const fileAttachmentService = new FileAttachmentService();
const audioButtonRef = ref();
const popoverRef = ref();

const state = reactive({
  showPopover: false, // 语音弹窗
});

const audio: any = ref({});
const hideHandle = () => {
  audio.value = {};
};
const handlePlayVideo = (e: any, info: any) => {
  state.showPopover = false;
  audioButtonRef.value = e.target;
  state.showPopover = true;
  if (info.type == "voice" && !info.url) {
    fileAttachmentService.getVideoById(info.attachment).then((res) => {
      audio.value = cloneDeep(res.data);
    });
  } else {
    audio.value = info;
  }
};

defineExpose({
  handlePlayVideo
});
</script>