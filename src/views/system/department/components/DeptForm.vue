<template>
  <div class="dept-add-box">
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-form
        ref="deptform"
        :model="state.form"
        label-width="140px"
        :rules="rules"
        label-position="left"
        :inline="true"
        v-loading="state.loading"
      >
        <el-form-item label="部门名称" prop="departmentName">
          <el-input
            v-model.trim="state.form.departmentName"
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="上级部门" prop="departmentParentCode">
          <el-tree-select
            v-model="state.form.departmentParentCode"
            :data="props.deptList"
            :render-after-expand="false"
            :props="treeProps"
            node-key="departmentCode"
            value-key="departmentCode"
            check-strictly
            @change="deptParentChange"
            ref="deptParentTree"
            placeholder="选中左侧部门为上级"
            disabled
          />
        </el-form-item>
        <el-form-item label="部门层级" prop="departmentLevel">
          <el-input
            v-model.trim="state.form.departmentLevel"
            placeholder="部门层级"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="部门标签" prop="departmentTag">
          <el-select
            v-model="state.form.departmentTags"
            placeholder="请选择部门标签"
            filterable
            multiple
          >
            <el-option
              v-for="item in state.dictionaryType"
              :key="item.id"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门首页" prop="homeUrl">
          <el-input v-model.trim="state.form.homeUrl" placeholder="部门首页"></el-input>
        </el-form-item>
        <el-form-item
          label="部门标识"
          prop="departmentMark"
          :error="props.tagFlag && !state.form.departmentMark ? '请输入部门标识' : ''"
        >
          <el-input
            v-model.trim="state.form.departmentMark"
            placeholder="请输入部门标识"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="部门分组"
          prop="departmentGroup"
          v-if="state.form.departmentLevel == 2"
        >
          <el-select v-model="state.form.departmentGroup" placeholder="请选择部门分组">
            <el-option
              v-for="item in groupTypes"
              :key="item.codeValue"
              :label="item.codeName"
              :value="item.codeValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门全称" prop="departmentShortName">
          <el-input
            v-model="state.form.departmentShortName"
            placeholder="请输入部门全称"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactNumber">
          <el-input
            v-model.trim.number="state.form.contactNumber"
            placeholder="请输入联系电话"
            maxlength="11"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input
            v-model.trim="state.form.contactPerson"
            placeholder="请输入联系人"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input
            v-model.number.trim="state.form.sort"
            placeholder="请输入排序"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属区县" prop="district">
          <el-select v-model="state.form.distract" placeholder="请选择">
            <el-option
              v-for="item in districtTypes"
              :key="item.codeValue"
              :label="item.codeName"
              :value="item.codeValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用" prop="sort">
          <el-switch v-model="state.form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="是否接口部门" prop="isInterface">
          <el-switch
            v-model="state.form.isInterface"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <template v-if="state.form.isInterface == '1'">
          <el-form-item label="接口地址" prop="interfaceUrl">
            <el-input
              v-model.trim="state.form.interfaceUrl"
              placeholder="接口地址"
            ></el-input>
          </el-form-item>
          <el-form-item label="认证地址" prop="checkUrl">
            <el-input
              v-model.trim="state.form.checkUrl"
              placeholder="认证地址"
            ></el-input>
          </el-form-item>
          <el-form-item label="认证用户" prop="checkUsername">
            <el-input
              v-model.trim="state.form.checkUsername"
              placeholder="认证用户"
            ></el-input>
          </el-form-item>
          <el-form-item label="认证密码" prop="checkPassword">
            <el-input
              v-model.trim="state.form.checkPassword"
              placeholder="认证密码"
            ></el-input>
          </el-form-item>
          <el-form-item label="原多媒体地址" prop="attachment">
            <el-input
              v-model.trim="state.form.attachment"
              placeholder="原多媒体地址"
            ></el-input>
          </el-form-item>
          <el-form-item label="代理后地址" prop="proxyURl">
            <el-input
              v-model.trim="state.form.proxyURl"
              placeholder="代理后地址"
            ></el-input>
          </el-form-item>
          <el-form-item label="认证类型" prop="checkType">
            <el-select v-model="state.form.checkType" placeholder="请选择">
              <el-option
                v-for="item in authTypes"
                :key="item.codeValue"
                :label="item.codeName"
                :value="item.codeValue"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="客户端用户" prop="clientUsername">
            <el-input
              v-model.trim="state.form.clientUsername"
              placeholder="客户端用户"
            ></el-input>
          </el-form-item>
          <el-form-item label="客户端密码" prop="clientPassword">
            <el-input
              v-model.trim="state.form.clientPassword"
              placeholder="客户端密码"
            ></el-input>
          </el-form-item>
        </template>
        <br />
      </el-form>
    </el-scrollbar>
  </div>
