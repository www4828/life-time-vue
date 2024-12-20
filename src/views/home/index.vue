<template>
  <div class="home-container">
    <!-- <Scrollbar v-if="!deptHomeUrl"> </Scrollbar>
    <iframe :src="deptHomeUrl" v-else class="iframe" frameborder="0"></iframe> -->
  </div>
</template>

<script lang="ts" setup>
import qs from 'qs'
import { ref } from 'vue'
import { useDepartment } from '@/hooks/useDepartment'
import Scrollbar from '@/components/scrollbar/index.vue'
import { UserService } from '@/api/service/System/UserService'

const userService = new UserService()
const deptHomeUrl = ref('')
const departmentInfo = useDepartment()
type Value = keyof typeof departmentInfo


</script>
<style lang="scss">
.home-container {
  width: calc(100% - 10px);
  height: calc(100% - 10px);
  margin: 5px 10px 5px 5px;
  .iframe {
    width: 100%;
    height: 100%;
  }
}
.el-skeleton {
  float: left;
  margin: 20px 20px;
}
</style>
