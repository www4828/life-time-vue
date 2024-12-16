<template>
  <el-dialog
    :model-value="props.dialogVisible"
    width="50%"
    @close="cancel"
    custom-class="concant-dialog"
    :show-close="false"
    :close-on-click-modal="false"
    draggable
    :title="props.formType + '录音'"
  >
    <div class="concat">
      <!-- <Title :title="props.formType + '录音'" /> -->
      <el-form :model="form" label-width="120px" :rules="formRules" ref="ruleFormRef">
        <el-row>
          <el-col :span="7">
            <el-form-item label="联系人" prop="person">
              <el-input v-model="form.person" />
            </el-form-item>
          </el-col>
          <el-col :span="7" :offset="1">
            <el-form-item
              :label="
                props.formType === '联系市民' ? '联系电话' : props.formType + '电话'
              "
              prop="phone"
            >
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="1" align="center">
            <el-link
              type="primary"
              :icon="Phone"
              :style="{ fontSize: '20px' }"
              @click="phone"
            />
          </el-col>
          <el-col :span="7">
            <el-form-item
              :label="
                props.formType === '联系市民' ? '联系方式' : props.formType + '方式'
              "
              prop="type"
            >
              <el-select v-model="form.type" placeholder="请选择">
                <el-option
                  v-for="item in concatMethodsTypes"
                  :label="item.codeName"
                  :value="item.codeValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7">
            <el-form-item
              :label="
                props.formType === '甄别'
                  ? '甄别状态'
                  : props.formType === '联系市民'
                  ? '联系结果'
                  : props.formType + '结果'
              "
              prop="result"
            >
              <el-select
                v-model="form.result"
                placeholder="请选择"
                @change="resultChange"
              >
                <el-option
                  v-for="item in contactTypes"
                  :label="item.codeName"
                  :value="item.codeValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7" :offset="1">
            <el-form-item label="未联系原因" prop="reason">
              <el-select v-model="form.reason" placeholder="请选择" clearable>
                <el-option
                  v-for="item in contactReasonTypes"
                  :label="item.codeName"
                  :value="item.codeValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7" :offset="1">
            <el-form-item
              :label="
                props.formType === '联系市民' ? '联系时间' : props.formType + '时间'
              "
              prop="time"
            >
              <el-date-picker
                v-model="form.time"
                type="datetime"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                :editable="false"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="23">
            <el-form-item
              :label="
                props.formType === '联系市民' ? '联系描述' : props.formType + '描述'
              "
              prop="description"
            >
              <el-input
                v-model="form.description"
                :rows="3"
                type="textarea"
                maxlength="500"
                show-word-limit
                resize="none"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="23" class="div-flex-right">
            <el-button type="primary" @click="save">确定</el-button>
            <el-button type="info" @click="cancel">关闭</el-button>
          </el-col>
        </el-row>
      </el-form>

      <Title :title="props.formType + '情况'" />

      <el-table
        :data="data.tableData"
        style="width: 100%"
        height="100%"
        :default-sort="{ prop: 'xuhao', order: 'descending' }"
        :header-cell-style="{
          'text-align': 'center',
          background: '#f2f7ff',
        }"
        :cell-style="{ 'text-align': 'center' }"
      >
        <el-table-column
          prop="resultName"
          :label="props.formType === '联系市民' ? '联系结果' : props.formType + '状态'"
        />
        <el-table-column
          prop="time"
          :label="props.formType === '联系市民' ? '联系时间' : props.formType + '时间'"
        />

        <el-table-column prop="reasonName" label="未联系原因" />

        <el-table-column
          prop="typeName"
          :label="props.formType === '联系市民' ? '联系方式' : props.formType + '方式'"
        >
        </el-table-column>
        <el-table-column
          prop="description"
          :label="props.formType === '联系市民' ? '联系描述' : props.formType + '描述'"
        />
        <el-table-column
          prop="attachment"
          :label="props.formType === '联系市民' ? '联系录音' : props.formType + '录音'"
        >
          <template #default="scope">
            <el-link
              v-if="scope.row.attachment"
              type="primary"
              :icon="VideoPlay"
              :style="{ fontSize: '20px' }"
              @click="audioPlay($event, scope.row)"
              ref="audioButton"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <AudioPlayer ref="audioPlayer" />
  </el-dialog>
</template>
<script lang="ts" setup>
import dayjs from "dayjs";
import { reactive, getCurrentInstance, ref } from "vue";
import { ElMessage, ElForm } from "element-plus";
import Title from "@/components/Title/Title.vue";
import type { FormInstance, FormRules } from "element-plus";
import { Phone, VideoPlay } from "@element-plus/icons-vue";
import { Response, SearchParamsModel } from "@/api/interface";
import { ContactModel } from "@/api/model/disposeModel";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import { LettersVisitService } from "@/api/service/LettersVisit/LettersVisitService";
import { debounce } from "lodash-es";
import { useDepartment } from "@/hooks/useDepartment";
import { useTransform } from "@/hooks/useTransform";
import { useCode } from "@/hooks/useCode";
import AudioPlayer from "@/components/AudioPlayer/playerPopup.vue";
import { NODE_CODE } from "@/utils";

