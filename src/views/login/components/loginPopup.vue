<template>
  <el-dialog
    v-model="state.visible"
    @close="emits('closeHandle')"
    custom-class="login-popup"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="login-popup-box">
      <el-form
        class="login-info"
        :model="state.ruleForm"
        :rules="loginRules"
        ref="loginForm"
      >
        <div class="system-box">
          <div class="logo" v-show="getThemeConfig.isShowLogo"></div>
          <!-- <div class="title">{{ getThemeConfig.globalTitle }}</div> -->
          <div class="title">城建服务热线系统</div>
        </div>
        <div class="checkBox">
          <div
            :class="state.checkHidden == true ? 'checkText' : 'cancelText'"
            @click="accountClick"
          >
            账号登录
          </div>
          <div
            :class="state.checkHidden == false ? 'checkText' : 'cancelText'"
            @click="phoneClick"
          >
            手机号登录
          </div>
        </div>
        <div class="accountBox" v-show="state.checkHidden">
          <el-form-item prop="userName">
            <el-input
              placeholder="用户名"
              v-model="state.ruleForm.userName"
              name="userName"
              type="text"
              tabindex="1"
              auto-complete="on"
            >
              <template #prefix>
                <div class="icon-box">
                  <div class="icon_box_child">
                    <div class="user"></div>
                  </div>
                </div>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              placeholder="密码"
              v-model="state.ruleForm.password"
              name="password"
              type="password"
              tabindex="1"
              auto-complete="on"
              @keyup.enter="isCanLogin"
              show-password
            >
              <template #prefix>
                <div class="icon-box">
                  <div class="icon_box_child">
                    <div class="password"></div>
                  </div>
                </div>
              </template>
            </el-input>
          </el-form-item>
        </div>
        <div class="phoneBox" v-show="!state.checkHidden">
          <el-form-item prop="userName">
            <el-input
              placeholder="请输入手机号"
              v-model="state.ruleForm.userName"
              name="userName"
              type="text"
              tabindex="1"
              auto-complete="on"
            >
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-row style="width: 100%">
              <el-col :span="16">
                <el-input
                  placeholder="验证码"
                  v-model="state.ruleForm.password"
                  name="password"
                  type="password"
                  tabindex="1"
                  auto-complete="on"
                  @keyup.enter="isCanLogin"
                >
                </el-input>
              </el-col>
              <el-col :span="8" align="right">
                <el-button class="codeBox" :disabled="isDisabled" @click="sendSmsCode">{{
                  smsText
                }}</el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </div>
        <SliderVerify
          v-model:isShowSelf="sliderVConf.isShowSelf"
          :isBorder="sliderVConf.isBorder"
          :isParentNode="sliderVConf.isParentNode"
          :isCloseBtn="sliderVConf.isCloseBtn"
          :isReloadBtn="sliderVConf.isReloadBtn"
          :imgUrl="imgUrl"
          :width="300"
          :height="180"
          @success="emitChange('success')"
        ></SliderVerify>
        <el-button class="bottom" @click="isCanLogin" :loading="loading">登录</el-button>
        <div class="textBtnBox" v-show="state.checkHidden">
          <!-- <el-button type="text" class="bottomText" @click="forgetName"
            >忘记账号名</el-button
          > -->
          <!-- <span></span>
          <el-button type="text" class="bottomText" @click="forgetPassWord"
            >忘记密码</el-button
          > -->
        </div>
      </el-form>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import {
  computed,
  watch,
  reactive,
  ref,
  toRefs,
  nextTick,
  onBeforeUnmount,
  onBeforeMount,
} from "vue";
import { useStore } from "@/store";
import { ElMessage, ElForm, ElMessageBox } from "element-plus";
/* import SliderVerification from "@/components/sliderVerification/index.vue"; */
import { useRoute, useRouter } from "vue-router";
import { Session } from "@/utils/storage";
import { LoginService, LoginType } from "@/api/login";
import { LoginModel } from "@/api/model/loginModel";
import { Response } from "@/api/interface";
import { setRem } from "@/utils/rem";
import { useCode } from "@/hooks/useCode";
import { encrypt } from "@/utils";
import { UserService } from '@/api/service/System/UserService'

