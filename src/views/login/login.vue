<template>
  <div class="login-container">
    <el-form :inline="true" :model="loginForm" class="form-inline" ref="loginFormRef">
      <el-form-item label="用户名:" prop="userName" v-if="!isLogin">
        <el-input v-model="loginForm.userName" size="small" />
      </el-form-item>
      <el-form-item label="密码:" prop="password" v-if="!isLogin">
        <el-input v-model="loginForm.password" type="password" size="small" />
      </el-form-item>
      <!-- <el-form-item>
      </el-form-item> -->
      <div class="tags">
        <el-button @click="submit" class="tag" :loading="loading" v-if="!isLogin"
          >登录</el-button
        >
        <el-button class="tag" v-if="isLogin" @click="router.push('/home')"
          >工作台</el-button
        >
        <el-button class="tag" v-if="isLogin" @click="logout">注销</el-button>
      </div>
      <div class="time">{{ time }}</div>
      <!-- <el-form-item>
      </el-form-item> -->
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import dayjs from "dayjs";
import { ref, reactive, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/store";
import { LoginService, LoginType } from "@/api/login";
import { LoginModel } from "@/api/model/loginModel";
import { ElMessage } from "element-plus";
import { useCode } from "@/hooks/useCode";
import { Session } from "@/utils/storage";
import Watermark from "@/utils/wartermark";
import { loadAppConfig } from "@/utils/loadJson";

const loading = ref(false);
const loginForm = reactive({
  userName: "",
  password: "",
});
const time = ref("");
const store = useStore();
const route = useRoute();
const router = useRouter();
const emit = defineEmits(["isCanJump", "changePwd"]);
const clientServer = new LoginService();
const loginFormRef = ref();
const isLogin = ref(false);

const submit = () => {
  if (!loginForm.userName) {
    ElMessage.warning("请输入用户名");
  } else if (!loginForm.password) {
    ElMessage.warning("请输入密码");
  } else {
    login();
  }
};

const login = () => {
  loading.value = true;
  let loginCount = Session.get("loginCount");

  if (loginCount >= 3) {
    ElMessage.error("连续登入失败3次，账号已锁定请过10分钟再登入!");
    loading.value = false;
    return;
  }

  clientServer
    .signIn(
      {
        userName: loginForm.userName,
        passWord: loginForm.password,
      },
      "password"
    )
    .then((res: any) => {
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
            sessionStorage.setItem("token", data.token);
            // 存储用户信息到浏览器缓存
            Session.set("userInfo", data);
            useCode();
            emit("changePwd", data.changePassword === "1");
            emit("isCanJump", data.secondSignIn === "1");
            loading.value = false;
            changeIsLogin();
            // if (route.query.redirect) {
            //   router.push({
            //     path: <string>route.query?.redirect,
            //     query:
            //       Object.keys(<string>route.query?.params).length > 0
            //         ? JSON.parse(<string>route.query?.params)
            //         : '',
            //   })
            // } else {
            //   router.push('/')
            // }
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
      loading.value = false;
    });
};
const logout = () => {
  store
    .dispatch("userInfos/LoginOut")
    .then(() => {
      Watermark.del();
      Session.clear();
      store.dispatch("routesList/setRoutesList", []);
      loadAppConfig().then((res) => {
        router.push({ path: res.data.portalPath });
      });
      nextTick(() => {
        location.reload();
      });
      changeIsLogin();
    })
    .catch((error) => {
      console.log(error);
    });
};
const getWeek = (val: number) => {
  let week = "";
  switch (val) {
    case 1:
      week = "星期一";
      break;
    case 2:
      week = "星期二";
      break;
    case 3:
      week = "星期三";
      break;
    case 4:
      week = "星期四";
      break;
    case 5:
      week = "星期五";
      break;
    case 6:
      week = "星期六";
      break;
    case 7:
    case 0:
      week = "星期日";
      break;
  }
  return week;
};
const changeIsLogin = () => {
  isLogin.value = sessionStorage.getItem("token") ? true : false;
};

const init = () => {
  time.value = dayjs().format("YYYY.MM.DD") + " " + getWeek(dayjs().day());
  changeIsLogin();
};
init();
</script>
<style scoped lang="scss">
input {
  outline: none;
}
.form-inline {
  display: flex;
  height: 100%;
  align-items: center;
  .el-form-item {
    padding: 0;
    margin-right: 25px;
    box-sizing: border-box;
    margin-bottom: 0;
    ::v-deep(label) {
      @include fontStyle(
        var(--sh3h-font-family),
        $font-size-16,
        var(--sh3h-home-login-label)
      );
    }
    ::v-deep(.el-form-item__content) {
      width: 130px;
    }
  }
  .tags {
    display: flex;
    .tag {
      @include fontStyle(
        var(--sh3h-font-family),
        $font-size-16,
        var(--sh3h-head-font-color)
      );
      padding: 0px 10px;
      border: 1px solid var(--el-color-primary);
      line-height: 26px;
      height: 26px;
      border-radius: 3px;
      background-color: transparent;
      margin-right: 10px;
      &:nth-child(1) {
        background-color: var(--el-color-primary);
      }
    }
  }
  .time {
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-16,
      var(--sh3h-head-font-color)
    );
    margin: 0 20px 0;
    white-space: nowrap;
  }
}
</style>