</template>
<script lang="ts" setup>
import { isEqual } from "lodash-es";
import { useCode } from "@/hooks/useCode";
import { reactive, ref, watch } from "vue";
import { DepartmentModel } from "@/api/model/departmentModel";
import { DepartmentService } from "@/api/service/System/DepartmentService";

const { districtTypes, groupTypes, authTypes } = useCode();
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
const checkCode = (rule: any, value: any, callback: any) => {
  if (value) {
    let reg = /^\w+$/;
    if (reg.test(value)) {
      if (props.action === "add") {
        departmentServer.getCodeIsUsed(value).then((res) => {
          if (res.data) {
            callback(new Error("该编码已被使用"));
          } else {
            callback();
          }
        });
      } else {
        callback();
      }
    } else {
      callback(new Error("请输入数字、字母、下划线"));
    }
  } else {
    callback(new Error("请输入部门编码"));
  }
};
const rules = reactive({
  departmentCode: [
    { required: true, validator: checkCode, trigger: "blur", pattern: /^\w+$/ },
  ],
  departmentName: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
  departmentParentCode: [
    { required: true, message: "请选择左侧部门为上级部门", trigger: "blur" },
  ],
  departmentLevel: [
    { required: true, message: "请选择左侧部门为上级部门", trigger: "blur" },
  ],
  departmentMark: [
    {
      required: props.tagFlag,
      message: "请输入部门标识,长度4位",
      trigger: "blur",
      min: 4,
      max: 4,
    },
  ],
});
const emits = defineEmits(["changeAction", "onSubmit", "changeSubmit"]);

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

const clearForm = () => {
  state.form = {};
  state.form.status = 1;
  state.form.departmentParentCode = props.formData.departmentCode;
  state.form.departmentLevel = props.formData.departmentLevel
    ? Number(props.formData.departmentLevel) + 1
    : 0;
};

const deptParentChange = (val: any) => {
  deptParentTree.value.setCheckedKeys([val]);
  let node = deptParentTree.value.getCheckedNodes()[0];
  state.form.departmentLevel = Number(node.departmentLevel) + 1;
};
// loadDeptList()
const getDictionaryType = () => {
  departmentServer.dictionaryType().then((res) => {
    state.dictionaryType = res.data;
  });
};
getDictionaryType();

const init = () => {
  deptform.value.resetFields();

  if (props.action === "edit") {
    Object.keys(props.formData).forEach((key) => {
      state.form[key] = props.formData[key];
    });
    state.form.departmentTags = props.formData.departmentTag
      ? props.formData.departmentTag?.split(",")
      : "";
    props.formData.departmentTags = state.form.departmentTags;
  } else {
    clearForm();
  }

  // console.log("init", props.action, state.form);
};
const isObjEqual = () => {
  let oldObj: any = {},
    newObj: any = {};
  Object.keys(props.formData).forEach((key) => {
    props.formData[key] && (oldObj[key] = props.formData[key]);
  });
  Object.keys(state.form).forEach((key) => {
    state.form[key] && (newObj[key] = state.form[key]);
  });
  return isEqual(oldObj, newObj);
};
watch(
  () => props.formData,
  () => {
    init();
  }
);
watch(
  () => props.action,
  () => {
    init();
  }
);
watch(
  () => props.tagFlag,
  () => {
    rules.departmentMark[0].required = props.tagFlag;
  }
);
watch(
  () => props.submit,
  (val) => {
    if (val) {
      deptform.value.validate((valid: any, fields: any) => {
        if (valid) {
          state.form.departmentTag = state.form.departmentTags
            ? state.form.departmentTags?.join(",")
            : state.form.departmentTag;
          let flag = isObjEqual();
          console.log("emits", props.action, state.form);

          emits("onSubmit", { type: "form", isEqual: flag }, state.form);
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
      color: var(--sh3h-label-form-color);
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
