<template>
  <ApiInfo v-if="state.formData?.apiBaseInfo?.apiCode" :formData="state.formData" @showInfo="showInfo" />
  <ApiHub v-else @showInfo="showInfo"/>
</template>
<script scoped lang="ts" setup>
import { reactive, ref } from 'vue'
import ApiHub from './apiHub.vue';
import ApiInfo from './apiInfo.vue';
import { ApiModel } from '@/api/model/apiModel';
import { cloneDeep } from 'lodash-es';

const state = reactive({
  formData: {} as ApiModel
})

const showInfo = (item: ApiModel)=>{
  state.formData = cloneDeep(item)
}

</script>
<style lang="scss" scoped>
</style>
