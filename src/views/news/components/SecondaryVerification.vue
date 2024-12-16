<template>
  <el-dialog
    :model-value="props.showFlag"
    title="二次验证"
    width="30%"
    @close="emits('closeDialog')"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form ref="dataForm" :model="formData">
      <el-form-item prop="password" label="验证码">
        <el-input placeholder="验证码" v-model="formData.password">
          <template #append>
            <el-button
              class="codeBox"
              :disabled="sysConfig.isDisabled"
              @click="sendSmsCode"
              >{{ sysConfig.smsText }}</el-button
            >
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="login">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, ref, watch } from "vue";
import { Session } from "@/utils/storage";
import { useCode } from "@/hooks/useCode";
import { useLock } from "@/hooks/useLock";
import { useDepartment } from "@/hooks/useDepartment";
import { ElMessage, ElForm } from "element-plus";
import { LoginService, LoginType } from "@/api/login";
import { LoginModel } from "@/api/model/loginModel";

const emits = defineEmits(["closeDialog"]);
const props = defineProps<{
  showFlag: boolean;
}>();

let timer: any = null;
const clientServer = new LoginService();
const dataForm = ref<InstanceType<typeof ElForm>>();
const sysConfig = reactive<{
  smsText: string;
  isDisabled: boolean;
  loginType: LoginType;
}>({
  smsText: "发送验证码",
  isDisabled: false,
  loginType: "sms_code",
});
const formData = reactive({
  userName: "",
  password: "",
});
const countdown = () => {
  sysConfig.isDisabled = true;
  let downNum = 60;
  console.log("object");
  timer = setInterval(() => {
    downNum--;
    sysConfig.smsText = `请在${downNum}秒后尝试`;
    if (downNum === 0) {
      clearInterval(timer);
      sysConfig.isDisabled = false;
      sysConfig.smsText = "获取验证码";
    }
  }, 1000);
};
const login = () => {
  if (formData.password === "") {
    ElMessage.error("请输入验证码");
    return;
  }
  let clientLoginModel: LoginModel = {
    userName: formData.userName,
    passWord: formData.password,
  };
  clientServer
    .signIn(clientLoginModel, sysConfig.loginType)
    .then((res) => {
      if (res.code == 200) {
        let data = res.data;
        if (res.data === null) {
          ElMessage.error(res.message);
        } else {
          ElMessage.success("登陆成功");
          try {
            // 存储 token 到浏览器缓存
            // debugger
            sessionStorage.setItem("token", data.token);
            // 存储用户信息到浏览器缓存
            Session.set("userInfo", data);
            const { hasLockCase } = useLock();
            hasLockCase();
            useCode();
            emits("closeDialog");
          } catch (ex) {
            ElMessage.error(ex!);
          }
        }
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch((err) => {
      ElMessage.error(err);
    });
};
const sendSmsCode = () => {
  if (formData.userName === "") {
    ElMessage.error("请输入手机号！");
    return;
  }
  const telReg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
  if (!telReg.test(formData.userName)) {
    ElMessage.error("请输入正确的手机号！");
    return;
  } else {
    clientServer.getSmsCode(formData.userName).then((res) => {
      if (res.code === 200) {
        ElMessage.success("验证码已发送！");
        countdown();
      } else {
        ElMessage.error(res.message);
      }
    });
  }
};
watch(
  () => props.showFlag,
  (status) => {
    if (status) {
      const { mobile } = useDepartment();
      formData.userName = mobile;
    }
  }
);
</script>
<style lang="scss"></style>
