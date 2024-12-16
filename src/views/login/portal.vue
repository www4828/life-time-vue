<template>
  <div class="portal-container">
    <div class="navbar"><Navbar @change="changeTag" @changeLogin="()=>{state.isLogin = true;init()}" /></div>
    <div class="skeleton" v-if="!state.isLogin" >
      <el-skeleton :rows="5"/>
    </div>
    <component :is="currentComponents" v-else />
    <div class="newsBottom">
      <div class="link">
        <div class="linkTitle">友情链接 :</div>
  
        <div class="linkContent">
          <div v-for="(item, index) in state.linkData" class="linkItem">
            <span @click="openLink(item)" style="cursor: pointer">{{
              item.NAME
            }}</span>
          </div>
        </div>
      </div>
      <div class="split"></div>
      <div class="copyright">版权所有：上海市12319城建服务热线中心</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useStore } from '@/store'
import { computed, reactive, ref, nextTick, markRaw } from 'vue'
import { PortalModel } from '@/api/model/portalModel'
import { NewsService } from '@/api/service/Portal/NewsService'
import Navbar from "@/views/login/components/portalTitle.vue";
import WorkIndicates from "@/views/login/components/workIndicates.vue";
import HotlineBriefing from "@/views/login/components/hotlineBriefing.vue";
import PolicyDocument from "@/views/login/components/policyDocument.vue";
import PlatformDynamics from "@/views/login/components/PlatformDynamics.vue";

const newsSever = new NewsService()
const store = useStore();
const getThemeConfig = computed(() => {
  return store.state.themeConfig.themeConfig;
});
const state = reactive({
  linkData: [] as PortalModel[],
  esToken: '',
  isLogin: false
})
const currentComponents: any = ref();
const componentList: any = {
  WorkIndicates: markRaw(WorkIndicates),
  PolicyDocument: markRaw(PolicyDocument),
  PlatformDynamics: markRaw(PlatformDynamics),
  HotlineBriefing: markRaw(HotlineBriefing)
}

// 友情链接
const getLinkData = () => {
  newsSever.getEsData('40').then((res) => {
    if (res.values?.length > 0) {
      state.linkData = res.values
    }
  })
}
const openLink = (item: any) => {
  window.open(item.URL, 'blank')
}
const changeTag = (component:string)=>{
  nextTick(() => {
    currentComponents.value = eval(componentList[component]);
  });
}

const init = () => {
  if(sessionStorage.getItem('token')){
    state.isLogin = true
    newsSever.postEsToken().then((res) => {
      sessionStorage.setItem('esToken', res.access_token)
      state.esToken = res.access_token
      getLinkData()
      changeTag('WorkIndicates')
    }).catch(()=>{
      changeTag('WorkIndicates')
    })
  }else{
    state.isLogin = false
  }
}
init()
</script>
<style scoped lang="scss">
.portal-container {
  width: 100%;
  height: 100%;
  background: url('@/assets/protal/1.png') no-repeat center/100% 100%;
  position: relative;
  box-sizing: border-box;
  // padding: 0 350px;
  .navbar {
    width: 100%;
    height: 6.5%;
    padding: 0 350px;
    box-sizing: border-box;
  }
  .newsBottom {
    padding: 0 350px;
    width: 100%;
    height: 50px;
    box-sizing: border-box;
    background-color: #255ba5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    @include fontStyle(
      var(--sh3h-font-family-normal),
      $font-size-14,
      var(--sh3h-head-font-color)
    );
    .link{
      display: flex;
      .linkContent {
          display: flex;
  
          .linkItem {
            margin: 0 15px;
  
            > span {
              display: block;
            }
            > a {
              color: #ffffff !important;
            }
          }
        }
    }

    .split{
      width: 1px;
      height: 18px;
      background-color: #ffffff;
    }
  }
  .skeleton{
    width: 100%;
    height: 50%;
    background: url('@/assets/protal/gzts.png') no-repeat left bottom;
    padding: 0 500px;
    box-sizing: border-box;
    position: absolute;
    bottom: 30px;
  }
}
</style>

