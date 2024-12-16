<template>
  <div>
    <el-cascader :options="options" :props="{ multiple: true, checkStrictly: true,label:'departmentName',value:'departmentCode' }" clearable :show-all-levels="true"
      collapse-tags collapse-tags-tooltip v-model="value" @change="$emit('submit',value)" />

  </div>
</template>
<script scoped lang="ts" setup>
import { ref, unref } from 'vue'
const emits = defineEmits(['submit']);
const props = defineProps({
  options: {
    type: Array,
    default: []
  },
  value: {
    type: Array,
    default: []
  }
})
</script>
<style lang="scss">
</style>