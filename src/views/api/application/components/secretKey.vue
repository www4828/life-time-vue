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
      <el-form
        ref="dataForm"
        :inline="true"
        :model="props.formData"
        class="form"
      >
        <el-form-item label="AppCode:" prop="appKey" class="long_item">
          <el-input
            v-model="props.formData.appCode"
            placeholder="appCode"
            readonly
          />
          <el-link
            :icon="CopyDocument"
            style="position: absolute; right: 10px"
            @click="copyHandle(props.formData.appCode)"
            :underline="false"
            type="primary"
          >
          </el-link>
        </el-form-item>
        <el-form-item label="AppKey:" prop="appKey" class="long_item">
          <el-input
            v-model="props.formData.appKey"
            placeholder="appKey"
            readonly
          />
          <el-link
            :icon="CopyDocument"
            style="position: absolute; right: 10px"
            @click="copyHandle(props.formData.appKey)"
            :underline="false"
            type="primary"
          >
          </el-link>
        </el-form-item>
        <el-form-item label="AppSecret:" prop="appSecret" class="long_item">
          <el-input
            v-model="props.formData.appSecret"
            placeholder="appSecret"
            readonly
          />
          <el-link
            :icon="CopyDocument"
            style="position: absolute; right: 10px"
            @click="copyHandle(props.formData.appSecret)"
            :underline="false"
            type="primary"
          >
          </el-link>
        </el-form-item>
        <el-alert
          title="请妥善保管AppSecret，离开此页面后将无法再次查看。建议定期轮换密钥以保障安全"
          type="warning"
          :closable="false"
          show-icon
          style="width: 90%; margin: 0 auto"
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
import { CopyDocument } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

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
function copyToClipboard(textToCopy: string) {
  // navigator clipboard 需要https等安全上下文
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard 向剪贴板写文本
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // document.execCommand('copy') 向剪贴板写文本
    let input = document.createElement("input");
    input.style.position = "fixed";
    input.style.top = "-10000px";
    input.style.zIndex = "-999";
    document.body.appendChild(input);
    input.value = textToCopy;
    input.focus();
    input.select();
    try {
      let result = document.execCommand("copy");
      document.body.removeChild(input);
      if (!result || result === "unsuccessful") {
        console.log("复制失败");
      } else {
        console.log("复制成功");
      }
    } catch (e) {
      document.body.removeChild(input);
      console.log("当前浏览器不支持复制功能，请检查更新或更换其他浏览器操作");
    }
  }
}

const copyHandle = (text: string) => {
  copyToClipboard(text);
  ElMessage.success("复制成功");
};

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
