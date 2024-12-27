<template>
  <el-dialog
    :model-value="props.dialogVisible"
    title="请选择登陆部门"
    width="20%"
    @close="emit('close', false);"
  >
  <div class="content"></div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('close', false)">取消</el-button>
        <el-button type="primary" @click="save"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";

const emit = defineEmits(["close", "save"]);
const props = withDefaults(defineProps(), {
  dialogVisible: false
});

const save = ()=>{}
</script>