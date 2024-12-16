<template>
  <div class="wrapper">
    <!-- <el-button @click="change">测试</el-button> -->
    <RoleLayout>
      <template #search>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="4">
              <span class="sh3h-search-lable ">角色名称:</span>
              <el-input class="sh3h-search-input"  v-model.trim="searchModel[0].value" />
            </el-col>
            <el-col :span="5">
              <span class="sh3h-search-lable div-flex-right">是否启用:</span>
              <el-select class="sh3h-search-input" v-model="searchModel[1].value" placeholder="请选择">
                <el-option label="请选择" value />
                <el-option label="启用" :value="1" />
                <el-option label="停用" :value="0" />
              </el-select>
            </el-col>
            <el-col :span="11"></el-col>
            <el-col :span="4" class="div-flex-right">
              <el-button type="primary" :icon="Search" @click="searchHandle">搜索</el-button>
              <el-button type="primary" :icon="Plus" @click="add" class="save">增加</el-button>
            </el-col>
          </el-row>
        </div>
      </template>
      <!-- <template #button>
       
        <el-button type="warning" @click="edit" class="save">修改</el-button>
        <el-button type="danger" @click="remove" class="save">删除</el-button>
      </template> -->
      <template #table>
        <!-- background: '#f2f7ff', -->
        <!-- @row-click="tableCheck" highlight-current-row -->
        <el-table :data="tableData.roleData" style="width:100%" height="100%"
          :header-cell-style="{ 'text-align': 'center', }" :cell-style="{ 'text-align': 'center' }">
          <el-table-column prop="rolename" label="角色名称" min-width="10%" />
          <el-table-column prop="rolePer" label="角色权限" show-overflow-tooltip min-width="60%" />
          <el-table-column prop="status" label="是否启用" min-width="5%">
            <template #default="scope">
              <el-tag v-if="scope.row.status" type="success">启用</el-tag>
              <el-tag v-else type="danger">停用</el-tag>
              <!-- <el-switch v-model="scope.row.status" disabled :active-value="1" :inactive-value="0" /> -->
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="15%">
            <template #default="scope">
              <ButtonGropup :row="scope.row" :list="tableData.buttonList" @dropdownClick="editHandle"
                @commandClick="commandClick" />
            </template>
          </el-table-column>
        </el-table>
      </template>

    </RoleLayout>

    <EditDialog v-if="dialogState.EditDialog" :dialogVisible="dialogState.EditDialog" @close="editCloseDialog"
      :editform="editform" :title="dialogState.titleName" :perData="treeData" :rolePerData="tableData.rolePerTreeDatas"
      @save="dialogSave">
    </EditDialog>
    <!-- <Dialog v-if="dialog.Dialog" :dialogVisible="dialog.Dialog" :form="dialog.form" :tableData="dialog.tableData" :formType="dialog.type">
    </Dialog> -->
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus, Setting, RefreshLeft } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
import EditDialog from "./components/EditDialog.vue";
import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import { RoleModel } from "@/api/model/roleModel";
import { PermissionModel } from "@/api/model/permissionModel";
import { RoleService } from "@/api/service/System/RoleService";
import { PermissionService } from "@/api/service/System/PermissionService";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { tranListTotreeList } from "@/utils/toTree";
import { cloneDeep } from "lodash-es";
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'

// import Dialog from "./components/dialog.vue";
// const dialog = reactive({
//   Dialog: false as boolean,
//   form:{
//     name:"1"
//   },
//   tableData:[
//     {name:'1'}
//   ],
//   // type:"甄别"
//   type:"先联"
// });
// const change = () => {
//   dialog.Dialog = true
// }

// 角色
const searchParamsModel = reactive(new SearchParamsModel<RoleModel>());
const roleSever = new RoleService();

//权限
const sourceData = ref<PermissionModel[]>([]);
const searchPerModel = ref<SearchModel<PermissionModel>[]>([new SearchModel()]);
const searchPerParamsModel = reactive(new SearchParamsModel<PermissionModel>());
const permissionSever = new PermissionService();

// 角色权限
const searchRolePerModel = reactive(new SearchParamsModel<RoleModel>());

//
const tableData = reactive({
  roleData: [] as Array<any>,
  rolePerTreeData: [] as Array<any>,
  rolePerTreeDatas: [] as Array<any>,
  buttonList: [
    { name: "修改", id: "" },
    { name: "删除", id: "" }
  ],
});
const editform = reactive({
  roleId: "",
  rolename: "",
  sort: 0,
  remark: "",
  status: 1,
  id: "",
  permissionId: "",
  permissionList: [],
});

// 角色
const searchModel = ref<SearchModel<RoleModel>[]>([
  {
    key: "rolename",
    value: '',
    match: "like",
  },
  {
    key: "status",
    value: '',
    match: "like",
  },
  {
    key: "sort",
    value: 'sort',
    match: "orderByDesc",
  },
]);
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = -1;
  roleSever.list(searchParamsModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data;
      results.forEach((item: any) => {
        var arr = item.permissionVos.map((itemI: any) => {
          var childArr = itemI.childs.map((items: any) => {
            return items.name
          })
          return itemI.name + '(' + childArr.join('、') + ')'
        })
        item.rolePer = arr.join(',')
      })
      tableData.roleData = results;
      console.log('results', results)
    } else {
      ElMessage.error(res.message);
    }
  });
};
getAll();
const searchHandle = () => {
  getAll();
};
const tableCheck = (row: any) => {
  editform.roleId = row.roleId;
  editform.rolename = row.rolename;
  editform.sort = row.sort;
  editform.remark = row.remark;
  editform.status = row.status;
  editform.id = row.id;
  rolePerTree(row.roleId);
};

