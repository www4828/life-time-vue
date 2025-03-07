<template>
  <div class="api-info-wrap">
    <div class="api-base-info">

    </div>
    <div class="api-use-info">api-use</div>
  </div>
</template>
<script scoped lang="ts" setup>
import { reactive, ref } from 'vue'
import { ApiModel } from '@/api/model/apiModel'


const props = defineProps({
  formData: {
    type: ApiModel,
  }
})
</script>
<style lang="scss" scoped>
.api-info-wrap {
  width: 100%;
  height: 100%;
  font-size: 16px;
  .api-base-info{
    width: 100%;
    height: 200px;
  }
}
</style>
