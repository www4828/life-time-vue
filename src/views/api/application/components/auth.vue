<template>
  <el-dialog
    v-model="data.dialogVisible"
    title="授权"
    width="60%"
    @close="$emit('closeDialog')"
    destroy-on-close
    :close-on-click-modal="false"
    class="card-mark"
  >
    <div class="content user-mark">
      <div class="left">
        <div class="tree">
          <ApiGroupTree
            :showSearch="false"
            :showLine="false"
            :treeJson="{ type: apiGroupSever }"
            ref="apiTree"
            @handleNodeClick="handleNodeClick"
          />
        </div>
        <Title title="接口列表" style="width: 65%">
          <template #content>
            <el-table
              :data="
                data.interfaceData.filter(
                  (i) =>
                    data.tableData
                      .map((ele) => ele.apiBaseInfo.apiCode)
                      .indexOf(i.apiBaseInfo.apiCode) < 0,
                )
              "
              style="width: 100%"
              height="100%"
              :header-cell-style="{ 'text-align': 'center' }"
              :cell-style="{ 'text-align': 'center' }"
            >
              <el-table-column
                prop="apiBaseInfo.apiName"
                align="center"
                label="接口名称"
                show-overflow-tooltip
              />
              <el-table-column
                prop="apiBaseInfo.apiUrl"
                align="center"
                label="接口路径"
                show-overflow-tooltip
              />
              <el-table-column label="操作" min-width="100px">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    :icon="ArrowRightBold"
                    @click="rightHandle(row)"
                  ></el-button>
                  <!-- v-if="!data.tableData.some(i=> i.apiBaseInfo.apiCode === row.apiBaseInfo.apiCode)" -->
                </template>
              </el-table-column>
            </el-table>
          </template>
        </Title>
      </div>
      <div class="right">
        <Title title="已授权API">
          <template #content>
            <el-table
              :data="data.tableData"
              style="width: 100%"
              height="100%"
              :header-cell-style="{ 'text-align': 'center' }"
              :cell-style="{ 'text-align': 'center' }"
            >
              <el-table-column
                prop="apiBaseInfo.apiName"
                align="center"
                label="接口名称"
                show-overflow-tooltip
              />
              <el-table-column
                prop="apiBaseInfo.apiUrl"
                align="center"
                label="接口路径"
                show-overflow-tooltip
              />
              <el-table-column label="操作" min-width="100px">
                <template #default="scope">
                  <el-link
                    type="danger"
                    :underline="false"
                    @click="deleteHandle(scope.$index)"
                  >
                    删除</el-link
                  >
                </template>
              </el-table-column>
            </el-table>
          </template>
        </Title>
      </div>
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
import Title from "@/components/Title/Title.vue";
import { ArrowRightBold } from "@element-plus/icons-vue";
import { useCode } from "@/hooks/useCode";
import { cloneDeep, debounce } from "lodash-es";
import ApiGroupTree from "@/businessComponent/tree/index.vue";
import {
  ApiGroupService,
  ApiInfoService,
  AppService,
} from "@/api/service/Api/ApiService";
import { ApiModel, AppModel } from "@/api/model/apiModel";
import { ElMessage } from "element-plus";

const { types } = useCode();
const apiGroupSever = new ApiGroupService();
const apiInfoSever = new ApiInfoService();
const appSever = new AppService();
const emits = defineEmits(["closeDialog", "update", "save"]);
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    default: {} as AppModel,
  },
});

const data = reactive({
  dialogVisible: false,
  createForm: {} as any,
  tableData: [] as ApiModel[],
  interfaceData: [] as ApiModel[],
});
const apiTree = ref();

const createData = () => {
  let keys = data.tableData.map((i) => i.apiBaseInfo.apiCode)?.join(",") || "";
  let params = cloneDeep(props.formData) as AppModel;
  params.apiCodes = keys;
  appSever.update(params.id!, params).then((res) => {
    ElMessage({
      type: res.code == 200 ? "success" : "error",
      message: res.message,
    });
    emits("closeDialog");
  });
};

const rightHandle = debounce((row: ApiModel) => {
  data.tableData.push(row);
});
const deleteHandle = (index: number) => {
  data.tableData.splice(index, 1);
};
const searchHandle = () => {
  apiInfoSever
    .list({
      pageParams: { pageIndex: 0, pageSize: -1 },
      searchParams: [
        { key: "apiCode", match: "in", value: props.formData?.apiCodes },
      ],
    })
    .then((res) => {
      data.tableData = res.data.results;
    });
};
const handleNodeClick = (node: any) => {
  apiInfoSever
    .list({
      pageParams: { pageIndex: 0, pageSize: -1 },
      searchParams: [
        {
          key: "groupCode",
          match: "eq",
          value: node.code == "1000" ? "" : node.code,
        },
        {
          key: "isPublish",
          match: "eq",
          value: "1",
        },
      ],
    })
    .then((res) => {
      data.interfaceData = res.data.results;
    });
};

const init = () => {
  if (props.formData?.apiCodes) {
    searchHandle();
  } else {
    data.tableData = [];
  }
};

watch(
  () => props.showFlag,
  (newValue, oldValue) => {
    data.dialogVisible = newValue;
    if (newValue) {
      init();
      handleNodeClick({ code: "" });
    } else {
      data.tableData = [];
      data.interfaceData = [];
    }
  },
);
</script>
<style lang="scss" scoped>
.left {
  display: flex;
}
.tree {
  width: 30%;
  height: 100%;
  margin-right: 10px;
}
.table {
  width: 70%;
}

.el-form {
  .long_item {
    width: 100%;
  }
}
</style>
