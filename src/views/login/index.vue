<template>
  <div class="login-container">
    <div class="login-box">
      <el-form class="login-info" :model="ruleForm" :rules="loginRules" ref="loginForm">
        <div class="system-box">
          <div class="logo" v-show="getThemeConfig.isShowLogo"></div>
          <div class="title">{{ getThemeConfig.globalTitle }}</div>
        </div>
        <div class="checkBox">
          <div
            :class="checkHidden == true ? 'checkText' : 'cancelText'"
            @click="accountClick"
          >
            账号登录
          </div>
          <div
            :class="checkHidden == false ? 'checkText' : 'cancelText'"
            @click="phoneClick"
          >
            手机号登录
          </div>
        </div>
        <div class="accountBox" v-show="checkHidden">
          <el-form-item prop="userName">
            <el-input
              placeholder="用户名"
              v-model="ruleForm.userName"
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
              v-model="ruleForm.password"
              name="password"
              type="password"
              tabindex="1"
              auto-complete="on"
              @keyup.enter="isCanLogin"
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
        <div class="phoneBox" v-show="!checkHidden">
          <el-form-item prop="userName">
            <el-input
              placeholder="请输入手机号"
              v-model="ruleForm.userName"
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
                  v-model="ruleForm.password"
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
        <div class="textBtnBox" v-show="checkHidden">
          <el-button type="text" class="bottomText" @click="forgetName"
            >忘记账号名</el-button
          >
          <el-button type="text" class="bottomText" @click="forgetPassWord"
            >忘记密码</el-button
          >
        </div>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  ref,
  toRefs,
  nextTick,
  onBeforeUnmount,
  onBeforeMount,
} from "vue";
import { useStore } from "@/store";
import { ElMessage, ElForm } from "element-plus";
/* import SliderVerification from "@/components/sliderVerification/index.vue"; */
import { useRoute, useRouter } from "vue-router";
import { Session } from "@/utils/storage";
import { LoginService, LoginType } from "@/api/login";
import { LoginModel } from "@/api/model/loginModel";
import { Response } from "@/api/interface";
import { setRem } from "@/utils/rem";
import { useCode } from "@/hooks/useCode";
export default defineComponent({
  name: "loginNew",
  components: {},
  setup() {
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

    const verifySuccess = (status: boolean) => {
      state.ruleForm.isVerify = status;
    };
    const getCode = (code: string) => {
      state.ruleForm.code = code;
    };
    const isCanLogin = () => {
      loginForm.value!.validate((valid:boolean) => {
        if (valid) {
          sliderVConf.isShowSelf = true;
        }
      });
    };
    const login = () => {
      if (sliderVConf.flag) {
        loading.value = true;

        // if (route.query.redirect) {
        //   router.push({
        //     path: <string>route.query?.redirect,
        //     query:
        //       Object.keys(<string>route.query?.params).length > 0
        //         ? JSON.parse(<string>route.query?.params)
        //         : "",
        //   });
        // } else {
        //   router.push({});
        // }

        // loading.value = false;
        let clientLoginModel: LoginModel = {
          userCode: state.ruleForm.userName,
          passWord: state.ruleForm.password,
        };
        clientServer
          .signIn(clientLoginModel, loginType.value)
          .then((res: Response) => {
            if (res.code == 200) {
              let data = res.data;
              if (res.data === null) {
                loading.value = false;
                ElMessage.error(res.message);
              } else {
                ElMessage.success("登陆成功");
                try {
                  // 存储 token 到浏览器缓存
                  // debugger
                  sessionStorage.setItem("token", data.authToken.access_token);
                  // 存储用户信息到浏览器缓存
                  Session.set("userInfo", data.userDetail);
                  Session.set("authToken", data.authToken);
                  // const { hasLockCase } = useLock();
                  // hasLockCase();
                  // useCode();
                  if (route.query.redirect) {
                    router.push({
                      path: <string>route.query?.redirect,
                      query:
                        Object.keys(<string>route.query?.params).length > 0
                          ? JSON.parse(<string>route.query?.params)
                          : "",
                    });
                  } else {
                    router.push("/");
                  }
                } catch (ex) {
                  loading.value = false;
                }
              }
            } else {
              loading.value = false;
              ElMessage.error(res.message);
            }
          })
          .catch((err) => {
            loading.value = false;
          });
      }
    };
    const accountClick = () => {
      loginType.value = "password";
      state.checkHidden = !state.checkHidden;
      state.ruleForm.userName = "";
      state.ruleForm.password = "";
      loginRules.userName = [
        { required: true, trigger: "blur", message: "请输入用户名" },
      ];
      loginRules.password = [{ required: true, trigger: "blur", message: "请输入密码" }];
    };
    const phoneClick = () => {
      loginType.value = "sms_code";
      state.checkHidden = !state.checkHidden;
      state.ruleForm.userName = "";
      state.ruleForm.password = "";
      // loginForm.value!.clearValidate()
      loginRules.userName = [
        { required: true, trigger: "blur", message: "请输入手机号" },
      ];
      loginRules.password = [
        { required: true, trigger: "blur", message: "请输入验证码" },
      ];
    };
    const forgetName = () => {};
    const forgetPassWord = () => {};
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

    return {
      login,
      verifySuccess,
      getThemeConfig,
      ...toRefs(state),
      loading,
      getCode,
      input,
      sliderVConf,
      emitChange,
      imgUrl,
      isCanLogin,
      loginRules,
      loginForm,
      accountClick,
      phoneClick,
      forgetName,
      forgetPassWord,
      sendSmsCode,
      smsText,
      isDisabled,
    };
  },
});
</script>
<style scoped lang="scss">
input {
  outline: none;
}

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

.login-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;
  background: url("@/assets/login/newLogin_bg.jpg") no-repeat #dbdde4;
  background-size: 100% 100%;

  .login-box {
    position: relative;
    width: 464px;
    height: 472px;
    margin-right: 230px;
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
            border-radius: 0px;
            font-size: $font-size-20;
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
}
</style>
