<template>
  <div class="portal-title-container"  v-if="state.isLogin">
    <div class="system-box" >
      <div class="logo" v-show="getThemeConfig.isShowLogo"></div>
      <!-- <div class="title">{{ getThemeConfig.globalTitle }}</div> -->
      <div class="title">上海城建服务热线</div>
    </div>
    <div class="changeBox" v-if="state.isLogin">
      <div
        :class="['item', item.com === state.selected ? 'selected' : '']"
        v-for="item in state.list"
        :key="item.key"
        @click="change(item)"
      >
        {{ item.title }}
      </div>
    </div>
    
    <div class="userBox">
      <div class="loginIcon" @click="state.show=true" v-if="!state.isLogin">请登录</div>
      <div class="user" v-if="state.isLogin"  @click="router.push('/home')">
        欢迎，{{state.name}}
        <div class="logout"  @click="logout" >退出登录</div>
      </div>
    </div>
  </div>
  <el-skeleton class="portal-title-container" v-else  style="--el-skeleton-circle-size: 50px">
    <template #template>
      <div class="system-box" >
        <el-skeleton-item variant="circle" />
        <el-skeleton-item variant="p" :style="{width: '300px',margin: '0 10px'}" />
      </div>
      <div class="changeBox">
        <el-skeleton-item variant="p" v-for="item in state.list" :style="{width: '120px',margin: '0 10px'}"/>
      </div>
    </template>
  </el-skeleton>
  <loginPopup @changeLogin="loginHandle" :show-value="state.show" @closeHandle="state.show=false"/>
</template>
<script setup lang="ts">
import { useStore } from '@/store'
import { computed, reactive, ref } from 'vue'
import loginPopup from '@/views/login/components/loginPopup.vue'
import { Session } from '@/utils/storage'
import { nextTick } from 'vue'
import Watermark from "@/utils/wartermark";
import { loadAppConfig } from "@/utils/loadJson";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const store = useStore()
const emits = defineEmits(['change','changeLogin'])
const getThemeConfig = computed(() => {
  return store.state.themeConfig.themeConfig
})
const state = reactive({
  list: [
    { title: '工作提示', key: 'WORK INDICATES',com:'WorkIndicates' },
    { title: '热线简报', key: 'HOTLINE BRIEFING',com:'HotlineBriefing' },
    { title: '政策文件', key: 'POLICY DOCUMENT',com:'PolicyDocument' },
    { title: '平台动态', key: 'PLATFORM DYNAMICS',com:'PlatformDynamics' },
  ],
  selected: 'WorkIndicates',
  show: true,
  isLogin: false,
  name: ''
})
const changeIsLogin = () => {
  state.isLogin = sessionStorage.getItem("token") ? true : false;
};
const init = ()=>{
  changeIsLogin()
  const userinfo = Session.get('userInfo');
   state.name = userinfo ? userinfo.name : ''
}
init()
const change = (item: any) => {
  state.selected = item.com
  emits('change',item.com)
}

const loginHandle = ()=>{
  emits('changeLogin')
  state.isLogin = true
  const userinfo = Session.get('userInfo');
  state.name = userinfo.name
}
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
      changeIsLogin()
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>
<style scoped lang="scss">
.portal-title-container {
  height: 100%;
  display: flex;
  .system-box {
    height: 100%;
    display: flex;
    align-items: center;

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
      font-size: 24px;
      font-family: SourceHanSansCN-Bold;
      color: rgb(10, 55, 124);
      letter-spacing: 3px;
      white-space: nowrap;
    }
  }
  .changeBox {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: 30px;
    @include fontStyle(
      var(--sh3h-font-family-normal),
      $font-size-18,
      '#333333'
    );
    .item {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 25px;
      margin: 0 15px;
      white-space: nowrap;
      cursor: pointer;
    }
    .selected {
      background: url('@/assets/protal/selected.png') no-repeat center/100% 100%;
      color: rgb(254, 108, 6);
    }
  }
  .userBox {
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 180px;
    @include fontStyle(var(--sh3h-font-family-normal), $font-size-16, var(--sh3h-head-font-color));
    cursor: pointer;
    .loginIcon {
      // padding-left: 30px;
      letter-spacing: 3px;
      display: flex;
      align-items: center;
      &::before{
        content: ' ';
        width: 18px;
        height: 18px;
        background: url('@/assets/protal/user.png') no-repeat center/100% 100%;
        margin-right: 20px;
      }
    }
    .user{
      position: relative;
      display: flex;
      align-items: center;
      white-space: nowrap;
      &::before{
        content: ' ';
        width: 18px;
        height: 18px;
        background: url('@/assets/protal/user2.png') no-repeat center/100% 100%;
        margin-right: 10px;
      }
      
      .logout{
        position: absolute;
        color: #256faf;
        right: -200px;
        top: 0;
        display: flex;
        align-items: center;
        &::after{
          content: ' ';
          width: 18px;
          height: 18px;
          background: url('@/assets/protal/exit.png') no-repeat center/100% 100%;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
