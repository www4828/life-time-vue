<template>
  <div>
    <Title title="催办">
      <template #content>
        <el-form
          :model="dispatchForm.dto"
          class="from"
          ref="returnApplyForm"
          :rules="dispatchRules"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="部门" prop="departmentCode">
                <el-select
                  v-model="dispatchForm.dto.departmentCode"
                  @change="departmentChange"
                >
                  <el-option
                    v-for="item in departmentData"
                    :label="item.departmentName"
                    :value="item.departmentCode"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-row :span="6">
              <el-form-item label="人员" prop="person">
                <el-select v-model="dispatchForm.dto.person" multiple collapse-tags>
                  <el-option
                    v-for="item in personOpt"
                    :label="item.name"
                    :value="item.username"
                  />
                </el-select>
              </el-form-item>
            </el-row>
            <el-row :span="6">
              <el-form-item label="催办类型" prop="type">
                <el-select v-model="dispatchForm.dto.type" placeholder="请选择">
                  <el-option
                    v-for="item in urgeTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-row>
            <el-row :span="6">
              <el-form-item label="催办方式" prop="sendMethod">
                <el-select v-model="dispatchForm.dto.sendMethod" placeholder="请选择">
                  <el-option
                    v-for="item in sendMethodsTypes"
                    :label="item.codeName"
                    :value="item.codeValue"
                  />
                </el-select>
              </el-form-item>
            </el-row>
          </el-row>
          <el-form-item label="意见说明" prop="content">
            <el-input
              @dblclick="showDialog"
              v-model="dispatchForm.dto.content"
              autofocus
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <Idiom
            :node-code="props.flowModel.code"
            @idiomContentText="IdiomContent"
          ></Idiom>
          <IdiomDialog
            :node-code="props.flowModel.code"
            @get-idiom-content="IdiomContent"
            :show-flag="idiomControl"
            @close-dialog="closeDialog"
            ref="idiomRef"
          />
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { UserService } from "@/api/service/System/UserService";
import { UserModel } from "@/api/model/userModel";
import { UrgeModel } from "@/api/model/urgeModel";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { DispatchService } from "@/api/service/WorkTicket/DispatchService";
import { UrgeService } from "@/api/service/Dispose/UrgeService";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { Session } from "@/utils/storage";
import { useCode } from "@/hooks/useCode";
import { useIdiom } from "@/hooks/useIdiom";

interface DepartmentCodeInfo {
  departmentName: string;
  departmentCode: string;
}
const userServer = new UserService();
const dispatchService = new DispatchService();
const urgeService = new UrgeService();

const { urgeTypes, sendMethodsTypes } = useCode();
const searchModel = ref<SearchModel<UserModel>[]>([
  {
    key: "username",
    value: "",
    match: "like",
  },
  {
    key: "name",
    value: "",
    match: "like",
  },
  {
    key: "mobile",
    value: "",
    match: "like",
  },
  {
    key: "sort",
    value: "sort",
    match: "orderByAsc",
  },
]);
const searchParamsModel = reactive(new SearchParamsModel<UserModel>());
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    caseInfo: any;
    attachments: any;
    nodeCode: string;
  }>(),
  {
    taskId: "",
  }
);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const emit = defineEmits(["changeSubmit", "changeLoading", "done"]);
const returnApplyForm = ref();
const departmentCode = ref("");
const personOpt = ref<UserModel[]>([]);

const dispatchForm = reactive<UrgeModel>({
  dto: {
    departmentCode: "",
    sendMethod: "",
    type: "",
    userCode: "",
    taskId: props.taskId,
    content: "",
    person: [],
  },
  attachmentInfos: [],
});
const dispatchRules = reactive<FormRules>({
  departmentCode: [{ required: true, message: "部门不能为空", trigger: "change" }],
  person: [{ required: true, message: "人员不能为空", trigger: "change" }],
  type: [{ required: true, message: "催办类型不能为空", trigger: "change" }],
  sendMethod: [{ required: true, message: "催办方式不能为空", trigger: "change" }],
  content: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
});
const checkForm = () => {
  return returnApplyForm.value.validate();
};
defineExpose({
  checkForm,
});

const departmentData = ref<DepartmentCodeInfo[]>([]);
const getDepartmentData = () => {
  const { departmentList } = Session.get("userInfo");

  dispatchService
    .getDisposeDepartment(props.taskId, departmentList[0].departmentCode)
    .then((res) => {
      if (res.code == 200) {
        departmentData.value = res.data;
      }
    });
};
getDepartmentData();
const departmentChange = (val: string) => {
  searchHandle(val);
};
const searchHandle = (deptCode: string) => {
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = -1;
  userServer.listUserDept(deptCode, searchParamsModel).then((res) => {
    const results = res.data?.results ? res.data?.results : [];
    if (results.length > 0) {
      // personOpt.value = results.map((item: any) => {
      //     return item.name;
      // });
      personOpt.value = results;
    } else {
      personOpt.value = [];
    }
  });
};
const save = () => {
  dispatchForm.dto.userCode = dispatchForm.dto.person.join(",");
  dispatchForm.attachmentInfos = props.attachments;
  urgeService
    .save(dispatchForm)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? "success" : "error",
        message: res.message + "，即将返回列表页",
      });
      emit("done");
    })
    .catch(() => {
      emit("done");
    });
};

watch(
  () => departmentCode.value,
  (val) => {
    if (val == "") {
      personOpt.value = [];
    }
  }
);
watch(
  () => props.submit,
  (val) => {
    val &&
      returnApplyForm.value?.validate((valid: any) => {
        if (valid) {
          save();
        } else {
          emit("changeSubmit");
        }
      });
  }
);
const IdiomContent = (idContent: string) => {
  dispatchForm.dto.content = idContent;
};
</script>
<style lang="scss" scoped></style>
