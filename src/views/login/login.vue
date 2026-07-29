<template>
  <div class="login-container">
    <div class="login-box">
      <el-form
        class="login-info"
        :model="state.ruleForm"
        :rules="loginRules"
        ref="loginForm"
      >
        <div class="system-box">
          <div class="logo" v-show="getThemeConfig.isShowLogo"></div>
          <div class="title">{{ getThemeConfig.globalTitle }}</div>
        </div>
        <!-- <div class="checkBox">
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
        </div> -->
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
       <!-- <slideVerify v-if="sliderVConf.isShowSelf" @success="emitChange('success')" @close="sliderVConf.isShowSelf = false"></slideVerify> -->
       
        <SliderVerification :show="sliderVConf.isShowSelf" @success="emitChange('success')"></SliderVerification>
        <el-button class="bottom" @click="isCanLogin" :loading="loading"
          >登录</el-button
        >
      </el-form>
    </div>
    <el-dialog
    :model-value="state.dialogVisible"
    title="请选择登陆部门"
    width="20%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="content">
      <el-radio-group v-model="state.activeDept">
        <el-radio
          :label="item.departmentCode"
          v-for="item in state.departments"
          :key="item.departmentCode"
        >
          {{ item.departmentName }}
        </el-radio>
      </el-radio-group>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="state.dialogVisible = false;loading = false; ">取消</el-button>
        <el-button type="primary" @click="saveDepartment"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import {
  computed,
  reactive,
  ref
} from 'vue'
import { useStore } from '@/store'
import { ElMessage, ElForm } from 'element-plus'
import SliderVerification from "vue3-puzzle-vcode";
import { useRoute, useRouter } from 'vue-router'
import { Session } from '@/utils/storage'
import { LoginService, LoginType } from '@/api/login'
import { LoginModel } from '@/api/model/loginModel'
import { Response } from '@/api/interface'
import { setRem } from '@/utils/rem'
import { DepartmentModel } from '@/api/model/departmentModel'
import images1 from '/static/verification/1.jpg'
import images2 from '/static/verification/2.jpg'
import images3 from '/static/verification/3.jpg'
import images4 from '/static/verification/4.jpg'

const loading = ref(false)
const store = useStore()
const route = useRoute()
const router = useRouter()
const clientServer = new LoginService()
const input = ref('')
const loginRules = reactive({
  userName: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }],
})
const loginForm = ref<InstanceType<typeof ElForm>>()

const imgs = ref<string[]>([]);
const state = reactive({
  ruleForm: {
    userName: '',
    password: '',
    isVerify: false,
    code: '',
  },
  key: 0,
  checkHidden: true,
  dialogVisible: false,
  activeDept: '',
  departments: [] as DepartmentModel[]
})
const sliderVConf = reactive({
  flag: false,
  isShowSelf: false,
  isBorder: true,
  isCloseBtn: true,
  isReloadBtn: true,
  isParentNode: false,
})
const loginType = ref<LoginType>('password')

setRem()
window.onresize = function () {
  setRem()
}
const init = async () => {
  imgs.value = [ images1, images2, images3, images4]
}
init()
const emitChange = (status: string) => {
  if (status === 'success') {
    sliderVConf.flag = true
    sliderVConf.isShowSelf = false
    login()
  }
}

const getThemeConfig = computed(() => {
  return store.state.themeConfig.themeConfig
})


const isCanLogin = () => {
  loginForm.value!.validate((valid: boolean) => {
    if (valid) {
      sliderVConf.isShowSelf = true
    }
  })
}
const login = () => {
  if (sliderVConf.flag) {
    loading.value = true;

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
              Session.set("departments", data.departments);
              Session.set("authToken", data.authToken);
              Session.set("activeDept", data.activeDept);
              state.departments = data.departments
              // const { hasLockCase } = useLock();
              // hasLockCase();
              // useCode();

              if(data.departments.length > 1){
                state.dialogVisible = true
              }else{
                goto()
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
}
const goto = () => {
  if (route.query.redirect) {
    router.push({
      path: <string>route.query?.redirect,
      query:
        Object.keys(<string>route.query?.params).length > 0
          ? JSON.parse(<string>route.query?.params)
          : '',
    })
  } else {
    router.push('/')
  }
}


const saveDepartment = ()=>{
  Session.set('activeDept',state.activeDept)
  clientServer.setUserActiveDept(state.ruleForm.userName, state.activeDept).then(res=>{
    state.dialogVisible = false
    goto()
  })
}
</script>
<style scoped lang="scss">
input {
  outline: none;
}

.checkText {
  width: 35%;
  font-size: 22px;
  line-height: 26px;
  font-family: 'Noto Sans CJ Ksc';
  cursor: pointer;
  color: #2d2d2d;
}

.cancelText {
  width: 35%;
  font-size: 22px;
  line-height: 26px;
  font-family: 'Noto Sans CJ Ksc';
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
  background: url('@/assets/login/newLogin_bg.jpg') no-repeat #dbdde4;
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
          background: url('@/assets/logo.png') no-repeat;
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
          font-family: 'Noto Sanc CJK SC';
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
          font-family: 'Noto Sans CJ Ksc';
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
            background: url('@/assets/login/user2.png') no-repeat;
            background-size: 100% 100%;
          }

          .password {
            width: 18px;
            height: 18px;
            float: left;
            background: url('@/assets/login/lock2.png') no-repeat;
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
