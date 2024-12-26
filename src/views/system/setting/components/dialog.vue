<template>
  <el-dialog
    :model-value="props.showFlag"
    :title="props.dialogStatus"
    width="30%"
    @close="$emit('closeDialog')"
    destroy-on-close
  >
    <el-form
      ref="dataForm"
      :inline="true"
      :model="props.formData"
      class="form"
      :rules="rules"
    >
      <el-form-item label="样式名称：" prop="themeKey" class="long_item" >
        <el-input
          v-model="props.formData.themeKey"
          placeholder="样式名称"
          :disabled="props.dialogStatus === '修改' "
        />
        </el-form-item>
      <el-form-item label="样式值：" prop="themeValue" class="long_item">
        <template v-if="props.formData.themeType === 'color'">
          <pick-colors v-model:value="props.formData.themeValue" />
          <span>{{ props.formData.themeValue }}</span>
        </template>
        <el-input v-model="props.formData.themeValue" placeholder="样式值" v-else />
      </el-form-item>
      <el-form-item label="样式类型：" prop="themeType" class="long_item">
        <el-select v-model="props.formData.themeType" placeholder="样式类型">
          <el-option label="颜色" value="color" />
          <el-option label="像素" value="number" />
          <el-option label="字体" value="string" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否渐变：" prop="sort" class="long_item">
        <el-switch v-model="props.formData.themeOpacity" active-value="1" inactive-value="0" />
      </el-form-item>
      <el-form-item label="样式用途：" class="long_item">
        <el-input v-model="props.formData.themeDes" placeholder="样式用途" />
      </el-form-item>
      <el-form-item label="是否开启：" class="long_item">
        <el-switch v-model="props.formData.status" class="ml-2" :active-value="1" :inactive-value="0"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('closeDialog')">取消</el-button>
        <el-button type="primary" @click="createData()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, ref, watch } from "vue";
import { ElForm, ElTree } from "element-plus";
import type { FormRules } from "element-plus";
import { ThemeStyleModel } from "@/api/model/themeModel";
import PickColors from 'vue-pick-colors'

type FormRules = /*unresolved*/ any
const treeProps = {
  label: "name",
  value: "code",
  children: "child",
};
const emits = defineEmits(["closeDialog", "update", "save"]);
const props = defineProps<{
  showFlag: boolean;
  formData: ThemeStyleModel;
  dialogStatus: string
}>();
const dataForm = ref<InstanceType<typeof ElForm>>();
const rules = reactive<FormRules>({
  themeKey: [{ required: true, message: "字典编号不能为空", trigger: "blur" }],
  themeValue: [{ required: true, message: "字典名称不能为空", trigger: "blur" }],
  themeType: [{ required: true, message: "请选择类型编号", trigger: "change" }],
});

const createData = () => {
  dataForm.value!.validate(async (valid: any) => {
    if (valid) {
      props.dialogStatus === "修改"
        ? emits("update", props.formData)
        : emits("save", props.formData);
    }
  });
};

</script>
<style lang="scss">
.option-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.form{
  position: relative;
}
</style>
