<template>
  <el-dialog :model-value="props.dialogVisible" :title="props.title" width="50%" @close="handleClose" custom-class="card-mark">
    <div class="content">
      <div class="left">
        <div class="title">基础信息</div>
        <el-form ref="deptform" :model="editform" label-width="120px" :rules="editRules" label-position="right"
          :inline="true">
          <!-- <el-form-item label="角色编号:" prop="roleId">
        <el-input v-model.trim="props.editform.roleId" placeholder="请输入角色编号" disabled></el-input>
      </el-form-item> -->
          <el-row>
            <el-form-item label="角色名称:" prop="rolename">
              <el-input v-model.trim="props.editform.rolename" placeholder="请输入角色名称"></el-input>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="角色排序:" prop="sort">
              <el-input v-model.trim="props.editform.sort" placeholder="请输入角色序号"></el-input>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="备注:" prop="remark">
              <el-input v-model.trim="props.editform.remark" placeholder="请输入备注"></el-input>
            </el-form-item>
          </el-row>
          <el-row>
            <el-form-item label="是否启用:" prop="status">
              <el-switch v-model="props.editform.status" :active-value="1" :inactive-value="0"></el-switch>
            </el-form-item>
          </el-row>
        </el-form>
      </div>
      <div class="right">
        <div class="title">用户权限设置</div>
        <div class="tree_container">
          <div class="tree">
            <el-tree :data="props.perData" :props="defaultProps" @check="handleNodeClick" show-checkbox ref="treeRef"
              class="treeClass" :default-expand-all="true" node-key="permissionID" />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="save"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import type { FormRules } from "element-plus";
import { PermissionModel } from "@/api/model/permissionModel";
import { PermissionService } from "@/api/service/System/PermissionService";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { tranListTotreeList } from "@/utils/toTree";
import { cloneDeep } from "lodash-es";
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
interface Props {
  dialogVisible?: boolean;
  editform?: any;
  title: string
  perData?: Array<any>
  rolePerData: Array<any>
}
const props = withDefaults(defineProps<Props>(), {
  dialogVisible: false,
  editform: {
    roleId: "",
    rolename: "",
    sort: 0,
    remark: "",
    status: 1,
  },
  perData: [] as any,
  // rolePerData:[] as any
});
const data = reactive({
  checkPerData: [] as any,
})
const treeData = ref<Tree[]>([]);
interface Tree extends PermissionModel {
  children?: Tree[];
}
const treeRef: any = ref();
const defaultProps = {
  label: "name",
  children: "children"
};
const deepAddDisabled = function (data: Tree[]) {
  const result: Tree[] = []
  data.forEach(tree => {
    if (tree.children && tree.children.length > 0) {
      tree.disabled = true;
      result.push(tree)
    } else {
      const children = deepAddDisabled(tree.children!)
      if (children!) {
        return children
      }
    }
  })
  return result
}
// 权限
// const sourceData = ref<PermissionModel[]>([]);
// const searchPerModel = ref<SearchModel<PermissionModel>[]>([new SearchModel()]);
// const searchPerParamsModel = reactive(new SearchParamsModel<PermissionModel>());
// const permissionSever = new PermissionService();
// const getPerAll = () => {
//   searchPerParamsModel.searchParams = searchPerModel.value;
//   searchPerParamsModel.pageParams.pageSize = -1;
//   permissionSever.list(searchPerParamsModel).then((res: Response) => {
//     if (res.code === 200) {
//       const { results } = res.data;
//       sourceData.value = results;
//       console.log(results)
//       const childrenData = tranListTotreeList(
//         cloneDeep(res.data.results),
//         "parentID",
//         "permissionID"
//       ).sort((a: PermissionModel, b: PermissionModel) => a.sort - b.sort)
//       treeData.value = [
//         {
//           id: "-1",
//           parentID: "-1",
//           name: "权限管理",
//           url: "",
//           icon: "",
//           nodeCode: "",
//           remark: "",
//           status: 0,
//           type: "",
//           tag: "",
//           openType: 0,
//           disabled: true,
//           sort: 1,
//           children: deepAddDisabled(childrenData),
//           permissionID: "",
//         },
//       ];
//     } else {
//       ElMessage.error(res.message);
//     }
//   });
// };
// getPerAll();

const emit = defineEmits(["close", "save"]);

const editRules = reactive<FormRules>({
  // roleId: [{ required: true, message: "角色编号为必填", trigger: "blur" }],
  rolename: [{ required: true, message: "角色名称为必填", trigger: "blur" }],
});
const save = () => {
  emit('save', props.title)
};
const handleClose = () => {
  emit("close", false);
};
const handleNodeClick = (node: Tree, type: boolean, leafType: boolean) => {
  // console.log('node', node.permissionID)
  // console.log('type', type)
  // console.log('leafType', leafType)
  const keys = [
    ...treeRef.value.getCheckedKeys(),
    ...treeRef.value.getHalfCheckedKeys()
  ]
  props.editform.permissionList = keys.filter(item => {
    return item && item.trim()
  })
  console.log('editform.permissionList', props.editform.permissionList)

}
const perDataChange = () => {
  if (props.title == "修改") {
    props.rolePerData.forEach((item: any) => {
      setTimeout(() => {
        treeRef.value.setChecked(item.permissionId, true, false);
      }, 100);
    })
  }
  // else {
  //   treeRef.value.setCheckedKeys([]);
  // }

}
perDataChange()
</script>
<style lang="scss" scoped>
.right {
  height: calc(100% - 50px);
}

.tree_container {
  height: 100%;
  position: relative;

  .tree {
    height: calc(100% - 70px);
  }
}
</style>