const userService = new UserService()
const props = withDefaults(
  defineProps<{
    showValue: boolean;
  }>(),
  {
    showValue: false,
  }
);
const emits = defineEmits(["closeHandle", "changeLogin"]);
const loading = ref(false);
const store = useStore();
const route = useRoute();
const router = useRouter();
const clientServer = new LoginService();
const input = ref("");
const loginRules = reactive({
  userName: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }],
});
const loginForm = ref<InstanceType<typeof ElForm>>();
const smsText = ref("发送验证码");
const isDisabled = ref(false);
let timer: any = null;
const state = reactive({
  ruleForm: {
    userName: "",
    password: "",
    isVerify: false,
    code: "",
  },
  key: 0,
  checkHidden: true,
  visible: true,
});
const sliderVConf = reactive({
  flag: false,
  isShowSelf: false,
  isBorder: true,
  isCloseBtn: true,
  isReloadBtn: true,
  isParentNode: false,
});
const imgUrl = ref("");
const loginType = ref<LoginType>("password");
const random = (max: number, min: number): number => {
  return Math.floor(Math.random() * (min - max) + max);
};
setRem();
window.onresize = function () {
  setRem();
};
const init = async () => {
  let { iconUrl } = Session.get("appConfig").urls;
  imgUrl.value = iconUrl + `/static/verification/${random(4, 1)}.jpg`;
  state.visible = sessionStorage.getItem("token") ? false : true
};
init();
const emitChange = (status: string) => {
  if (status === "success") {
    sliderVConf.flag = true;
    sliderVConf.isShowSelf = false;
    login();
  }
};

const getThemeConfig = computed(() => {
  return store.state.themeConfig.themeConfig;
});

const isCanLogin = () => {
  loginForm.value!.validate((valid, fields) => {
    if (valid) {
      sliderVConf.isShowSelf = true;
    } else {
      console.log("error submit!", fields);
    }
  });
};
const checkToken = ()=>{
  return new Promise((resolve,reject)=>{
    userService.getUserByToken().then((res) => {
      if (res.code === 200 && res.data.id) {
        resolve(true)
      }else{
        reject(res.message)
      }
    })
  })
}