// 弹框
const dialogState = reactive({
  titleName: "" as string,
  EditDialog: false as boolean,
  QXDialog: false as boolean,
});
const add = () => {
  dialogState.EditDialog = true;
  dialogState.titleName = "添加";
  editform.roleId = "";
  editform.rolename = "";
  editform.sort = 0;
  editform.remark = "";
  editform.status = 1;
  editform.id = "";
};
const editCloseDialog = () => {
  dialogState.EditDialog = false;
};
const edit = () => {
  if (editform.id) {
    dialogState.EditDialog = true;
    dialogState.titleName = "修改";
    console.log('props.rolePerData', tableData.rolePerTreeDatas)
  } else {
    ElMessage.info("请选择需要修改的角色");
  }
};
const editHandle = (row: any) => {
  editform.roleId = row.roleId;
  editform.rolename = row.rolename;
  editform.sort = row.sort;
  editform.remark = row.remark;
  editform.status = row.status;
  editform.id = row.id;
  searchRolePerModel.searchParams = [
    {
      key: "roleId",
      value: row.roleId,
      match: "eq",
    },
  ];
  searchRolePerModel.pageParams.pageSize = -1;
  roleSever.listPer(searchRolePerModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data;
      if (results.length > 0) {
        tableData.rolePerTreeDatas = results;
        editform.permissionList = results.map((item: any) => {
          return item.permissionId
        })
      } else {
        tableData.rolePerTreeDatas = []
        editform.permissionList = []
      }
      dialogState.EditDialog = true;
      dialogState.titleName = "修改";
    }
  });
}
const commandClick = (command: string, row: any) => {
  ElMessageBox.confirm("确定要删除吗？", "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      roleSever.delete(row.id!).then((res: Response) => {
        if (res.code === 200) {
          roleSever.deleteRolePer(row.roleId).then((reponse: Response) => {
            if (reponse.code === 200) {
              ElMessage.success(reponse.message);
              getAll();
            }
          });
        } else {
          ElMessage.error(res.message);
        }
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消！",
      });
    });
}
const dialogSave = (type: string, data: any) => {
  // console.log('type', type)
  // console.log('form', form)
  roleSever.save(editform).then((res: Response) => {
    if (res.code === 200) {
      ElMessage.success(res.message);
      getAll();
      editCloseDialog();
    } else {
      ElMessage.error(res.message);
    }
  });
};
const remove = () => {
  if (editform.id) {
    ElMessageBox.confirm("确定要删除吗？", "删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        roleSever.delete(editform.id!).then((res: Response) => {
          if (res.code === 200) {
            roleSever.deleteRolePer(editform.roleId).then((reponse: Response) => {
              if (reponse.code === 200) {
                ElMessage.success(reponse.message);
                getAll();
              }
            });
          } else {
            ElMessage.error(res.message);
          }
        });
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "取消！",
        });
      });
  } else {
    ElMessage.info("请选择需要删除的角色");
  }
};
const deepAddDisabled = function (data: Tree[]) {
  const result: Tree[] = []
  data.forEach(tree => {
    if (tree.children && tree.children.length > 0) {
      tree.disabled = true;
      result.push(tree)
    } else {
      tree.disabled = false;
      result.push(tree)
    }
    // else {
    //   const children = deepAddDisabled(tree.children!)
    //   if (children!) {
    //     return children
    //   }
    // }
  })
  return result
}
// 权限
const getPerAll = () => {
  searchPerParamsModel.searchParams = searchPerModel.value;
  searchPerParamsModel.pageParams.pageSize = -1;
  permissionSever.list(searchPerParamsModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data;
      sourceData.value = results;
      
      const childrenData = tranListTotreeList(
        cloneDeep(res.data.results),
        "parentID",
        "permissionID"
      ).sort((a: PermissionModel, b: PermissionModel) => a.sort - b.sort)
      treeData.value = [
        {
          id: "-1",
          parentID: "-1",
          name: "权限管理",
          url: "",
          icon: "",
          nodeCode: "",
          remark: "",
          status: 0,
          type: "",
          tag: "",
          openType: 0,
          disabled: true,
          sort: 1,
          children: deepAddDisabled(childrenData),
          permissionID: "",
        },
      ];
      console.log(treeData.value)
    } else {
      ElMessage.error(res.message);
    }
  });
};
getPerAll();

// 角色权限
const defaultProps = {
  label: "name",
  children: "children"
};
const treeData = ref<Tree[]>([]);
interface Tree extends PermissionModel {
  children?: Tree[];
}
const treeRef: any = ref();
const rolePerTree = (id: string) => {
  searchRolePerModel.searchParams = [
    {
      key: "roleId",
      value: id,
      match: "eq",
    },
  ];
  searchRolePerModel.pageParams.pageSize = -1;
  roleSever.listPer(searchRolePerModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data;
      if (results.length > 0) {
        tableData.rolePerTreeDatas = results;
      }
    } else {
      ElMessage.error(res.message);
    }
  });
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
}

.sh3h-search-box {
  background-color: var(--sh3h-tree-background-color);
  margin: 0;
  // border: 1px solid var(--sh3h-tree-border-color);
}

::v-deep(.button) {
  margin: 0 !important;
}

::v-deep(.el-dropdown-menu__item) {
  width: 100% !important;
}
</style>
