<template>
  <Layout class="code">
    <template #search>
      <div class="header-search">
        <el-input placeholder="请输入内容" :prefix-icon="Search" v-model="keywords">
        </el-input>
      </div>
      <div class="split-line"></div>
    </template>
    <template #tree>
      <div class="tree">
        <el-tree
          ref="treeRef"
          :props="treeProps"
          :data="treeData"
          class="treeRef"
          highlight-current
          node-key="code"
          :filter-node-method="filterNode"
          @node-click="nodeClick"
        />
      </div>
    </template>
    <template #content>
      <div class="sh3h-search-box div-flex-column">
        <el-row>
          <el-col :span="5">
            <span class="sh3h-search-lable div-flex-right">字典名称:</span>
            <el-input class="sh3h-search-input" v-model.trim="searchModel[0].value" />
          </el-col>
          <el-col :span="5"> </el-col>
          <el-col :span="5"> </el-col>
          <el-col :span="5"> </el-col>
          <el-col :span="4" class="div-flex-right">
            <el-button type="primary" :icon="Search" @click="searchHandle">搜索</el-button>
            <el-button type="primary" :icon="Plus" @click="add">添加</el-button>
          </el-col>
        </el-row>
      </div>
      <PageLayout>
        <template #table>
          <el-table :data="data.tableData" style="width: 100%" height="100%">
            <el-table-column prop="codeValue" align="center" label="字典编号" />
            <el-table-column prop="codeName" align="center" label="字典名称" />
            <el-table-column prop="status" align="center" label="状态">
              <template #default="scope">
                <el-tag type="success" v-if="scope.row.status == 1"> 启用</el-tag>
                <el-tag type="danger" v-else-if="String(scope.row.status) === '0'">停用</el-tag>
                <el-tag type="warning" v-else>禁止删除</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="codeType" align="center" label="类型编号" />
            <el-table-column align="center" label="操作">
              <template #default="scope">
                <el-button type="warning" plain @click="showDialog(scope.row)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  plain
                  @click="deleteHandle(scope.row.id, scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template #pagination>
          <Pagination
            :currentPage="searchParamsModel.pageParams.pageIndex"
            :pageSize="searchParamsModel.pageParams.pageSize"
            :total="searchParamsModel.pageParams.total"
            :callBack="paginationChange"
          />
        </template>
      </PageLayout>
      <Dialog
        :showFlag="data.showFlag"
        :formData="data.formData"
        :dialogStatus="data.dialogStatus"
        @closeDialog="closeDialog"
        @update="updateHandle"
        @save="saveHandle"
        :treeData="treeData"
      />
    </template>
  </Layout>
</template>
<script lang="ts" setup>
import Layout from "@/components/Layout/Layout-v2.vue";
import PageLayout from "@/businessComponent/pageLayout/index.vue";
import Pagination from "@/components/pagination/index.vue";
import { Plus, Search } from "@element-plus/icons-vue";
import { ref, reactive, watch } from "vue";
import { Response, SearchParamsModel } from "@/api/interface";
import { ElMessage, ElTree, ElMessageBox } from "element-plus";
import type Node from "element-plus/es/components/tree/src/model/node";
import { SearchModel } from "@/api/model/baseModel";
import { CodeModel, CodeTreeModel } from "@/api/model/codeModel";
import { CodeService } from "@/api/service/System/CodeService";
import Dialog from "./components/dialog.vue";
import CodeTree from '@/businessComponent/tree/index.vue'
import { cloneDeep } from "lodash-es";
interface PageInfo {
  currentPage: number;
  pageSize: number;
}
interface Tree extends CodeTreeModel {
  childs?: Tree[];
}
const customNodeClass = (data: any, node: Node) => {
  if (node.level === 1) {
    return "first";
  } else if (!data.child) {
    return "dept";
  }
  return "";
};

const treeProps = {
  label: "name",
  children: "child",
  class: customNodeClass,
};
const treeRef = ref<InstanceType<typeof ElTree>>();
const treeData = ref<CodeTreeModel[]>([]);

