<template>
  <el-dialog
    v-model="data.dialogVisible"
    :title="props.dialogStatus"
    width="30%"
    @close="$emit('closeDialog')"
    destroy-on-close
    :close-on-click-modal="false"
    class="card-mark"
    top="80px"
  >
  <div class="content">
    <el-form
      ref="dataForm"
      :inline="true"
      :model="props.formData"
      class="form"
      :rules="rules"
    >
      <el-form-item label="appId:" prop="appId" class="long_item">
        <el-input
          v-model="props.formData.appId"
          placeholder="appId"
          :disabled="props.dialogStatus === '添加' ? false : true"
        />
      </el-form-item>
      <el-form-item label="应用名称:" prop="appName" class="long_item">
        <el-input v-model="props.formData.appName" placeholder="应用名称" />
      </el-form-item>
      <el-form-item label="应用类型:" prop="appType" class="long_item">
        <el-select
          v-model="props.formData.appType"
          clearable
          placeholder="应用类型"
        >
          <el-option
            v-for="item in types.AppTypes"
            :value="item.codeValue"
            :label="item.codeName"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="应用描述:" prop="appDes" class="long_item">
        <el-input v-model="props.formData.appDes" placeholder="应用描述" />
      </el-form-item>
      <el-form-item label="策略类型:" prop="strategy" class="long_item">
        <el-select
          v-model="props.formData.strategy"
          clearable
          placeholder="策略类型"
        >
          <el-option label="白名单" value="white" />
          <el-option label="黑名单" value="black" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态:" prop="status" class="long_item">
        <el-switch
          v-model="props.formData.status"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
    </el-form>
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
import type { FormRules } from "element-plus";
import { View, Hide, Edit } from "@element-plus/icons-vue";
import { ClientModel } from "@/api/model/clientModel";

import { useCode } from "@/hooks/useCode";
import { cloneDeep } from "lodash-es";
import { randomString } from "@/utils";

const { types } = useCode();
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
const typeOption: any = [];
const resourceOption: any = [];

const data = reactive({
  dialogVisible: false,
  pwdType: "password",
  showUrlFlag: false,
  urlList: [
    {
      text: "",
      show: false,
    },
  ],
  updateUrlId: "",
});
const dataForm = ref(ElForm);

const rules = reactive<InstanceType<typeof FormRules>>({
  clientId: [{ required: true, message: "不能为空", trigger: "blur" }],
});

const createData = () => {
  const form = unref(dataForm);
  form.validate(async (valid: any) => {
    if (valid) {
      let params = cloneDeep(props.formData);
      params.appKey = props.formData.appKey || "lt-" + randomString();
      params.appSecret = props.formData.appSecret || "lt-" + randomString();
      params.appCode = props.formData.appSecret || randomString(8);
      props.dialogStatus === "修改"
        ? emits("update", params)
        : emits("save", params);
    }
  });
};

watch(props, (newValue, oldValue) => {
  data.dialogVisible = newValue.showFlag;
});
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