const login = () => {
  loading.value = true;
  let loginCount = Session.get("loginCount");

  if (loginCount >= 3) {
    ElMessage.error("连续登入失败3次，账号已锁定请过10分钟再登入!");
    loading.value = false;
    return;
  }
  let { isEncrypt } = Session.get("appConfig");
  let data = {
    userName: state.ruleForm.userName,
    passWord: state.ruleForm.password,
  };
  let FnName: keyof typeof clientServer = "signIn";
  if (isEncrypt !== "0") {
    data = {
      userName: encrypt(state.ruleForm.userName),
      passWord: encrypt(state.ruleForm.password),
    };
    FnName = "loginEncrypt";
  }

  clientServer[FnName](data, loginType.value)
    .then((res: any) => {
      
      if (res.code == 200) {
        let data = res.data;
        if (res.data === null) {
          loading.value = false;
          ElMessage.error(res.message);
        } else {
          loading.value = false;
          sessionStorage.setItem("token", data.token);
          try {
            checkToken().then(()=>{
              // 存储 token 到浏览器缓存
              // debugger
              emits("closeHandle");
              ElMessage.success("登陆成功");
                
                // 存储用户信息到浏览器缓存
                Session.set("userInfo", data);
                useCode();
                // emit("changePwd", data.changePassword === "1");
                // emit("isCanJump", data.secondSignIn === "1");
                
                emits("changeLogin");
            }).catch((err)=>{
                ElMessage.error(err)
            })
          } catch (ex) {
            loading.value = false;
          }
        }
      } else {
        loading.value = false;
        Session.set("loginCount", ++loginCount);
        ElMessage.error(res.message);
      }
    })
    .catch((err) => {
      // emits("closeHandle");
      loading.value = false;
    });
};
const accountClick = () => {
  loginType.value = "password";
  state.checkHidden = !state.checkHidden;
  state.ruleForm.userName = "";
  state.ruleForm.password = "";
  loginRules.userName = [{ required: true, trigger: "blur", message: "请输入用户名" }];
  loginRules.password = [{ required: true, trigger: "blur", message: "请输入密码" }];
};
const phoneClick = () => {
  loginType.value = "sms_code";
  state.checkHidden = !state.checkHidden;
  state.ruleForm.userName = "";
  state.ruleForm.password = "";
  // loginForm.value!.clearValidate()
  loginRules.userName = [{ required: true, trigger: "blur", message: "请输入手机号" }];
  loginRules.password = [{ required: true, trigger: "blur", message: "请输入验证码" }];
};
const forgetName = () => {};
const forgetPassWord = () => {
  // ElMessageBox.prompt('使用此功能后新密码将会以短信形式发送至用户手机，您可以使用短信中密码重新登陆。请在下方确定用户名', '忘记密码', {
  //   confirmButtonText: '确认',
  //   cancelButtonText: '取消',
  //   inputErrorMessage: '请确认用户名',
  //   inputValidator: (value)=>{
  //     console.log(value);
  //     if(value && value === state.ruleForm.userName){
  //       return true
  //     }else{
  //       return false
  //     }
  //   }
  // }).then(({ value }) => {
  //   userServer.resetPassword(state.ruleForm.userName).then((res) => {
  //     ElMessage({
  //       type: res.code == 200 ? 'success' : 'error',
  //       message: res.message
  //     })
  //   })
  // })
};
const countdown = () => {
  isDisabled.value = true;
  let downNum = 60;
  console.log("object");
  timer = setInterval(() => {
    downNum--;
    smsText.value = `请在${downNum}秒后尝试`;
    if (downNum === 0) {
      clearInterval(timer);
      isDisabled.value = false;
      smsText.value = "获取验证码";
    }
  }, 1000);
};
const sendSmsCode = () => {
  if (state.ruleForm.userName === "") {
    ElMessage.error("请输入手机号！");
    return;
  }
  const telReg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
  if (!telReg.test(state.ruleForm.userName)) {
    ElMessage.error("请输入正确的手机号！");
    return;
  } else {
    clientServer.getSmsCode(state.ruleForm.userName).then((res) => {
      ElMessage({
        type: res.code === 200 ? "success" : "error",
        message: res.message,
      });
      if (res.code === 200) {
        ElMessage.success("验证码已发送！");
        countdown();
      }
    });
  }
};
watch(
  () => props.showValue,
  (value) => {
    state.visible = value;
  }
);
</script>
<style scoped lang="scss">


.checkText {
  width: 35%;
  font-size: 22px;
  line-height: 26px;
  font-family: "Noto Sans CJ Ksc";
  cursor: pointer;
  color: #2d2d2d;
}

.cancelText {
  width: 35%;
  font-size: 22px;
  line-height: 26px;
  font-family: "Noto Sans CJ Ksc";
  cursor: pointer;
  color: #a5a5a5;
}

.phone {
  margin-left: 15px;
}

.mark {
  position: absolute;
  width: 100%;
  height: 20px;
  bottom: 10px;
  right: 70px;
  font-size: $font-size-12;
  color: #061b2e;
  line-height: 20px;
  text-align: right;
  background-color: transparent;
}

