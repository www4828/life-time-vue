<template>
  <Layout>
    <template #search>
      <div class="header-search">
        <el-input placeholder="请输入内容" :prefix-icon="Search" v-model="keywords">
        </el-input>
      </div>
      <!--这是一个完美的分割线-->
      <div class="split-line"></div>
    </template>
    <template #tree>
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
    </template>
    <template #button>
      <el-button type="primary" @click="addChildren">新增下级</el-button>
      <el-button
        type="danger"
        @click="deletePermission"
        :disabled="form.parentID === '-1'"
        >删除</el-button
      >
    </template>
    <template #content>
      <el-form
        ref="authForm"
        :model="form"
        label-position="left"
        label-width="140px"
        :rules="rules"
        inline
        :disabled="form.parentID === '-1'"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="父级编码" prop="parentID">
              <el-input v-model="form.parentID" disabled> </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="权限类型" prop="type">
              <el-select v-model="form.type" placeholder="权限类型">
                <el-option
                  v-for="item in roleOption"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="权限名称" prop="name">
              <el-input v-model.trim="form.name" maxlength="20"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="环节编码" prop="nodeCode">
              <el-input v-model.trim="form.nodeCode" maxlength="20"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="权限地址" prop="url">
              <el-input v-model.trim="form.url"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="form.type === '1'">
            <el-form-item label="图标" prop="icon">
              <IconSelect @change="handleChange" :value="form.icon" class="w100" />
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="form.type === '1'">
            <el-form-item label="打开方式" prop="openType">
              <el-select v-model="form.openType" placeholder="打开方式">
                <el-option
                  v-for="item in openTypeOption"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序" prop="sort">
              <el-input
                v-model.trim="form.sort"
                maxlength="5"
                @input="valChange"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否启用" prop="status">
              <el-switch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="form.remark"
                :rows="2"
                type="textarea"
                placeholder="备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </template>
    <template #bottom>
      <div class="btnGroup">
        <el-button type="success" @click="submitForm(authForm)" class="save"
          >保存</el-button
        >
        <el-button @click="cancel" class="cancel">取消</el-button>
      </div>
    </template>
  </Layout>
</template>
<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import type { FormRules, FormInstance } from "element-plus";
import { ElMessage, ElTree, ElMessageBox, ElForm } from "element-plus";
import type Node from "element-plus/es/components/tree/src/model/node";
import Layout from "@/components/Layout/Layout.vue";
import IconSelect from "@/components/iconSelect/index.vue";
import { PermissionModel } from "@/api/model/permissionModel";
import { PermissionService } from "@/api/service/System/PermissionService";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { tranListTotreeList } from "@/utils/toTree";
import { cloneDeep } from "lodash-es";

interface Tree extends PermissionModel {
  children?: Tree[];
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
  label: "name",
  children: "children",
  class: customNodeClass,
};
const roleOption = [
  { label: "菜单", value: "1" },
  /*  { label: "按钮", value: "2" }, */
];
const openTypeOption = [
  { label: "路由", value: 0 },
  { label: "iframe打开", value: 1 },
  { label: "弹框", value: 2 },
  { label: "新窗口", value: 3 },
];
const treeRef = ref<InstanceType<typeof ElTree>>();
const authForm = ref<InstanceType<typeof ElForm>>();
const keywords = ref("");
const parentId = ref("");
const sourceData = ref<PermissionModel[]>([]);
const treeData = ref<Tree[]>([]);
const rules = reactive<FormRules>({
  name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
  nodeCode: [{ required: true, message: "环节编码不能为空", trigger: "blur" }],
  url: [{ required: true, message: "权限地址不能为空", trigger: "blur" }],
});

