<template>
  <Title title="督办信息" align="flex-start" v-if="isDB">
    <template #content>
      <el-form :model="dbFormData" ref="dbForm" label-width="120px" :rules="dbRules" v-if="!props.isDetail">
        <el-row>
          <el-col :span="6">
            <el-form-item label="督办单号" prop="supervisionId">
              <el-input v-model="dbFormData.supervisionId" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="督办来源" prop="source">
              <el-select v-model="dbFormData.source">
                <el-option v-for="item in supervisingSources" :label="item.codeName" :value="item.codeValue" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="督办类型" prop="type">
              <el-select v-model="dbFormData.type">
                <el-option v-for="item in supervisingTypes" :label="item.codeName" :value="item.codeValue" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="列督原因" prop="reason">
              <el-select v-model="dbFormData.reason">
                <el-option v-for="item in supervisingReason" :label="item.codeName" :value="item.codeValue" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="关联单号1" prop="relationTaskIdFirst">
              <el-input v-model="dbFormData.relationTaskIdFirst" readonly>
                <!-- @click="jumpToDetail(dbFormData.relationTaskIdFirst)" -->
                <template #append><el-button :icon="Plus" @click="showRelation('relationTaskIdFirst')" /></template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联单号2">
              <el-input v-model="dbFormData.relationTaskIdSecond" readonly>
                 <!-- @click="jumpToDetail(dbFormData.relationTaskIdSecond)" -->
                <template #append><el-button :icon="Plus" @click="showRelation('relationTaskIdSecond')" /></template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联单号3">
              <el-input v-model="dbFormData.relationTaskIdThird" readonly>
                 <!-- @click="jumpToDetail(dbFormData.relationTaskIdThird)" -->
                <template #append><el-button :icon="Plus" @click="showRelation('relationTaskIdThird')" /></template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联单号4">
              <el-input v-model="dbFormData.relationTaskIdFourth" readonly>
                 <!-- @click="jumpToDetail(dbFormData.relationTaskIdFourth)" -->
                <template #append><el-button :icon="Plus" @click="showRelation('relationTaskIdFourth')" /></template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="督办事项" prop="description">
          <el-input v-model="dbFormData.description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
            maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="督办理由" prop="argument">
          <el-input v-model="dbFormData.argument" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" maxlength="500"
            show-word-limit />
        </el-form-item>
      </el-form>
      <el-form :model="dbDetailFormData" class="detailForm" v-else>
        <el-row>
          <el-col :span="6">
            <el-form-item label="督办单号" prop="supervisionId">
              {{ dbDetailFormData.supervisionId }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="督办来源" prop="source">
              {{ dbDetailFormData.sourceName }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="督办类型" prop="type">
              {{ dbDetailFormData.typeName }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="列督原因" prop="reason">
              {{ dbDetailFormData.reasonName }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="关联单号1">
              <RelationTaskId :code='dbDetailFormData.relationTaskIdFirst' />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联单号2">
              <RelationTaskId :code='dbDetailFormData.relationTaskIdSecond' />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联单号3">
              <RelationTaskId :code='dbDetailFormData.relationTaskIdThird' />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联单号4">
              <RelationTaskId :code='dbDetailFormData.relationTaskIdFourth' />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="督办事项" prop="description">
          {{ dbDetailFormData.description }}
        </el-form-item>
        <el-form-item label="督办理由" prop="argument">
          {{ dbDetailFormData.argument }}
        </el-form-item>
      </el-form>
    </template>
  </Title>
  <RelatedQueryDialog :show-flag="relatedControl.relationTaskIdFirst" @closeDialog="closeDialog"
    :relationField="relatedControl.relationField" ref="relationFirst" />
  <RelatedQueryDialog :show-flag="relatedControl.relationTaskIdSecond" @closeDialog="closeDialog"
    :relationField="relatedControl.relationField" ref="relationSecond" />
  <RelatedQueryDialog :show-flag="relatedControl.relationTaskIdThird" @closeDialog="closeDialog"
    :relationField="relatedControl.relationField" ref="relationThird" />
  <RelatedQueryDialog :show-flag="relatedControl.relationTaskIdFourth" @closeDialog="closeDialog"
    :relationField="relatedControl.relationField" ref="relationFourth" />
</template>
<script lang="ts" setup>
import { ElForm } from "element-plus";
import { useCode } from "@/hooks/useCode";
import type { FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { SupervisionModel } from "@/api/model/supervisionModel";
import { TaskService } from "@/api/service/WorkTicket/TaskService";
import { ref, reactive, getCurrentInstance, onUnmounted, nextTick } from "vue";
import { SupervisionService } from "@/api/service/Supervision/SupervisionService";
import { Connection, Plus } from '@element-plus/icons-vue';
import RelatedQueryDialog from "./RelatedQueryDialog.vue";
import RelationTaskId from './RelationTaskId.vue'
export interface RelatedInfo {
  taskIds: string[];
  caseInfo: CaseInfoModel;
  relationField: string;
}
const props = withDefaults(
  defineProps<{
    isDetail?: boolean;
    taskId?: string;
    isDefaultShow?: boolean;
  }>(),
  {
    isDetail: false,
    taskId: "",
    isDefaultShow: false,
  }
);
const taskService = new TaskService();
const { jumpToDetail } = useCaseDetail();
const { proxy } = <any>getCurrentInstance()!;
const isDB = ref(props.isDefaultShow || false);
const dbForm = ref<InstanceType<typeof ElForm>>();
const supervisionService = new SupervisionService();
const { supervisingTypes, supervisingSources, supervisingReason } = useCode();
const relationFirst = ref()
const relationSecond = ref()
const relationThird = ref()
const relationFourth = ref()

const relatedControl = reactive({
  relationTaskIdFirst: false,
  relationTaskIdSecond: false,
  relationTaskIdThird: false,
  relationTaskIdFourth: false,
  relationField: ''
}) as any;
const dbFormData = reactive<SupervisionModel>({
  reason: "",
  description: "",
  relationTaskIdFirst: "",
  relationTaskIdFourth: "",
  relationTaskIdSecond: "",
  relationTaskIdThird: "",
  source: "",
  type: "34002",
  argument: "",
  supervisionId: "",
  id: "",
});
const dbDetailFormData = reactive({
  reasonName: "",
  description: "",
  relationTaskIdFirst: "",
  relationTaskIdFourth: "",
  relationTaskIdSecond: "",
  relationTaskIdThird: "",
  sourceName: "",
  typeName: "",
  argument: "",
  supervisionId: "",
});

const dbRules = reactive<FormRules>({
  /* supervisionId: [
    { required: true, message: "督办单号不能为空", trigger: "blur" },
    { required: true, message: "督办单号不能为空", trigger: "change" },
  ], */
  source: [{ required: true, message: "督办来源不能为空", trigger: "change" }],
  type: [{ required: true, message: "督办类型不能为空", trigger: "change" }],
  reason: [{ required: true, message: "列督原因不能为空", trigger: "change" }],
  relationTaskIdFirst: [
    { required: true, message: "关联单号1不能为空", trigger: ["blur", "change"] },
  ],
  /* description: [{ required: true, message: "督办事项不能为空", trigger: "blur" }],
  argument: [{ required: true, message: "督办理由不能为空", trigger: "blur" }], */
});
const searchParamsModel = reactive(new SearchParamsModel<SupervisionModel>());
const searchModel = ref<SearchModel<SupervisionModel>[]>([
  {
    key: "taskId",
    value: props.taskId,
    match: "eq",
  },
]);
const checkForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    dbForm.value!.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
const getTaskId = () => {
  taskService.getSupervisionTaskId().then((taskId) => {
    dbFormData.supervisionId = String(taskId);
  });
};
/* if (!props.isDetail) {
  getTaskId();
} */
const showRelation = (fileld: string) => {
  relatedControl[fileld] = true
  relatedControl.relationField = fileld
}
const closeDialog = () => {
  relatedControl.relationTaskIdFirst = false;
  relatedControl.relationTaskIdSecond = false;
  relatedControl.relationTaskIdThird = false;
  relatedControl.relationTaskIdFourth = false;
  relatedControl.relationField = ''
}

const getFormDataByTaskId = () => {
  searchParamsModel.searchParams = searchModel.value;
  supervisionService.list(searchParamsModel).then((res) => {
    if (res.code === 200) {
      if (res.data.results.length > 0) {
        isDB.value = true;
        const data = res.data.results[0];
        if (props.isDetail) {
          dbDetailFormData.argument = data.argument;
          dbDetailFormData.description = data.description;
          dbDetailFormData.relationTaskIdFirst = data.relationTaskIdFirst;
          dbDetailFormData.relationTaskIdSecond = data.relationTaskIdSecond || "";
          dbDetailFormData.relationTaskIdThird = data.relationTaskIdThird || "";
          dbDetailFormData.relationTaskIdFourth = data.relationTaskIdFourth || "";
          dbDetailFormData.sourceName = supervisingSources.value.find(
            (item) => item.codeValue === data.source
          )?.codeName!;
          dbDetailFormData.typeName = supervisingTypes.value.find(
            (item) => item.codeValue === data.type
          )?.codeName!;
          dbDetailFormData.reasonName = supervisingReason.value.find(
            (item) => item.codeValue === data.reason
          )?.codeName!;
          dbDetailFormData.supervisionId = data.supervisionId;
        } else {
          dbFormData.argument = data.argument;
          dbFormData.description = data.description;
          dbFormData.relationTaskIdFirst = data.relationTaskIdFirst;
          dbFormData.relationTaskIdSecond = data.relationTaskIdSecond || "";
          dbFormData.relationTaskIdThird = data.relationTaskIdThird || "";
          dbFormData.relationTaskIdFourth = data.relationTaskIdFourth || "";
          dbFormData.source = data.source;
          dbFormData.type = data.type;
          dbFormData.reason = data.reason;
          dbFormData.supervisionId = data.supervisionId;
          dbFormData.id = data.id;
        }
      } else {
        isDB.value = false;
      }
    }
  });
};
if (props.taskId) {
  getFormDataByTaskId();
}
onUnmounted(() => {
  proxy.mittBus.off("getRelatedInfo");
});
proxy.mittBus.on("getRelatedInfo", (relatedInfo: RelatedInfo) => {
  dbFormData[relatedControl.relationField] = `${relatedInfo.caseInfo.externalNumber}（${relatedInfo.taskIds.join(',')}）`
});
defineExpose({
  checkForm,
  getFormData() {
    return dbFormData;
  },
  clearForm() {
    dbFormData.argument = "";
    dbFormData.description = "";
    dbFormData.relationTaskIdFirst = "";
    dbFormData.relationTaskIdSecond = "";
    dbFormData.relationTaskIdThird = "";
    dbFormData.relationTaskIdFourth = "";
    dbFormData.source = "";
    dbFormData.type = "";
    dbFormData.supervisionId = "";
    dbFormData.reason = "";
    relationFirst.value.clear()
    relationSecond.value.clear()
    relationThird.value.clear()
    relationFourth.value.clear()
    nextTick(() => {
      dbForm.value?.resetFields();
    });
  },
  showDB() {
    isDB.value = true;
  },
});
</script>

<style lang="scss" scoped>
.detailForm {
  .el-form-item {
    margin-bottom: 5px;

    ::v-deep(label) {
      margin: 0;
      color: var(--sh3h-label-form-color);
      font-size: 16px;
      font-weight: bold;
      width: 90px;
    }

    ::v-deep(.el-form-item__content) {
      @include fontStyle(var(--sh3h-font-family-medium),
        $font-size-16,
        var(--sh3h-value-color));
      font-weight: bold;
    }

    ::v-deep(.el-link__inner) {
      font-size: 16px;
      font-weight: bold;
    }

    .zoomIcon {
      color: var(--sh3h-attachment-color);
      cursor: pointer;
      margin-left: 5px;
    }
  }
}
</style>