.login-popup-box {
  position: relative;
  width: 464px;
  height: 472px;
  background-color: rgba($color: #ffff, $alpha: 0.302);
  padding: 20px;
  border-radius: 4px;

  .login-info {
    width: 100%;
    height: 100%;
    float: left;
    display: flex;
    align-items: center;
    // justify-content: space-evenly;
    flex-flow: column;
    background-color: rgba($color: #ffff, $alpha: 0.902);
    border-radius: 4px;
    padding: 10px 40px;
    box-sizing: border-box;

    ::v-deep(.el-tabs__header) {
      height: 60px;
    }

    .textBtnBox {
      width: 100%;
      float: left;
      display: flex;
      justify-content: space-between;

      .bottomText {
        font-size: $font-size-12;
        color: #6b6f77;
        font-weight: 300;
      }
    }

    .system-box {
      width: 100%;
      height: 80px;
      float: left;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;

      .logo {
        width: 80px;
        height: 80px;
        float: left;
        background: url("@/assets/logo.png") no-repeat;
        background-position: center;
        background-size: 70px 70px;
        margin-left: -30px;
      }

      .title {
        width: auto;
        height: 100%;
        float: left;
        line-height: 80px;
        font-size: 28px;
        // font-family: SourceHanSansCN-Bold;
        color: #176cb6;
        font-family: "Noto Sanc CJK SC";
        letter-spacing: 5px;
        font-weight: 500;
      }
    }

    .checkBox {
      width: 100%;
      height: 30px;
      display: flex;
      float: left;
      margin-bottom: 10px;

      .account {
        width: 30%;
        font-size: 22px;
        line-height: 26px;
        color: #2d2d2d;
        font-family: "Noto Sans CJ Ksc";
        text-align: left;
        cursor: pointer;
      }

      .phone {
        margin-left: 15px;
      }
    }

    .accountBox {
      width: 100%;
      margin-bottom: 50px;

      ::v-deep(.el-form-item) {
        width: 100%;

        .el-input {
          --el-input-border-color: #53adfb;
        }

        .el-input__inner {
          height: 43px;
          // padding-left: 60px;
          border-radius: 0px;
          font-size: $font-size-20;
          box-shadow: inset 0 0 0 1000px white !important;
          // background-color: transparent !important;
        }
      }
    }
    
    .phoneBox {
      width: 100%;
      margin-bottom: 50px;

      ::v-deep(.el-form-item) {
        width: 100%;

        .el-input {
          --el-input-border-color: #53adfb;
        }

        .el-input__inner {
          height: 43px;
          // padding-left: 60px;
          // border-radius: 10px;
          border-radius: 0px;
          font-size: $font-size-20;
        }
      }

      .codeBox {
        height: 43px;
        width: 95%;
        color: #53adfb;
        border-color: #53adfb !important;
      }
    }

    .demo-tabs {
      width: 100%;

      ::v-deep(.el-tabs__nav-wrap::after) {
        position: static !important;
      }
    }

    .bottom {
      width: 100%;
      height: 50px;
      float: left;
      background: #45a2f2;
      // border: 2px solid #081937;
      // background-image: linear-gradient(to top right, #487de8, #2e6be5);
      // background-image: linear-gradient(to top right, #487de8, #1196db);
      box-sizing: border-box;
      // border-radius: 10px;
      color: #fff;
      font-size: 22px;
      font-family: SourceHanSansCN-Medium;
      letter-spacing: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .icon-box {
      width: 30px;
      height: 100%;
      float: left;
      padding-right: 15px;
      @include flex-box(center, center);

      .icon_box_child {
        width: 30px;
        height: 18px;
        border-right: 2px solid #45a2f2;

        .user {
          width: 18px;
          height: 18px;
          float: left;
          background: url("@/assets/login/user2.png") no-repeat;
          background-size: 100% 100%;
        }

        .password {
          width: 18px;
          height: 18px;
          float: left;
          background: url("@/assets/login/lock2.png") no-repeat;
          background-size: 100% 100%;
        }
      }
    }

    #plugin-slider-verify_containe {
      z-index: 100;
      position: absolute;
      left: 70px;
      top: 0;
      font-family: SourceHanSansCN-Bold;
      font-size: 14px;

      ::v-deep(#slider-verify) {
        background-color: white;
      }
    }

    .text-box {
      width: calc(100% - 80px);
      height: 100%;
      float: left;
      font-size: 30px;
      font-family: SourceHanSansCN-Medium;
      color: #6b6f77;
      padding: 10px;
      background: transparent;
      border: none;
      box-sizing: border-box;

      &::hover {
        border: none;
        box-sizing: border-box;
      }

      &::focus-visible {
        outline: none;
        border: none;
        box-sizing: border-box;
      }
    }
  }
}
</style>
