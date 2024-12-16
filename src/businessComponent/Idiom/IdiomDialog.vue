<template>
  <el-dialog
    :model-value="props.showFlag"
    title="惯用语"
    width="42%"
    :modal="false"
    :close-on-click-modal="false"
    @close="emit('closeDialog')"
    destroy-on-close
  >
    <el-tabs
      type="border-card"
      v-model="tabValue"
      @tab-change="tabChange"
      @tab-click="tabStatus = false"
    >
      <el-tab-pane label="惯用语操作" name="idiom">
        <el-table
          :data="tableData"
          style="width: 100%"
          height="500px"
          :header-cell-style="{ 'text-align': 'center' }"
          :cell-style="{ 'text-align': 'center' }"
          @row-click="rowClick"
        >
          <el-table-column prop="phraseName" label="惯用语名称" />
          <el-table-column
            prop="phraseContent"
            label="惯用语内容"
            show-overflow-tooltip
          />
          <el-table-column align="center" label="操作">
            <template #default="scope">
              <el-button type="warning" plain @click.stop="jumpUpdate(scope.row)"
                >修改</el-button
              >
              <el-button type="danger" plain @click.stop="deleteHandle(scope.row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="信息输入" name="update">
        <el-form ref="dataForm" :model="dialog.formData">
          <el-form-item label="惯用语名称：" prop="phraseName">
            <el-input v-model="dialog.formData.phraseName" placeholder="惯用语名称" />
          </el-form-item>
          <el-form-item label="惯用语内容：" prop="phraseContent">
            <el-input
              v-model="dialog.formData.phraseContent"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              maxlength="500"
              placeholder="惯用语内容"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="是否自用：" prop="phraseName">
            <el-switch
              v-model="dialog.formData.isPublish"
              active-value="0"
              inactive-value="1"
            />
          </el-form-item>
        </el-form>
        <div class="flexCenter">
          <el-button @click="update" type="primary">保存</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="danger" @click="emit('closeDialog')">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { SearchModel } from "@/api/model/baseModel";
import { PhraseEntity } from "@/api/model/idiomModel";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDepartment } from "@/hooks/useDepartment";
import { Response, SearchParamsModel } from "@/api/interface";
import { IdiomService } from "@/api/service/Idiom/IdiomService";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";

const props = defineProps<{
  showFlag: boolean;
  nodeCode: NodeCodeKey;
}>();
const emit = defineEmits(["closeDialog", "getIdiomContent"]);
const tabValue = ref("idiom");
const { proxy } = <any>getCurrentInstance()!;
const { currentDepartmentCode, username } = useDepartment();
const tabStatus = ref(false);
const dialog = reactive<{
  showFlag: boolean;
  formData: PhraseEntity;
}>({
  showFlag: false,
  formData: {
    id: "",
    departmentCode: currentDepartmentCode,
    operateCode: props.nodeCode,
    phraseContent: "",
    phraseName: "",
    userCode: username,
    isPublish: "0",
  },
});
const idiomService = new IdiomService();
const searchParamsModel = reactive(new SearchParamsModel<PhraseEntity>());
const searchModel = ref<SearchModel<PhraseEntity>[]>([
  {
    key: "operateCode",
    value: props.nodeCode,
    match: "eq",
  },
  {
    key: "departmentCode",
    value: currentDepartmentCode,
    match: "eq",
  },
  {
    key: "sort",
    value: "count",
    match: "orderByDesc",
  },
]);

const tableData = ref<PhraseEntity[]>([]);
const tabChange = () => {
  if (!tabStatus.value) {
    dialog.formData.phraseContent = "";
    dialog.formData.phraseName = "";
    dialog.formData.id = "";
  }
};
const rowClick = (row: PhraseEntity) => {
  idiomService.countNum(row.id!);
  emit("getIdiomContent", row.phraseContent);
};
const searchHandle = (status: string): Promise<void> => {
  return new Promise((resolve) => {
    searchParamsModel.searchParams = [
      ...searchModel.value,
      { key: "isPublish", value: status, match: "eq" },
    ];
    if (status === "0") {
      searchParamsModel.searchParams.push({
        key: "userCode",
        value: username,
        match: "eq",
      });
    }
    searchParamsModel.pageParams.pageSize = -1;
    idiomService.list(searchParamsModel).then((res: Response) => {
      if (res.code == 200) {
        const { results } = res.data;
        resolve();
        if (results.length > 0) {
          results.forEach((item: PhraseEntity) => {
            tableData.value.push(item);
          });
        }
      }
    });
  });
};
const init = () => {
  tableData.value = [];

  searchHandle("0").then(() => {
    if (tableData.value.length <= 5) {
      proxy.mittBus.emit("updateIdiomContent" + props.nodeCode, tableData.value);
    }
    searchHandle("1").finally(() => {
      if (tableData.value.length >= 5) {
        proxy.mittBus.emit(
          "updateIdiomContent" + props.nodeCode,
          tableData.value.slice(0, 5)
        );
      }
    });
  });
};
init();
const save = () => {
  idiomService.save(dialog.formData).then((res) => {
    if (res.code === 200) {
      init();
      ElMessage.success(res.message);
    } else {
      ElMessage.error(res.message);
    }
  });
};
const jumpUpdate = (row: PhraseEntity) => {
  dialog.formData.id = row.id;
  dialog.formData.departmentCode = row.departmentCode;
  dialog.formData.operateCode = row.operateCode;
  dialog.formData.phraseContent = row.phraseContent;
  dialog.formData.phraseName = row.phraseName;
  dialog.formData.userCode = row.userCode;
  dialog.formData.isPublish = row.isPublish;
  tabValue.value = "update";
  tabStatus.value = true;
};
const deleteHandle = (id: string) => {
  ElMessageBox.confirm("确定要删除吗", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      idiomService.delete(id).then((res: Response) => {
        ElMessage({
          message: res.message,
          type: res.code == 200 ? "success" : "error",
        });
        if (res.code === 200) {
          init();
        }
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除",
      });
    });
};
const update = () => {
  if (dialog.formData.phraseContent === "") {
    ElMessage.error("惯用语内容不能为空！");
    return;
  }
  if (dialog.formData.id === "") {
    save();
  } else {
    idiomService.update(dialog.formData).then((res: Response) => {
      ElMessage({
        message: res.message,
        type: res.code == 200 ? "success" : "error",
      });
      if (res.code === 200) {
        init();
      }
    });
  }
};
</script>

<style scoped lang="scss">
.flexCenter {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.pagination {
  margin-top: 20px;
}
</style>
