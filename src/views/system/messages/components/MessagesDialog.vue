<template>
  <el-dialog
    v-model="props.dialogVisible"
    title="消息推送"
    width="60%"
    @close="$emit('closeDialog')"
    destroy-on-close
  >
    <Layout>
      <template #tree>
        <el-tree
          ref="treeRef"
          :props="treeProps"
          :data="state.treeData"
          class="treeRef"
          highlight-current
          node-key="id"
          show-checkbox
          default-expand-all
          @check="treeChange"
        />
      </template>
      <template #content>
        <el-form
          class="formBox"
          ref="authForm"
          :model="state.form"
          label-position="right"
          label-width="140px"
          :rules="rules"
          :inline="true"
        >
          <el-form-item label="发送渠道" prop="type">
            <!-- <el-input v-model="state.form.type" :disabled="props.againFlag == true"> </el-input> -->
            <el-select
              v-model="state.form.type"
              :disabled="props.againFlag == true"
              @change="typeChange"
            >
              <el-option
                v-for="item in sendChannelTypes"
                :label="item.codeName"
                :value="item.codeValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="发送账号" prop="sendChannel">
            <!-- <el-input v-model="state.form.sendChannel" :disabled="props.againFlag == true"> </el-input> -->
            <el-select
              v-model="state.form.sendChannel"
              :disabled="props.againFlag == true"
            >
              <el-option
                v-for="item in state.sendType"
                :label="item.configName"
                :value="item.configId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="消息标题" prop="title" v-if="state.form.type != '2'">
            <el-input v-model="state.form.title" :disabled="props.againFlag == true">
            </el-input>
          </el-form-item>

          <el-form-item label="消息模板">
            <el-select
              v-model="state.form.modules"
              filterable
              placeholder="请选择"
              @change="modulesChange"
              :disabled="props.againFlag == true"
            >
              <el-option
                v-for="type in state.modulesData"
                :label="type.name"
                :value="type.content"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="消息内容" prop="content">
            <el-input
              v-model="state.form.content"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              maxlength="500"
              show-word-limit
              :disabled="props.againFlag == true"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="推送对象" prop="receiver">
            <el-input
              v-model="state.form.receiver"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              placeholder="多人用|分割"
              maxlength="500"
              :disabled="props.againFlag == true"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="跳转链接" prop="homeUrl" v-if="state.form.type != '2'">
            <el-input v-model="state.form.homeUrl" :disabled="props.againFlag == true">
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #bottom>
        <div class="btnGroup">
          <el-button type="success" @click="submitForm" :loading="state.loading" class="save">{{
            props.againFlag == true ? "重新发送" : "保存"
          }}</el-button>
          <el-button @click="cancel" class="cancel">取消</el-button>
        </div>
      </template>
    </Layout>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch, nextTick } from "vue";
import Layout from "@/components/Layout/Layout.vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElTree, ElMessageBox, ElForm } from "element-plus";
import { Session } from "@/utils/storage";
import { Response, SearchParamsModel } from "@/api/interface";
import { DistributionGroupModel } from "@/api/model/distributionGroupModel";
import { DistributionGroupService } from "@/api/service/Sms/DistributionGroupService";
import { SmsTemplateModel } from "@/api/model/smsTemplateModel";
import { SmsTemplateService } from "@/api/service/Sms/SmsTemplateService";
import { SmsSendModel } from "@/api/model/smsSendModel";
import { SmsSendService } from "@/api/service/Sms/SmsSendService";
import { useCode } from "@/hooks/useCode";
import { debounce, cloneDeep } from "lodash-es";

interface SendType {
  agentId: string;
  agentName: string;
  appId: string;
  appSecret: string;
  classType: string;
  configId: string;
  configName: string;
  description: string;
  sendType: string;
}
const props = defineProps({
  againFlag: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    default: {},
  },
  dialogVisible: {
    type: Boolean,
    default: false,
  },
});
const { sendChannelTypes } = useCode();

const emits = defineEmits(["closeDialog"]);
const { departmentList } = Session.get("userInfo");
const state = reactive({
  treeData: [],
  form: {
    modules: "",
    content: "",
    grade: "",
    receiver: "",
    sendChannel: "",
    type: "",
    title: "",
    homeUrl: "",
  },
  modulesData: [] as SmsTemplateModel[],
  sendType: [] as SendType[],
  loading: false
});

const distributionGroupService = new DistributionGroupService();