const searchModel = ref<SearchModel<PermissionModel>[]>([new SearchModel()]);
const searchParamsModel = reactive(new SearchParamsModel<PermissionModel>());
const permissionSever = new PermissionService();
const form = reactive<PermissionModel>({
  id: "",
  parentID: "",
  name: "",
  url: "",
  icon: "",
  nodeCode: "",
  remark: "",
  status: 1,
  type: "1",
  tag: "",
  openType: 0,
  sort: 1,
  permissionID: "",
});
const nodeClick = (data: Tree) => {
  form.id = data.id;
  form.parentID = parentId.value = data.parentID;
  form.name = data.name;
  form.url = data.url;
  form.icon = data.icon;
  form.nodeCode = data.nodeCode;
  form.remark = data.remark;
  form.status = data.status;
  form.type = data.type;
  form.tag = data.tag;
  form.openType = data.openType;
  form.sort = data.sort;
};
const filterNode = (value: string, data: any): boolean => {
  if (!value) return true;
  return data.name.includes(value);
};
const valChange = (value: string) => {
  form.sort = Number(value.replace(/\D/g, ""));
};
const addChildren = () => {
  if (parentId.value === "") {
    ElMessage.error("请选择节点后再添加！");
    return;
  }
  const id = treeRef.value!.getCurrentKey();
  if (id === "-1") {
    form.parentID = "1";
  } else {
    form.parentID =
      sourceData.value.find((data: PermissionModel) => data.id === id)!.permissionID ||
      "";
  }
  form.id = "";
  form.name = "";
  form.url = "";
  form.icon = "";
  form.nodeCode = "";
  form.remark = "";
  form.status = 1;
  form.type = "1";
  form.tag = "";
  form.openType = 0;
  form.sort = 1;
};
const handleChange = (val: string) => {
  form.icon = val;
};
const reset = () => {
  form.id = "";
  form.parentID = "";
  form.name = "";
  form.url = "";
  form.icon = "";
  form.nodeCode = "";
  form.remark = "";
  form.status = 1;
  form.type = "1";
  form.tag = "";
  form.openType = 0;
  form.sort = 1;
};
const reload = () => {
  reset();
  getAll();
};
const cancel = () => {
  reload();
  authForm.value!.clearValidate();
};
const deletePermission = () => {
  if (form.parentID === "-1") {
    ElMessage.error("根节点无法删除！");
    return;
  }
  if (form.id === "") {
    ElMessage.error("请选择一个节点删除！");
    return;
  }
  const tree = treeRef.value;
  const currentData = tree!.getCurrentNode();
  if (currentData.children.length > 0) {
    ElMessage.error("请先删除子节点!");
    return;
  }
  ElMessageBox.confirm("确定要删除吗？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      permissionSever.delete(form.id!).then((res: Response) => {
        if (res.code === 200) {
          ElMessage.success("删除成功!");
          tree!.remove(currentData);
        } else {
          ElMessage.error(res.message);
        }
      });
    })
    .finally(() => {
      reset();
    });
};
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = -1;
  permissionSever.list(searchParamsModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data;
      sourceData.value = results;
      const childrenData = tranListTotreeList(
        cloneDeep(res.data.results),
        "parentID",
        "permissionID"
      ).sort((a: PermissionModel, b: PermissionModel) => a.sort - b.sort);
      treeData.value = [
        {
          id: "-1",
          parentID: "-1",
          name: "权限管理",
          url: "",
          icon: "",
          nodeCode: "",
          remark: "",
          status: 1,
          type: "0",
          tag: "",
          openType: 0,
          sort: 1,
          children: childrenData,
          permissionID: "",
        },
      ];
    } else {
      ElMessage.error(res.message);
    }
  });
};
const deepSetValue = (data: Tree[], form: PermissionModel): void => {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.id === treeRef.value!.getCurrentKey()) {
      item.name = form.name;
      item.url = form.url;
      item.icon = form.icon;
      item.nodeCode = form.nodeCode;
      item.openType = form.openType;
      item.sort = form.sort;
    } else {
      const children = deepSetValue(item.children!, form);
      if (children!) {
        return children;
      }
    }
  }
};
const save = () => {
  const tree = treeRef.value;
  if (form.id === "") {
    permissionSever.save(form).then((res: Response) => {
      if (res.code === 200) {
        ElMessage.success("新增成功!");
        form.id = res.data.id;
        sourceData.value.push(res.data);
        tree!.append({ ...form, children: [] }, tree!.getCurrentKey());
      } else {
        ElMessage.error(res.message);
      }
    });
  } else {
    permissionSever.update(form).then((res: Response) => {
      if (res.code === 200) {
        ElMessage.success("修改成功!");
        deepSetValue(treeData.value, form);
      } else {
        ElMessage.error(res.message);
      }
    });
  }
};
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      save();
    } else {
      console.log("error submit!", fields);
    }
  });
};
getAll();
watch(
  () => keywords.value,
  (keywords) => {
    treeRef.value!.filter(keywords);
  }
);
</script>

<style lang="scss" scoped>
.w100,
.tree-menu,
::v-deep(.el-form-item__content),
::v-deep(.el-select) {
  width: 100%;
}

::v-deep(.el-form) {
  .el-form-item {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}

.btnGroup {
  display: flex;
  justify-content: flex-end;
}

.treeRef {
  background-color: var(--sh3h-tree-background-color);
}

::v-deep(.el-tree-node__expand-icon:before) {
  background: url("@/assets/system/first.png") no-repeat;
  content: "";
  display: block;
  width: 13px;
  height: 13px;
  font-size: 13px;
  background-size: 13px;
}

::v-deep(.el-tree-node__expand-icon) {
  width: fit-content;

  svg {
    display: none;
  }
}
</style>
