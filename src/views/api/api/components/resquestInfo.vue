<template>
  <el-table :data="state.list" header-cell-class-name="tableHeader">
    <el-table-column prop="paramName" label="参数名称" align="center">
      <template #default="scope">
        <el-input
          v-model="state.list[scope.$index].paramName"
          style="width: 100%"
          placeholder="参数名称"
        />
      </template>
    </el-table-column>
    <el-table-column prop="columnName" label="映射字段" align="center">
      <template #default="scope">
        <el-input
          v-model="state.list[scope.$index].columnName"
          style="width: 100%"
          placeholder="映射字段"
        />
      </template>
    </el-table-column>
    <el-table-column prop="paramType" label="参数类型" align="center">
      <template #default="scope">
        <el-select
          class="sh3h-search-input"
          v-model="state.list[scope.$index].paramType"
          style="width: 100%"
          placeholder="参数类型"
        >
          <el-option label="String" value="String" />
          <el-option label="Int" value="Int" />
          <el-option label="Date" value="Date" />
          <el-option label="Array" value="Array" />
          <el-option label="Boolean" value="Boolean" />
        </el-select>
      </template>
    </el-table-column>
    <el-table-column prop="example" label="示例值" align="center">
      <template #default="scope">
        <el-input
          v-model="state.list[scope.$index].example"
          style="width: 100%"
          placeholder="示例值"
        />
      </template>
    </el-table-column>
    <el-table-column prop="remark" label="备注" align="center">
      <template #default="scope">
        <el-input
          v-model="state.list[scope.$index].remark"
          style="width: 100%"
          placeholder="备注"
        />
      </template>
    </el-table-column>
    <el-table-column prop="required" label="必填" align="center" width="80px">
      <template #default="scope">
        <el-checkbox
          v-model="state.list[scope.$index].required"
          size="large"
          true-value="1"
        />
      </template>
    </el-table-column>
    <el-table-column label="" align="center" class-name="setting" width="80px">
      <template #default="scope">
        <el-link
          type="primary"
          @click="addDocument"
          :underline="false"
        >
          <el-icon class="el-icon--right">
            <DocumentAdd />
          </el-icon>
        </el-link>
        <el-link
          type="primary"
          @click="deleteDocument(scope)"
          :underline="false"
        >
          <el-icon class="el-icon--right">
            <Delete />
          </el-icon>
        </el-link>
      </template>
    </el-table-column>
    <template #empty>
      <el-empty description="暂无数据" />
    </template>
  </el-table>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue";
import { ElForm } from "element-plus";
import { cloneDeep } from "lodash-es";
import { RequestInfoModel } from "@/api/model/apiModel";
import Title from "@/components/Title/Title.vue";
import { Close, Delete, SetUp, DocumentAdd } from "@element-plus/icons-vue";

const emits = defineEmits(["closeDialog", "update", "save"]);
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false,
  },
  apiCode:{ type: String},
  formData: {
    type: Array<RequestInfoModel>,
    default: [] as RequestInfoModel[],
  },
});

const state = reactive({
  drawer: false,
  list: [] as RequestInfoModel[],
  isPage: "0",
});

const deleteDocument = (scope: any) => {
  state.list = state.list.filter((item, index) => index !== scope.$index);
};
const addDocument = () => {
  state.list.push({
    apiCode: props.apiCode,
    columnName: "",
    defaultValue: "",
    example: "",
    paramModel: "request",
    paramName: "",
    paramType: "String",
    privacy: "",
    remark: "",
    required: "",
  } as RequestInfoModel);
};

watch(
  () => props.showFlag,
  (newValue, oldValue) => {
    state.drawer = props.showFlag;
  },
);
watch(
  () => props.formData,
  (newValue, oldValue) => {
    if (props.formData?.length > 0) {
      state.list = cloneDeep(props.formData);
    } else {
      state.list = [];
      addDocument()
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

defineExpose({
  getformData() {
    return {
      params: state.list.filter((i) => i.paramName),
      isPage: state.isPage,
    };
  },
});
</script>
<style lang="scss" scoped>
.op-icon {
  width: 100%;
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;

  .el-icon {
    margin-right: 10px;
    font-size: 20px;
  }
}
.el-table {
  min-height: 300px;
}
.close-icon {
  position: absolute;
  right: 15px;
  top: 15px;
}
</style>