const keywords = ref("");
const data = reactive({
  tableData: [] as Array<CodeTreeModel>,
  showFlag: false,
  dialogVisible: false,
  dialogStatus: "添加",
  treeInfo: {} as CodeTreeModel,
  formData: {} as CodeModel,
});
const searchModel = ref<SearchModel<CodeModel>[]>([
  {
    key: "codeName",
    value: "",
    match: "like",
  },
  {
    key: "codeParent",
    value: "",
    match: "eq",
  },
  {
    key: "sort",
    value: "sort",
    match: "orderByAsc",
  },
]);
const PARENT_CODE = "0";
const TYPE_CODE = ref("");
const searchParamsModel = reactive(new SearchParamsModel<CodeModel>());
const codeService = new CodeService();
const nodeClick = (node: CodeTreeModel) => {
  searchModel.value[1].value = node.code === PARENT_CODE ? '' : node.code ;
  TYPE_CODE.value = node.type;
  data.treeInfo = cloneDeep(node)

  if (Array.isArray(node.child) && node.child!.length > 0) {
    getAll();
  }else{
    data.tableData = []
  }
};
const getCodeAgain = () => {
  sessionStorage.removeItem("allCode");
  // useCode();
};
const showDialog = (row: CodeModel) => {
  if (row.id) {
    data.dialogStatus = "修改";
    data.formData = cloneDeep(row)
  } else {
    data.formData.codeName = "";
    data.formData.codeValue = "";
    data.formData.sort = 1;
    data.formData.status = 1;
    data.formData.codeParent = data.treeInfo.code || PARENT_CODE;
    data.formData.codeType = data.treeInfo.type || PARENT_CODE;
  }
  console.log(data.formData);
  
  data.formData.firstParam = row.firstParam;
  data.formData.secondParam = row.secondParam;
  data.formData.thirdParam = row.thirdParam;
  data.formData.fourthParam = row.fourthParam;
  data.showFlag = true;
};
const deleteHandle = (id: string, deleteData: CodeModel) => {
  ElMessageBox.confirm("确定要删除吗", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      codeService.delete(id).then((res: Response) => {
        ElMessage({
          message: res.message,
          type: res.code == 200 ? "success" : "error",
        });
        if (res.code === 200) {
          searchHandle();
          getCodeAgain();
          treeRef.value!.remove({
            code: deleteData.codeValue,
            name: deleteData.codeName,
            type: deleteData.codeType,
          });
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
const searchHandle = () => {
  searchParamsModel.pageParams.pageIndex = 1;
  getAll();
};
const filterNode = (value: string, data: any): boolean => {
  if (!value) return true;
  return data.codeName.includes(value);
};
// 新增
const saveHandle = (params: CodeModel) => {
  params.codeType = params.codeType === PARENT_CODE ? params.codeValue : params.codeType 
  codeService.save(params).then((res: Response) => {
    ElMessage({
      message: res.message,
      type: res.code == 200 ? "success" : "error",
    });
    if (res.code === 200) {
      params.id = res.data.id;
      const tree = {
        name: params.codeName,
        type: params.codeType,
        code: res.data.codeValue,
        child: []
      };
      // getCodeAgain();
      searchHandle();
      closeDialog();
      treeRef.value!.append({ ...tree, childs: [] }, data.treeInfo.code);
      treeData.value.forEach((tree) => {
        if (tree.code === params.codeParent) {
          tree.child!.push({
            name: params.codeName,
            type: params.codeType,
            code: params.codeValue,
            child: []
          });
        } else {
          tree.child!.forEach((child) => {
            if (child.id === res.data.id) {
              child.child!.push({
                name: params.codeName,
                type: params.codeType,
                code: params.codeValue,
                child: []
              });
            }
          });
        }
      });
    }
  });
};
const deepSetValue = (data: CodeTreeModel[], name: string, code: string): void => {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.code === code) {
      item.name = name;
    } else {
      if (item.child && item.child.length > 0) {
        deepSetValue(item.child!, name, code);
      }
    }
  }
};
// 更新
const updateHandle = (params: CodeModel) => {
  codeService.update(params).then((res: Response) => {
    ElMessage({
      message: res.message,
      type: res.code == 200 ? "success" : "error",
    });
    if (res.code === 200) {
      closeDialog();
      searchHandle();
      getCodeAgain();
      deepSetValue(treeData.value, params.codeName, params.codeValue);
    }
  });
};

// 关闭弹窗
const closeDialog = () => {
  data.showFlag = false;
  data.dialogStatus = "添加";
  data.formData = {} as CodeModel;
};
const add = () => {
  if (data.treeInfo.code === "") {
    ElMessage.error("请先选择节点！");
    return;
  }
  showDialog({
    id: "",
    codeName: "",
    codeParent: "",
    codeType: "",
    codeValue: "",
    status: 1,
    sort: 1,
    firstParam: "",
    secondParam: "",
    thirdParam: "",
    fourthParam: "",
  });
};
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  getAll();
};
const getTree = () => {
  codeService.getTree({
    pageParams: {
      pageIndex: 0,
      pageSize: -1
    },
    searchParams: []
  }).then((res: Response) => {
    if (res.code == 200) {
      treeData.value = [
        {
          name: "字典分类",
          type: PARENT_CODE,
          code: PARENT_CODE,
          child: res.data
        },
      ];
    } else {
      ElMessage.error(res.message);
    }
  });
};
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  // if (searchModel.value[1].value !== PARENT_CODE) {
  //   searchParamsModel.searchParams = [
  //     ...searchModel.value,
  //     {
  //       key: "codeType",
  //       value: TYPE_CODE.value,
  //       match: "eq",
  //     },
  //   ];
  // }
  codeService.list(searchParamsModel).then((res: Response) => {
    if (res.code == 200) {
      const { results, pageInfo } = res.data;
      searchParamsModel.pageParams.total = pageInfo.total;
      data.tableData = results;
    } else {
      ElMessage.error(res.message);
    }
  });
};
getTree();
watch(
  () => keywords.value,
  (keywords) => {
    treeRef.value!.filter(keywords);
  }
);
</script>

<style lang="scss" scoped>
.sh3h-search-box {
  background-color: var(--lt-tree-background-color);
  // background: rgb(242, 242, 242);
}

::v-deep(.button) {
  margin: 0 !important;
  padding-bottom: 0 !important;
}
</style>