const customNodeClass = (data: any) => {
  if (data.groupName == "") {
    return "person";
  } else {
    return "";
  }
};
const treeLabel = (data: any) => {
  if (data.groupName == "") {
    return data.userName;
  } else {
    return data.groupName;
  }
};
const treeDisabled = (data: any) => {
  if (props.againFlag == true) {
    return "disabled";
  } else {
    return "";
  }
};
const treeProps = {
  label: treeLabel,

  children: "childs",
  class: customNodeClass,
  disabled: treeDisabled,
};
const rules = reactive<FormRules>({
  name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
  type: [{ required: true, message: "短信类型不能为空", trigger: "blur" }],
  modules: [{ required: true, message: "短信模板不能为空", trigger: "change" }],
  receiver: [{ required: true, message: "电话不能为空", trigger: "change" }],
  content: [{ required: true, message: "短信内容不能为空", trigger: "blur" }],
  sendChannel: [{ required: true, message: "发送渠道不能为空", trigger: "blur" }],
  title: [{ required: true, message: "消息标题不能为空", trigger: "blur" }],
  homeUrl: [{ required: true, message: "跳转链接不能为空", trigger: "blur" }],
});
const authForm = ref<FormInstance>();

// 获取通讯录树
const getTreeAll = () => {
  distributionGroupService
    .getTreeList(departmentList[0].departmentCode)
    .then((res: Response) => {
      if (res.code === 200) {
        state.treeData = res.data;
      }
    });
};

// 获取短信模板
const searchParamsModel = reactive(new SearchParamsModel<SmsTemplateModel>());
const smsTemplateService = new SmsTemplateService();
const getAll = () => {
  searchParamsModel.searchParams = [
    {
      key: "content",
      value: "",
      match: "like",
    },
    {
      key: "name",
      value: "",
      match: "like",
    },
    {
      key: "departmentCode",
      value: departmentList[0].departmentCode,
      match: "eq",
    },
  ];
  searchParamsModel.pageParams.pageSize = -1;
  smsTemplateService.list(searchParamsModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data;
      state.modulesData = results;
    }
  });
};
const treeChange = (value: any, data: any) => {
  // console.log('value', value)
  // console.log('data', data)

  // var mobileData = [value]
  var mobileList = data.checkedNodes
    .filter((item: any) => {
      return item.mobile != "";
    })
    .map((val: any) => {
      return val.mobile;
    });
  console.log("mobileList", mobileList);
  state.form.receiver = mobileList.join("|");
};
//
const modulesChange = (val: string) => {
  state.form.content = val;
};
const smsSendService = new SmsSendService();
// 获取发送账号

const getSendType = (type: string) => {
  if (type) {
    smsSendService.getSendType(type).then((res: Response) => {
      if (res.code === 200) {
        console.log("res", res.code);
        state.sendType = res.data;
      }
    });
  } else {
    state.sendType = [] as SendType[];
  }
};
const typeChange = (val: string) => {
  console.log("val", val);
  if (val == "2") {
    rules.title = [{ required: false, message: "", trigger: "blur" }];
    rules.homeUrl = [{ required: false, message: "", trigger: "blur" }];
  } else {
    rules.title = [{ required: true, message: "消息标题不能为空", trigger: "blur" }];
    rules.homeUrl = [{ required: true, message: "跳转链接不能为空", trigger: "blur" }];
  }
  getSendType(val);
};

// 保存
const submitForm = debounce(() => {
  authForm.value?.validate((valid: any) => {
    if (valid) {
      var postData = {
        content: state.form.content,
        departmentCode: departmentList[0].departmentCode,
        grade: state.form.grade,
        receiver: state.form.receiver,
        sendChannel: state.form.sendChannel,
        type: state.form.type,
        title: state.form.title,
        homeUrl: state.form.homeUrl,
      };
      state.loading = true
      smsSendService.send(postData).then((res: Response) => {
        state.loading = false
        if (res.code === 200) {
          ElMessage.success(res.message);
          clean();
          emits("closeDialog");
        }
      }).catch(()=>state.loading = false);
    }
  });
},500);
const clean = () => {
  state.form.content = "";
  state.form.grade = "";
  state.form.receiver = "";
  state.form.modules = "";
  state.form.sendChannel = "";
  state.form.type = "";
  state.form.title = "";
  state.form.homeUrl = "";
};
const getAgainData = () => {
  console.log("data", props.formData);
  state.form.content = props.formData.content;
  state.form.grade = props.formData.grade;
  state.form.receiver = props.formData.receiver;
  state.form.modules = "";
  state.form.sendChannel = props.formData.sendChannel;
  state.form.type = props.formData.type;
  state.form.title = props.formData.title;
  state.form.homeUrl = props.formData.homeUrl;
};
// 取消
const cancel = () => {
  emits("closeDialog");
};
watch(
  () => props.dialogVisible,
  (val) => {
    if (val == true) {
      getTreeAll();
      getAll();
    }
  }
);
watch(
  () => props.againFlag,
  (val) => {
    if (val == true) {
      getAgainData();
    } else {
      clean();
    }
  }
);
defineExpose({
  clean,
});
</script>
<style lang="scss" scoped>
.formBox {
  height: 500px;
}
</style>
