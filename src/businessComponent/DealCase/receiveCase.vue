<template>
  <div class="receiveCase">
    <Title title="工单接单">
      <template #content>
        <el-form
          :model="dispatchForm"
          class="from"
          ref="receiveForm"
          :rules="dispatchRules"
        >
          <el-row v-if="dispatchForm.result">
            <el-col :span="6">
              <el-form-item label="先联结果">
                <span>{{ dispatchForm.resultName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="先联方式">
                <span>{{ dispatchForm.typeName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="先联时间">
                <span>{{ dispatchForm.time || "--" }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="未联原因">
                <span>{{ dispatchForm.reasonName || "--" }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="意见说明" prop="desc">
            <el-input
              @dblclick="showDialog"
              v-model="dispatchForm.desc"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <IdiomDialog
            :node-code="props.flowModel.code"
            :show-flag="idiomControl"
            @close-dialog="closeDialog"
            @get-idiom-content="IdiomContent"
            ref="idiomRef"
          />
          <Idiom :node-code="props.flowModel.code" @idiomContentText="IdiomContent"></Idiom>
        </el-form>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { ElMessage, FormRules } from "element-plus";
import Title from "@/components/Title/Title.vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import IdiomDialog from "@/businessComponent/Idiom/IdiomDialog.vue";
import { Session } from "@/utils/storage";
import Idiom from "@/businessComponent/Idiom/Idiom.vue";
import { useIdiom } from "@/hooks/useIdiom";
const props = withDefaults(
  defineProps<{
    flowModel: any;
    taskId: string;
    submit: boolean;
    hidden: boolean;
    attachments: any;
    warnForm: any
  }>(),
  {
    taskId: "",
  }
);
type FormRules = /*unresolved*/ any
const emit = defineEmits(["changeSubmit", "changeLoading", "done", "showGroupVisit"]);
const disposeService = new DisposeService();
const receiveForm: any = ref(null);
const { idiomControl, closeDialog, idiomRef, showDialog } = useIdiom();
const dispatchForm: any = reactive({
  result: "",
  type: "",
  time: "",
  reason: "",
  desc: "",
  reasonName: "",
  resultName: "",
  typeName: "",
});
const dispatchRules = reactive<FormRules>({
  desc: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
});

const getTableData = () => {
  disposeService
    .list({
      pageParams: { pageSize: -1, pageIndex: 0 },
      searchParams: [
        {
          key: "taskId",
          value: props.taskId,
          match: "eq",
        },
      ],
    })
    .then((res) => {
      if (res.data?.results.length > 0) {
        Object.keys(dispatchForm).forEach((key) => {
          dispatchForm[key] = res.data?.results[res.data?.results.length - 1][key];
        });
        dispatchForm.result = res.data?.results.some((i: any) => i.result == "已联")
          ? `已联(${res.data.pageInfo.total})`
          : "未联";
      }
    });
};
getTableData();

const save = () => {
  // 接单
  if(props.warnForm.selectedCount > 0){
    caseReceiveBatch()
  }else{
    caseReceive()
  }
};
const caseReceive = () => {
  // 接单n
  const { username, departmentList } = Session.get("userInfo");
  let params: any = {
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    caseReceiveDto: {
      departmentCode: departmentList[0].departmentCode,
      remark: dispatchForm.desc,
      taskId: props.taskId,
      username: username,
    },
    attachmentInfos: props.attachments,
  };
  emit("changeLoading", true);
  disposeService
    .caseReceive(params)
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
const caseReceiveBatch = () => {
  // 接单n
  emit('showGroupVisit')
  const { username, departmentList } = Session.get("userInfo");
  let params: any = {
    flowModel: {
      lineId: props.flowModel.id,
      processId: props.flowModel.processId,
      code: props.flowModel.code,
    },
    caseReceiveDto: {
      departmentCode: departmentList[0].departmentCode,
      remark: dispatchForm.desc,
      taskId: props.taskId,
      username: username,
    },
    attachmentInfos: props.attachments,
    warnId:props.warnForm.warnId,
    flowModelList: props.warnForm.flowModelList,
    relations: [],
  };
  // emit("changeLoading", true);
  disposeService
    .caseReceiveBatch(params)
    .then((res) => {
      ElMessage({
        message: "批量提交" + (res.code == 200 ? '成功, 您可在当前页面等待处理结果' : '失败'),
        type: res.code == 200 ? "success" : "error",
      });
      // emit("done");
    })
    .catch(() => {
      emit("done");
    });
};
watch(
  () => props.submit,
  (val) => {
    val &&
      receiveForm.value?.validate((valid: any) => {
        if (valid) {
          save();
        } else {
          emit("changeSubmit");
        }
      });
  }
);
watch(
  () => props.hidden,
  (val) => {
    !val && getTableData();
  }
);
const IdiomContent = (idContent: string) => {
  dispatchForm.desc = idContent;
};
</script>
<style lang="scss" scoped>
.receiveCase {
  height: 100%;
}
</style>
