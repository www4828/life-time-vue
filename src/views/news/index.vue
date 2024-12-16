<template>
  <div class="news">
    <div class="newsNavBar">
      <div class="login-box">
        <div class="title">{{ getThemeConfig.globalTitle }}门户</div>
      </div>
      <div class="login-wrap">
        <Login />
      </div>
    </div>
    <Scrollbar class="caseWrapper">
      <div class="newsLY">
        <NewsLayout>
          <template #today>
            <!-- 今日情况 -->
            <Title title="今日情况" class="">
              <template #content>
                <TodaySituation v-if="state.esToken" />
              </template>
            </Title>
          </template>
          <template #tips>
            <!-- 工作提示 -->
            <List title="工作提示" :lists="state.tipsData" :typeHidden="false"></List>
          </template>
          <template #order>
            <Title title="重要工单" >
              <template #content>
                <Orders v-if="state.esToken" />
              </template>
            </Title>
          </template>
          <template #overAll>
            <!-- 总体情况 -->
            <OverAll v-if="state.esToken" />
          </template>
          <template #dispose>
            <Table v-if="state.esToken"></Table>
          </template>
          <template #workReport>
            <List title="工作简报" :lists="state.workReportData" :typeHidden="true" @report="changeReport"></List>
          </template>
          <template #files>
            <List title="相关文件" :lists="state.filesData" :typeHidden="false"></List>
          </template>
        </NewsLayout>
      </div>
      <div class="newsBottom">
        <div class="link">
          <div class="linkTitle">友情链接</div>

          <div class="linkContent">
            <div v-for="(item, index) in state.linkData" class="linkItem">
              <span @click="openLink(item)">·{{ item.name }}</span>
              <!-- <a :href="item.url" target="_blank">·{{ item.name }}</a> -->
            </div>
          </div>
        </div>
        <div class="bottomTextBox">
          <div class="bottomText">
            <div>版权所有：上海市12319城建服务热线中心</div>
            <div>电话：64439252</div>
          </div>
        </div>
      </div>
    </Scrollbar>


  </div>
</template>
<script lang="ts" setup>
import { useStore } from '@/store'
import { computed, ref, onMounted, reactive } from 'vue'
import Scrollbar from '@/components/scrollbar/index.vue'
import NewsLayout from '@/components/Layout/NewsLayout.vue'
import Title from '@/components/Title/Title.vue'
import TodaySituation from '@/views/news/components/TodaySituation.vue'
import OverAll from '@/views/news/components/OverAll.vue'
import Orders from '@/views/news/components/Orders.vue'
import List from './components/List.vue'
import Table from './components/Table.vue'
import Login from '@/views/login/login.vue'
import { PortalModel } from "@/api/model/portalModel";
import { SearchModel } from "@/api/model/baseModel";
import { Response, SearchParamsModel } from "@/api/interface";
import { WorkRemindService } from "@/api/service/Portal/WorkRemindService";
import { JobBriefService } from "@/api/service/Portal/JobBriefService";
import { RelatedDocumentService } from "@/api/service/Portal/RelatedDocumentService";
import { LinkService } from "@/api/service/Portal/LinkService";
import { NewsService } from "@/api/service/Portal/NewsService";

const newsSever = new NewsService()
const store = useStore()
const getThemeConfig = computed(() => {
  return store.state.themeConfig.themeConfig
})
const state = reactive({
  tipsData: [],
  workReportData: [],
  filesData: [],
  linkData: [] as PortalModel[],
  esToken: ''
})
// 工作提示
const workRemindSever = new WorkRemindService()
const tipsSearchModel = reactive(new SearchParamsModel<PortalModel>());
const tipsSearch = ref<SearchModel<PortalModel>[]>([
  {
    key: "name",
    value: '',
    match: "like",
  },
  {
    key: "type",
    value: '',
    match: "eq",
  },
  {
    key: "noticeTime",
    value: '',
    match: "eq",
  },
  {
    key: "createTime",
    value: 'sort',
    match: "orderByDesc",
  },
  {
    key: "status",
    value: '1',
    match: "eq",
  },
])
const getTipsData = () => {
  tipsSearchModel.searchParams = tipsSearch.value;
  tipsSearchModel.pageParams.pageSize = 6;
  workRemindSever.list(tipsSearchModel).then((res: Response) => {
    if (res.code === 200) {
      console.log('res', res);
      const { results } = res.data;
      state.tipsData = results
    }
  })
}
getTipsData()


// 工作简报
const jobBriefSever = new JobBriefService()
const jobSearchModel = reactive(new SearchParamsModel<PortalModel>());
const reportSearch = ref<SearchModel<PortalModel>[]>([
  {
    key: "name",
    value: '',
    match: "like",
  },
  {
    key: "type",
    value: '',
    match: "eq",
  },
  {
    key: "noticeTime",
    value: '',
    match: "eq",
  },
  {
    key: "createTime",
    value: 'sort',
    match: "orderByDesc",
  },
  {
    key: "status",
    value: '1',
    match: "eq",
  },
])
const getWorkReportData = () => {
  jobSearchModel.searchParams = reportSearch.value;
  jobSearchModel.pageParams.pageSize = 11;
  jobBriefSever.list(jobSearchModel).then((res: Response) => {
    if (res.code === 200) {
      console.log('res', res);
      const { results } = res.data;
      state.workReportData = results
    }
  })
}
getWorkReportData()

// 相关文件
const filesSearch = ref<SearchModel<PortalModel>[]>([
  {
    key: "name",
    value: '',
    match: "like",
  },
  {
    key: "type",
    value: '',
    match: "eq",
  },
  {
    key: "noticeTime",
    value: '',
    match: "eq",
  },
  {
    key: "createTime",
    value: 'sort',
    match: "orderByDesc",
  },
  {
    key: "status",
    value: '1',
    match: "eq",
  },
])
const filesSever = new RelatedDocumentService()
const filesSearchModel = reactive(new SearchParamsModel<PortalModel>());
const getFilesData = () => {
  filesSearchModel.searchParams = filesSearch.value;
  filesSearchModel.pageParams.pageSize = 11;
  filesSever.list(filesSearchModel).then((res: Response) => {
    if (res.code === 200) {
      console.log('res', res);
      const { results } = res.data;
      state.filesData = results
    }
  })
}
getFilesData()
// 友情链接
const linkSearch = ref<SearchModel<PortalModel>[]>([
  {
    key: "name",
    value: '',
    match: "like",
  },

  {
    key: "createTime",
    value: 'sort',
    match: "orderByDesc",
  },
  {
    key: "status",
    value: '1',
    match: "eq",
  },
])
const linkSever = new LinkService()
const linkSearchModel = reactive(new SearchParamsModel<PortalModel>());
const getLinkData = () => {
  linkSearchModel.searchParams = linkSearch.value;
  linkSearchModel.pageParams.pageSize = 11;
  linkSever.list(linkSearchModel).then((res: Response) => {
    if (res.code === 200) {
      console.log('res', res);
      const { results } = res.data;
      state.linkData = results
    }
  })
}
getLinkData()

const openLink=(item:any)=>{
    window.open(item.url,"blank")
}
const changeReport=(type:string)=>{
  reportSearch.value[1].value=type
  getWorkReportData()
}


const init = ()=>{
  newsSever.postEsToken().then(res=>{
    sessionStorage.setItem('esToken',res.access_token)
    state.esToken = res.access_token
  })
}
init()
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
    background: url('@/assets/layout/nav-bg.png') repeat;
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

          >span {
            display: block;
          }
          >a{
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
