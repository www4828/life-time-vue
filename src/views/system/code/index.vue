<template>
  <Layout class="code">
    <template #search>
      <div class="header-search">
        <el-input placeholder="请输入内容" :prefix-icon="Search" v-model="keywords">
        </el-input>
      </div>
      <!--这是一个完美的分割线-->
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
          node-key="id"
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
            <el-button type="primary" :icon="Search" @click="searchHandle"
              >搜索</el-button
            >
            <el-button type="primary" :disabled="isCanAdd" :icon="Plus" @click="add"
              >添加</el-button
            >
          </el-col>
        </el-row>
      </div>
      <PageLayout>
        <template #table>
          <el-table :data="data.tableData" style="width: 100%" height="100%">
            <el-table-column prop="codeValue" align="center" label="字典编号" />
            <el-table-column prop="codeName" align="center" label="字典名称" />
            <el-table-column prop="status" align="center" label="是否启用">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status == '1' ? 'success' : 'danger'"
                  effect="plain"
                >
                  {{ scope.row.status == "1" ? "启用" : "停用" }}
                </el-tag>
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
import { useCode } from "@/hooks/useCode";
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
  } else if (data.type === 2) {
    return "dept";
  }
  return "";
};

const treeProps = {
  label: "codeName",
  children: "childs",
  class: customNodeClass,
};
const isCanAdd = ref(false);
const treeRef = ref<InstanceType<typeof ElTree>>();
const treeData = ref<CodeTreeModel[]>([]);
const treeInfo: any = reactive({
  id: "",
  codeType: "",
  codeParent: "",
  dictionaryType: "",
});
const keywords = ref("");
const data = reactive({
  tableData: [] as Array<CodeTreeModel>,
  showFlag: false,
  dialogVisible: false,
  dialogStatus: "添加",
  formData: {
    id: "",
    name: "",
    parentCode: "",
    typeCode: "",
    code: "",
    codeId: "",
    status: 1,
    sort: 1,
  } as CodeModel,
});
const searchModel = ref<SearchModel<CodeModel>[]>([
  {
    key: "name",
    value: "",
    match: "like",
  },
  {
    key: "parentCode",
    value: "",
    match: "eq",
  },
  {
    key: "sort",
    value: "sort",
    match: "orderByAsc",
  },
]);
const PARENT_CODE = "-1";
const TYPE_CODE = ref("");
const searchParamsModel = reactive(new SearchParamsModel<CodeModel>());
const codeService = new CodeService();
const nodeClick = (data: CodeTreeModel) => {
  searchModel.value[1].value = data.codeValue;
  TYPE_CODE.value = data.codeType;
  treeInfo.id = data.id!;
  treeInfo.codeParent = data.codeValue;
  treeInfo.codeType = data.codeType;
  treeInfo.dictionaryType = data.dictionaryType;
  isCanAdd.value = false;
  if (treeInfo.id === "1") {
    isCanAdd.value = true;
  }
  if (Array.isArray(data.childs) && data.childs!.length > 0) {
    getAll();
  }
};
const getCodeAgain = () => {
  sessionStorage.removeItem("allCode");
  useCode();
};
const showDialog = (row: CodeTreeModel) => {
  if (row.id) {
    data.dialogStatus = "修改";
    data.formData.codeId = treeInfo.id || "1";
    data.formData.id = row.id;
    data.formData.name = row.codeName;
    data.formData.code = row.codeValue;
    data.formData.typeCode = row.codeType;
    data.formData.parentCode = row.codeParent;
    data.formData.sort = row.sort;
    data.formData.status = row.status;
  } else {
    data.formData.name = "";
    data.formData.code = "";
    data.formData.sort = 1;
    data.formData.status = 1;
    data.formData.codeId = treeInfo.id || "1";
    data.formData.parentCode = treeInfo.codeParent || PARENT_CODE;
    data.formData.typeCode = treeInfo.codeType || PARENT_CODE;
  }
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
          treeRef.value!.remove(deleteData);
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
  params.dictionaryType = treeInfo.dictionaryType;
  if (params.parentCode === PARENT_CODE) {
    params.typeCode = params.code;
  }
  codeService.save(params).then((res: Response) => {
    ElMessage({
      message: res.message,
      type: res.code == 200 ? "success" : "error",
    });
    if (res.code === 200) {
      params.id = res.data.id;
      const tree = {
        id: res.data.id,
        codeName: res.data.name,
        codeParent: res.data.parentCode,
        codeType: res.data.typeCode,
        codeId: res.data.id,
        codeValue: res.data.code,
        childs: [],
        status: res.data.status,
        nextCode: res.data.nextCode,
        firstParam: res.data.firstParam,
        secondParam: res.data.secondParam,
        thirdParam: res.data.thirdParam,
        fourthParam: res.data.fourthParam,
      };
      getCodeAgain();
      searchHandle();
      closeDialog();
      treeRef.value!.append({ ...tree, childs: [] }, treeInfo.id);
      treeData.value.forEach((tree) => {
        if (tree.id === res.data.id) {
          tree.childs!.push({
            id: res.data.id,
            codeName: res.data.name,
            codeParent: res.data.parentCode,
            codeType: res.data.typeCode,
            codeId: res.data.id,
            codeValue: res.data.code,
            childs: [],
            status: res.data.status,
            nextCode: res.data.nextCode,
            firstParam: res.data.firstParam,
            secondParam: res.data.secondParam,
            thirdParam: res.data.thirdParam,
            fourthParam: res.data.fourthParam,
          });
        } else {
          tree.childs!.forEach((child) => {
            if (child.id === res.data.id) {
              child.childs!.push({
                id: res.data.id,
                codeName: res.data.name,
                codeParent: res.data.parentCode,
                codeType: res.data.typeCode,
                codeId: res.data.id,
                codeValue: res.data.code,
                childs: [],
                status: res.data.status,
                nextCode: res.data.nextCode,
                firstParam: res.data.firstParam,
                secondParam: res.data.secondParam,
                thirdParam: res.data.thirdParam,
                fourthParam: res.data.fourthParam,
              });
            }
          });
        }
      });
    }
  });
};
const deepSetValue = (data: CodeTreeModel[], name: string, id: string): void => {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.id === id) {
      item.codeName = name;
    } else {
      if (item.childs && item.childs.length > 0) {
        deepSetValue(item.childs!, name, id);
      }
    }
  }
};
// 更新
const updateHandle = (params: CodeModel) => {
  params.dictionaryType = treeInfo.dictionaryType;
  codeService.update(params).then((res: Response) => {
    ElMessage({
      message: res.message,
      type: res.code == 200 ? "success" : "error",
    });
    if (res.code === 200) {
      closeDialog();
      searchHandle();
      getCodeAgain();
      deepSetValue(treeData.value, params.name, params.id!);
    }
  });
};

