<template>
  <el-dialog
    v-model="data.dialogVisible"
    title="授权"
    width="30%"
    @close="$emit('closeDialog')"
    destroy-on-close
    :close-on-click-modal="false"
    class="card-mark"
  >
  <div class="content">
    <ApiGroupTree
      :showSearch="false"
      :showLine="false"
      :treeJson="{ type: apiGroupSever }"
      operate
      showCheckbox
      ref="apiTree"
    />

  </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('closeDialog')">取消</el-button>
        <el-button type="primary" @click="createData()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue";
import { ElForm } from "element-plus";
import { ClientModel } from "@/api/model/clientModel";
import { useCode } from "@/hooks/useCode";
import { cloneDeep } from "lodash-es";
import ApiGroupTree from "@/businessComponent/tree/index.vue";
import { ApiGroupService } from "@/api/service/Api/ApiService";

const { types } = useCode();
const apiGroupSever = new ApiGroupService()
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
});

const data = reactive({
  dialogVisible: false,
  createForm: {} as any,
});
const apiTree = ref()

const createData = () => {
  let keys = apiTree.value.getCheckedKeys()
  console.log(keys);
  
};

const init = () => {};

watch(
  () => props.showFlag,
  (newValue, oldValue) => {
    data.dialogVisible = newValue;
    if (newValue) {
      init();
    }
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
