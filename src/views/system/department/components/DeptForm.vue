<template>
  <div class="dept-add-box">
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-form
        ref="deptform"
        :model="props.formData"
        label-width="140px"
        :rules="rules"
        label-position="left"
        :inline="true"
        v-loading="state.loading"
      >
        <el-form-item label="部门名称" prop="departmentName">
          <el-input
            v-model.trim="props.formData.departmentName"
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="部门编码" prop="departmentCode">
          <el-input
            v-model.trim="props.formData.departmentCode"
            :disabled="props.action==='edit'"
            placeholder="请输入部门编码"
          ></el-input>
        </el-form-item>
        <el-form-item label="上级部门" prop="departmentParentCode">
          <el-tree-select
            v-model="props.formData.departmentParentCode"
            :data="props.deptList"
            :render-after-expand="false"
            :props="treeProps"
            node-key="departmentCode"
            value-key="departmentCode"
            check-strictly
            ref="deptParentTree"
            placeholder="选中左侧部门为上级"
            disabled
          />
        </el-form-item>
        <el-form-item label="部门层级" prop="departmentLevel">
          <el-input
            v-model.trim="props.formData.departmentLevel"
            placeholder="部门层级"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="部门类型" prop="departmentTag">
          <el-select
            v-model="props.formData.departmentType"
            placeholder="请选择"
            filterable
            >
            <!-- @change="emits('changeType',props.formData.departmentType)" -->
            <el-option
              v-for="item in types.deptTypes"
              :key="item.codeValue"
              :label="item.codeName"
              :value="item.codeNote"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门标签" prop="departmentTag">
          <el-select
            v-model="props.formData.departmentTags"
            placeholder="请选择部门标签"
            filterable
            multiple
          >
            <!-- <el-option
              v-for="item in types.deptTypes"
              :key="item.codeValue"
              :label="item.codeName"
              :value="item.codeNote"
            ></el-option> -->
          </el-select>
        </el-form-item>
        <el-form-item label="部门首页" prop="homeUrl">
          <el-input v-model.trim="props.formData.homeUrl" placeholder="部门首页"></el-input>
        </el-form-item>
        <el-form-item
          label="部门标识"
          prop="departmentMark"
          :error="props.tagFlag && !props.formData.departmentMark ? '请输入部门标识' : ''"
        >
          <el-input
            v-model.trim="props.formData.departmentMark"
            placeholder="请输入部门标识"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item
          label="部门分组"
          prop="departmentGroup"
          v-if="props.formData.departmentLevel == 2"
        >
          <el-select v-model="props.formData.departmentGroup" placeholder="请选择部门分组">
            <el-option
              v-for="item in groupTypes"
              :key="item.codeValue"
              :label="item.codeName"
              :value="item.codeValue"
            ></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="部门全称" prop="departmentShortName">
          <el-input
            v-model="props.formData.departmentShortName"
            placeholder="请输入部门全称"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactNumber">
          <el-input
            v-model.trim.number="props.formData.contactNumber"
            placeholder="请输入联系电话"
            maxlength="11"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input
            v-model.trim="props.formData.contactPerson"
            placeholder="请输入联系人"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input
            v-model.number.trim="props.formData.sort"
            placeholder="请输入排序"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="sort">
          <el-switch v-model="props.formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <br />
      </el-form>
    </el-scrollbar>
  </div>
</template>
<script lang="ts" setup>
import { isEqual } from "lodash-es";
// import { useCode } from "@/hooks/useCode";
import { reactive, ref, watch } from "vue";
import { DepartmentModel } from "@/api/model/departmentModel";
import { DepartmentService } from "@/api/service/System/DepartmentService";
import { useCode } from "@/hooks/useCode";

// const { districtTypes, groupTypes, authTypes } = useCode();
const departmentServer = new DepartmentService();
const deptParentTree: any = ref(null);
const deptform: any = ref(null);

const props = withDefaults(
  defineProps<{
    formData: DepartmentModel;
    action: string;
    submit: boolean;
    tagFlag: boolean;
    deptList: Array<DepartmentModel>;
  }>(),
  {
    action: "add",
    submit: false,
    tagFlag: false,
  }
);
const { types } = useCode()

const rules = reactive({
  // departmentCode: [
  //   { required: true, validator: checkCode, trigger: "blur", pattern: /^\w+$/ },
  // ],
  departmentName: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
  departmentCode: [{ required: true, message: "请输入部门编码", trigger: "blur" }],
  departmentParentCode: [
    { required: true, message: "请选择左侧部门为上级部门", trigger: "blur" },
  ],
  departmentLevel: [
    { required: true, message: "请选择左侧部门为上级部门", trigger: "blur" },
  ],
});
const emits = defineEmits(["changeAction", "onSubmit", "changeSubmit", "changeType"]);

const treeProps = {
  label: "departmentName",
  value: "departmentCode",
  children: "childs",
};
const state = reactive({
  loading: false as any,
  deptCode: "" as any,
  typeArr: [
    { code: 1, name: "类型1" },
    { code: 2, name: "类型2" },
  ] as any,
  groupArr: [
    { code: 1, name: "分组1" },
    { code: 2, name: "分组2" },
  ] as any,
  deptList: [] as Array<DepartmentModel>,
  form: {} as any,
  dictionaryType: [] as any,
});

watch(
  () => props.submit,
  (val) => {
    if (val) {
      deptform.value.validate((valid: any, fields: any) => {
        if (valid) {
          emits("onSubmit")
        } else {
          emits("changeSubmit", false);
        }
      });
    }
  },
  {
    deep: true,
  }
);
</script>
<style lang="scss" scoped>
.dept-add-box {
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;

  .el-form {
    display: flex;
    margin-top: 0em;
    padding: 10px;
    min-width: 400px;
    flex-wrap: wrap;
    overflow: auto;
    box-sizing: border-box;

    // height: 100%;
    // overflow: auto;
    & > :first-child {
      width: 300px;
    }

    ::v-deep(.el-form-item) {
      display: flex;
      flex-direction: column;
      width: 45%;
    }
    ::v-deep(.el-form-item:nth-of-type(2n)) {
      margin-right: 0;
    }

    ::v-deep(.el-form-item.fill) {
      width: 100%;
    }

    ::v-deep(.el-form-item__content) {
      margin-left: 0px !important;
    }

    ::v-deep(.el-form-item__label) {
      color: var(--lt-label-form-color);
    }

    ::v-deep(.el-input) {
      color: #414951;
    }
  }

  .btns {
    width: 100%;
    flex-direction: row-reverse;
    margin-bottom: 0;
    height: 50px;
    position: absolute;
    bottom: 0;
    display: flex;
  }

  .okbtn {
    width: 90px;
    height: 32px;
    border-radius: 2px;
    padding: 0px;
    margin-right: 20px;
  }
}
</style>