// 关闭弹窗
const closeDialog = () => {
  data.showFlag = false;
  data.dialogStatus = "添加";
  data.formData = {
    id: "",
    name: "",
    codeNote: "",
    parentCode: "",
    typeCode: "",
    code: "",
    codeId: "",
    status: 1,
    sort: 1,
    codeClass: "",
    firstParam: "",
    secondParam: "",
    thirdParam: "",
    fourthParam: "",
  } as CodeModel;
};
const add = () => {
  if (treeInfo.id === "") {
    ElMessage.error("请先选择节点！");
    return;
  }
  showDialog({
    id: "",
    codeName: "",
    codeParent: "",
    codeType: "",
    codeValue: "",
    codeId: "",
    status: 1,
    sort: 1,
    nextCode: "",
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
  codeService.getTree().then((res: Response) => {
    if (res.code == 200) {
      treeData.value = [
        {
          codeName: "字典分类",
          codeParent: PARENT_CODE,
          codeType: "",
          codeValue: PARENT_CODE,
          codeId: "1",
          id: "1",
          childs: res.data,
          status: 1,
          nextCode: "",
          firstParam: "",
          secondParam: "",
          thirdParam: "",
          fourthParam: "",
        },
      ];
    } else {
      ElMessage.error(res.message);
    }
  });
};
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  if (searchModel.value[1].value !== PARENT_CODE) {
    searchParamsModel.searchParams = [
      ...searchModel.value,
      {
        key: "typeCode",
        value: TYPE_CODE.value,
        match: "eq",
      },
    ];
  }
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
  background-color: var(--sh3h-tree-background-color);
  // background: rgb(242, 242, 242);
}

::v-deep(.button) {
  margin: 0 !important;
  padding-bottom: 0 !important;
}
</style>
