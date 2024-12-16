<template>
  <el-dialog
    :model-value="props.showFlag"
    :title="props.dialogStatus"
    width="42%"
    @close="$emit('closeDialog')"
    destroy-on-close
  >
    <el-form
      ref="dataForm"
      :inline="true"
      :model="props.formData"
      class="form"
      label-width="35%"
      :rules="rules"
    >
      <el-form-item label="字典编号：" prop="code">
        <el-input
          v-model="props.formData.code"
          placeholder="字典编号"
          />
          <!-- :disabled="props.dialogStatus === '添加' ? false : true" -->
        </el-form-item>
      <el-form-item label="字典名称：" prop="name">
        <el-input v-model="props.formData.name" placeholder="字典名称" />
      </el-form-item>
      <el-form-item label="类型编号：" prop="codeParent">
        <el-tree-select
          v-model="props.formData.codeId"
          :data="props.treeData"
          :props="treeProps"
          ref="treeRef"
          check-strictly
          node-key="id"
          :render-after-expand="false"
          @node-click="nodeClick"
        />
      </el-form-item>
      <el-form-item label="排序：" prop="sort">
        <el-input v-model="props.formData.sort" placeholder="排序" />
      </el-form-item>
      <el-form-item label="预留参数一">
        <el-input v-model="props.formData.firstParam" placeholder="预留参数一" />
      </el-form-item>
      <el-form-item label="预留参数二">
        <el-input v-model="props.formData.secondParam" placeholder="预留参数二" />
      </el-form-item>
      <el-form-item label="预留参数三">
        <el-input v-model="props.formData.thirdParam" placeholder="预留参数三" />
      </el-form-item>
      <el-form-item label="预留参数四">
        <el-input v-model="props.formData.fourthParam" placeholder="预留参数四" />
      </el-form-item>
      <el-form-item label="是否启用：" prop="status">
        <el-switch
          v-model="props.formData.status"
          :active-value="1"
          :inactive-value="0"
        />
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
import { reactive, ref } from "vue";
import { ElForm, ElTree } from "element-plus";
import type { FormRules } from "element-plus";
import { CodeModel, CodeTreeModel } from "@/api/model/codeModel";
import type Node from "element-plus/es/components/tree/src/model/node";

const treeProps = {
  label: "codeName",
  value: "id",
  children: "childs",
};
const emits = defineEmits(["closeDialog", "update", "save"]);
const props = defineProps<{
  showFlag: boolean;
  formData: CodeModel;
  dialogStatus: string;
  treeData: CodeTreeModel[];
}>();
const dataForm = ref<InstanceType<typeof ElForm>>();
const treeRef = ref<InstanceType<typeof ElTree>>();
const rules = reactive<FormRules>({
  code: [{ required: true, message: "字典编号不能为空", trigger: "blur" }],
  name: [{ required: true, message: "字典名称不能为空", trigger: "blur" }],
  codeId: [{ required: true, message: "请选择类型编号", trigger: "change" }],
});
/* const getParentCode = (data: Tree[], id: string) => {
  let codeParent = "";
  for (let i = 0; i < data.length; i++) {
    const tree = data[i];
    if (tree.id === id) {
      codeParent = tree.codeParent;
      break
    } else {
      if (tree.childs && tree.childs.length > 0) {
        const parentId:string = getParentCode(tree.childs, id);
        console.log(parentId);
        if (parentId) {
          return parentId
        }
      }
    }
  }
  return codeParent;
}; */
const nodeClick = (tree: CodeTreeModel, node: Node) => {
    props.formData.typeCode = tree.codeType || "";
    props.formData.parentCode = tree.codeValue || "";
};
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
</style>