type FormType = "先联" | "甄别" | "联系市民";
interface Props {
  dialogVisible?: boolean;
  formType?: FormType;
  nodeCode?: string;
  taskId: string;
  lineForm: any;
}
const props = withDefaults(defineProps<Props>(), {
  dialogVisible: false,
  nodeCode: "",
  taskId: "",
  lineForm: {},
});
const {
  departmentList,
  currentDepartmentCode,
  currentDepartmentCodeName,
  username,
  name,
} = useDepartment();
const { transformToHex } = useTransform();
const { contactReasonTypes, contactTypes, concatMethodsTypes } = useCode();
const audioPlayer = ref();
const audioButton = ref();
const form = reactive<ContactModel>({
  attachment: "",
  departmentCode: departmentList[0].departmentCode,
  description: "",
  nodeCode: props.nodeCode,
  person: name,
  phone: props.lineForm.contactPhone || props.lineForm.reportPhone,
  reason: "",
  result: "",
  taskId: props.taskId,
  time: dayjs().format("YYYY-MM-DD HH:mm"),
  type: concatMethodsTypes.value[0].codeValue,
});
const attachmentDto = reactive({
  departmentCode: departmentList[0].departmentCode,
  fileId: "",
  fileName: props.formType + "录音",
  nodeCode: props.nodeCode,
  taskId: props.taskId,
  type: form.type,
  url: "",
});
const ruleFormRef = ref<FormInstance>();
const formRules = reactive<FormRules>({
  person: [{ required: true, message: "不能为空", trigger: "blur" }],
  phone: [{ required: true, message: "不能为空", trigger: "blur" }],
  type: [{ required: true, message: "不能为空", trigger: "change" }],
  result: [{ required: true, message: "不能为空", trigger: "change" }],
  time: [{ required: true, message: "", trigger: "change" }],
  description: [{ required: true, message: "不能为空", trigger: "blur" }],
});
const data = reactive({
  tableData: [],
});
const lettersVisitService = new LettersVisitService()

const emit = defineEmits(["close", "save"]);
const { proxy } = <any>getCurrentInstance();
const phone = () => {
  proxy.mittBus.emit("phoneCallMake", {
    outPhoneNo: form.phone,
    callback: function (res: string) {
      //res 录音号
      console.log("res", res);
      getAttchMentID(res);
    },
  });
};
const getAttchMentID = async (res: string) => {
  form.attachment = (await transformToHex(res)) as string;
  console.log("res", res);
};
const save = debounce(() => {
  if (form.attachment != "") {
    attachmentDto.fileId = form.attachment;
    form.attachmentDto = attachmentDto;
  }
  // console.log(attachmentDto);
  // console.log("form", form);
  ruleFormRef.value!.validate((valid) => {
    if (valid) {
      lettersVisitService.save(form).then((res: Response) => {
        if (res.code === 200) {
          ElMessage.success(res.message);
          getTableData();
          form.type = concatMethodsTypes.value[0].codeValue;
          form.reason = "";
          form.time = "";
          form.attachment = "";
          form.result = "";
          form.description = "";
          formRules.reason = [{ required: false, message: "", trigger: "change" }];
          setTimeout(() => {
            ruleFormRef.value!.clearValidate();
          }, 30);

          if (form.hasOwnProperty("attachmentDto")) {
            delete form.attachmentDto;
          }
          if (form.attachment !== "") {
            emit("save", {
              type: "voice",
              url: "",
              departmentCode: currentDepartmentCode,
              departmentName: currentDepartmentCodeName,
              fileId: form.attachment,
              fileName: props.formType + "录音",
              nodeCode: props.nodeCode,
              userName: username,
              nodeCodeName: NODE_CODE[props.nodeCode as NodeCodeKey],
            });
          }
        } else {
          ElMessage.info(res.message);
        }
      });
    }
  });
}, 500);
const cancel = () => {
  emit("close");
};
const resultChange = () => {
  if (form.result == "0") {
    formRules.reason = [{ required: true, message: "不能为空", trigger: "change" }];
  } else {
    formRules.reason = [{ required: false, message: "", trigger: "change" }];
  }
};
const searchParamsModel = reactive(new SearchParamsModel<ContactModel>());
const getTableData = () => {
  searchParamsModel.pageParams.pageSize = -1;
  searchParamsModel.searchParams = [
    {
      key: "taskId",
      value: props.taskId,
      match: "eq",
    },
  ];
  lettersVisitService.list(searchParamsModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data;
      data.tableData = results;
      console.log("data.tableData", data.tableData);
    }
  });
};
getTableData();

const audioPlay = (e: any, info: any) => {
  audioPlayer.value.handlePlayVideo(e, info);
};
</script>
<style lang="scss" scoped>
.concat {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  // .concatTable {
  //   width: 100%;
  //   height: 140px;
  // }
}

.color {
  color: #000000;
}
</style>
