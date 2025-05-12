<template>
  <el-drawer v-model="state.drawer" direction="rtl">
    <template #header>
      <h4>title</h4>
    </template>
    <template #default>
      <div>
        el-drawer
      </div>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="cancelClick">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'

const state = reactive({
  drawer: false
})


const cancelClick = ()=>{
  state.drawer = false
}
</script>
<style lang="scss" scoped></style>
