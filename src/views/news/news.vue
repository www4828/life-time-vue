<template>
  <div class="news">
    <div class="newsNavBar">
      <div class="login-box">
        <div class="title">{{ getThemeConfig.globalTitle }}门户</div>
      </div>
      <div class="login-wrap">
        <Login @isCanJump="isCanJump" @changePwd="changePwd" />
      </div>
    </div>
    <Scrollbar class="caseWrapper">
      <div class="newsLY">
        <NewsLayout>
          <template #today>
            <!-- 今日情况 -->
            <Title title="今日情况">
              <template #content>
                <TodaySituation v-if="state.esToken" />
              </template>
            </Title>
          </template>
          <template #tips>
            <!-- 工作提示 -->
            <WorkTips v-if="state.esToken" />
          </template>
          <template #overAll>
            <!-- 总体情况 -->
            <OverAll v-if="state.esToken" />
          </template>
          <template #dispose>
            <!-- 处置情况 -->
            <Table v-if="state.esToken"></Table>
          </template>
          <template #workReport>
            <!-- 工作简报 -->
            <WorkBrief v-if="state.esToken" />
          </template>
          <template #files>
            <!-- 相关文件 -->
            <RelatedDocuments v-if="state.esToken" />
          </template>
        </NewsLayout>
      </div>
      <div class="newsBottom">
        <div class="link">
          <div class="linkTitle">友情链接</div>

          <div class="linkContent">
            <div v-for="(item, index) in state.linkData" class="linkItem">
              <span @click="openLink(item)" style="cursor: pointer"
                >· {{ item.NAME }}</span
              >
            </div>
          </div>
        </div>
        <div class="bottomTextBox">
          <div class="bottomText">
            <div>版权所有：上海市12319城建服务热线中心</div>
            <!-- <div>电话：64439252</div> -->
          </div>
        </div>
      </div>
    </Scrollbar>

    <SecondaryVerification
      :showFlag="loginControl.showFlag"
      @closeDialog="loginControl.showFlag = false"
    />
    <PasswordDialog
      :dialog-visible="loginControl.changePwd"
      @close="loginControl.changePwd = false"
    ></PasswordDialog>
  </div>
</template>
<script lang="ts" setup>
import { useStore } from "@/store";
import { computed, ref, onMounted, reactive } from "vue";
import Scrollbar from "@/components/scrollbar/index.vue";
import NewsLayout from "@/components/Layout/NewsLayout.vue";
import Title from "@/components/Title/Title.vue";
import TodaySituation from "@/views/news/components/TodaySituation.vue";
import OverAll from "@/views/news/components/OverAll.vue";
import WorkTips from "@/views/news/components/WorkTips.vue";
import WorkBrief from "@/views/news/components/WorkBrief.vue";
import RelatedDocuments from "@/views/news/components/RelatedDocuments.vue";
import PasswordDialog from "@/businessComponent/Password/index.vue";
import List from "./components/List.vue";
import Table from "./components/Table.vue";
import Login from "@/views/login/login.vue";
import { PortalModel } from "@/api/model/portalModel";
import { NewsService } from "@/api/service/Portal/NewsService";
import SecondaryVerification from "./components/SecondaryVerification.vue";

const newsSever = new NewsService();
const store = useStore();
const getThemeConfig = computed(() => {
  return store.state.themeConfig.themeConfig;
});
const state = reactive({
  linkData: [] as PortalModel[],
  esToken: "",
});
const loginControl = reactive({
  showFlag: false,
  changePwd: false,
});
// 友情链接
const getLinkData = () => {
  newsSever.getEsData("40").then((res) => {
    if (res.values?.length > 0) {
      state.linkData = res.values;
    }
  });
};

const openLink = (item: any) => {
  window.open(item.URL, "blank");
};
const isCanJump = (control: boolean) => {
  loginControl.showFlag = control;
};
const changePwd = (control: boolean) => {
  loginControl.changePwd = control;
};
const init = () => {
  newsSever.postEsToken().then((res) => {
    sessionStorage.setItem("esToken", res.access_token);
    state.esToken = res.access_token;
    getLinkData();
  });
};
init();
</script>
<style lang="scss" scoped>
$headHeight: 105px;

::v-deep(.title-box) {
  width: 100% !important;
}

::v-deep(.title-content-wrap) {
  height: 100% !important;
}

::v-deep(.titleWrapper) {
  height: 22px !important;
  font-size: $font-size-22;
}

::v-deep(.title) {
  &::before {
    width: 6px !important;
    height: 22px !important;
    background-color: #00468e !important;
  }
}

.news {
  width: 100%;
  height: 100%;
  background-color: var(--sh3h-background-color);

  .caseWrapper {
    width: 100%;
    height: calc(100% - 105px);
    // 2241px
  }

  .newsNavBar {
    width: 100%;
    height: $headHeight;
    float: left;
    background: url('@/assets/layout/nav-bg.png') no-repeat center/100% 100%;
    color: #ffffff;

    .login-box {
      // width: 100%;
      height: 100%;
      float: left;
      margin: 0 0 0 20px;

      .title {
        width: auto;
        height: 100%;
        float: left;
        font-size: $font-size-30;
        font-family: SourceHanSansCN-Bold;
        display: flex;
        justify-content: center;
        align-items: center;
        letter-spacing: 0px;
      }
    }

    .login-wrap {
      float: right;
      display: flex;
      height: 100%;
    }
  }

  .newsLY {
    width: 100%;

    .todayBox {
      width: 1050px;
      height: 311px;
      background-color: #ffffff;
    }

    .tipsBox {
      width: 800px;
      height: 311px;
      background-color: #ffffff;
    }

    .disposeBox {
      width: 925px;
      height: 475px;
      // height: 100%;
      background-color: #ffffff;
    }

    .publicBox {
      width: 925px;
      // height: 356px;
      height: 100%;
      background-color: #ffffff;
    }
  }

  .newsBottom {
    width: 100%;
    height: 278px;
    background-color: #c5e2ff;
    display: flex;
    flex-direction: column;

    .link {
      height: 208px;
      width: 100%;

      background-color: #255ba5;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;

      .linkTitle {
        font-size: $font-size-24;
        color: #fefeff;
        line-height: 30px;
        text-align: center;
      }

      .linkContent {
        padding-left: 200px;
        font-size: $font-size-20;
        color: #fefeff;
        line-height: 30px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .linkItem {
          // width: 300px;
          width: 25%;
          // margin-right: 150px;
          height: 40px;
          line-height: 40px;

          > span {
            display: block;
          }
          > a {
            color: #ffffff !important;
          }
        }
      }
    }

    .bottomTextBox {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .bottomText {
        height: 68px;
        width: 445px;
        font-size: $font-size-16;
        line-height: 30px;
        color: #061326;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding-top: 25px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
