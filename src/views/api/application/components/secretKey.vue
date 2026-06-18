<template>
  <el-dialog
    v-model="data.dialogVisible"
    title="应用密钥"
    width="30%"
    @close="$emit('closeDialog')"
    destroy-on-close
    :close-on-click-modal="false"
    class="card-mark"
  >
    <div class="content">
      <el-form ref="dataForm" :inline="true" :model="props.formData" class="form">
        <el-form-item label="AppKey:" prop="appKey" class="long_item">
          <el-input v-model="props.formData.appKey" placeholder="appKey" readonly />
        </el-form-item>
        <el-form-item label="AppSecret:" prop="appSecret" class="long_item">
          <el-input v-model="props.formData.appSecret" placeholder="appSecret" readonly />
        </el-form-item>
        <el-alert
          title="请妥善保管AppSecret，离开此页面后将无法再次查看。建议定期轮换密钥以保障安全"
          type="warning"
          :closable="false"
          show-icon
          style="width: 90%;margin: 0 auto;"
        />
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('closeDialog')">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue";
import { ElForm } from "element-plus";
import { ClientModel } from "@/api/model/clientModel";

const emits = defineEmits(["closeDialog", "update", "save"]);
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    default: {} as ClientModel,
  },
  dialogStatus: {
    type: String,
  },
});

const data = reactive({
  dialogVisible: false,
  createForm: {} as any,
});

watch(
  () => props.showFlag,
  (newValue, oldValue) => {
    data.dialogVisible = newValue;
  },
);
</script>
<style lang="scss" scoped>
.uris {
  position: absolute;
  right: -30px;
}
.el-form {
  .long_item {
    width: 100%;
  }
}
</style>
