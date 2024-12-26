<template>
  <div class="wrapper">
    <RoleLayout>
      <template #search>
        <div class="sh3h-search-box div-flex-column">
          <el-row>
            <el-col :span="7">
              <span class="sh3h-search-lable div-flex-right">消息内容:</span>
              <el-input class="sh3h-search-input" v-model.trim="searchModel[0].value" />
            </el-col>
            <el-col :span="8">
              <span class="sh3h-search-lable div-flex-right">消息状态:</span>
              <el-select class="sh3h-search-input" v-model.trim="searchModel[1].value">
                <el-option label="已发送" value="2" />
                <el-option label="未发送" value="1" />
              </el-select>
              <!-- 未发送1 已发送2 -->
            </el-col>
            <el-col :span="8">
              <span class="sh3h-search-lable div-flex-right">发送渠道:</span>
              <el-select class="sh3h-search-input" v-model.trim="searchModel[2].value">
                <el-option v-for="item in sendChannelTypes" :label="item.codeName" :value="item.codeValue" />
              </el-select>
            </el-col>


          </el-row>
          <el-row>
            <el-col :span="7">
              <span class="sh3h-search-lable div-flex-right">接收对象:</span>
              <el-input class="sh3h-search-input" v-model.trim="searchModel[3].value" />
            </el-col>
            <el-col :span="8">
              <span class="sh3h-search-lable div-flex-right">发送时间:</span>
              <div class="search-input div-flex-row">
                <el-date-picker class="div-flex-left" @change="changeData(true)" v-model="searchModel[4].value"
                  type="datetime" format=" YYYY-MM-DD HH:mm " value-format=" YYYY-MM-DD HH:mm" clearable />
                <div class="concatIcon">—</div>
                <el-date-picker v-model="searchModel[5].value" type="datetime" :editable="false" @change="changeData(false)"
                  format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" clearable />
              </div>
            </el-col>
            <el-col :span="8" class="div-flex-right">
              <el-button type="primary" :icon="Search" @click="searchHandle">搜索</el-button>

            </el-col>
          </el-row>
        </div>
      </template>
      <template #table>
        <div class="tableWrapper">
          <div class="buttonBox">
            <el-button type="primary" @click="push">消息推送</el-button>
            <el-button type="primary" @click="moulds">模板管理</el-button>
            <el-button type="primary" @click="distributionList">通讯录管理</el-button>
          </div>
          <div class="tableContent">
            <el-table :data="tableData.list" style="width:100%" height="100%"
              :header-cell-style="{ 'text-align': 'center', }" :cell-style="{ 'text-align': 'center' }">
              <el-table-column prop="content" label="消息内容" show-overflow-tooltip min-width="30%" />
              <el-table-column prop="receiver" label="接收对象" show-overflow-tooltip min-width="30%" />
              <el-table-column prop="createTime" label="发送时间" min-width="15%">
              </el-table-column>
              <el-table-column prop="" label="消息状态" min-width="10%">
                <template #default="scope">
                  <el-tag :type="scope.row.status == '1' ? 'danger' : 'success'" effect="plain">
                    {{ scope.row.status == "1" ? "未发送" : "已发送" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="15%">
                <template #default="scope">
                  <ButtonGropup :row="scope.row" :list="tableData.buttonList" @dropdownClick="editHandle"
                    @commandClick="commandClick" />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pageWrapper">
            <Pagination :currentPage="searchParamsModel.pageParams.pageIndex"
              :pageSize="searchParamsModel.pageParams.pageSize" :total="searchParamsModel.pageParams.total"
              :callBack="paginationChange" layout="prev,pager,next,slot" />
          </div>
        </div>


      </template>
    </RoleLayout>
    <DistributionDialog :dialogVisible="distributionListData.dialogHidden" @closeDialog="closeDistributionDialog">
    </DistributionDialog>
    <MessagesDialog ref="messageDialog" :dialogVisible="messagesData.dialogHidden" @closeDialog="closeMessageDialog"
      :againFlag="messagesData.isAgain" :formData="messagesData.formData">
    </MessagesDialog>
    <MouldsDialog :dialogVisible="mouldsData.dialogHidden" @closeDialog="closeMouldsDialog"></MouldsDialog>
    <DetailDialog :formData="detailData.formData" :dialogVisible="detailData.dialogHidden"
      @closeDialog="closeDetailDialog" />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus, Setting, RefreshLeft } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import Pagination from "@/components/pagination/index.vue";
import { LogModel } from "@/api/model/logModel";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";

import DistributionDialog from "./components/DistributionDialog.vue";
import MessagesDialog from "./components/MessagesDialog.vue";
import MouldsDialog from "./components/MouldsDialog.vue";
import { SmsSendModel } from "@/api/model/smsSendModel";
import { SmsSendService } from "@/api/service/Sms/SmsSendService";
import ButtonGropup from '@/components/ButtonGroup/ButtonGropup.vue'
import DetailDialog from "./components/DetailDialog.vue";
import { useCode } from "@/hooks/useCode";

interface PageInfo {
  currentPage: number;
  pageSize: number;
}
const tableData = reactive({
  list: [],
  buttonList: [
    { name: "查看", id: "" },
    { name: "重发", id: "" },
  ]
})
const { sendChannelTypes } = useCode();

const searchParamsModel = reactive(new SearchParamsModel<SmsSendModel>());
const smsSendService = new SmsSendService()
const searchModel = ref<SearchModel<SmsSendModel>[]>([
  {
    key: "content",
    value: '',
    match: "like",
  },
  {
    key: "status",
    value: '',
    match: "like",
  },
  {
    key: "sendChannel",
    value: '',
    match: "eq",
  },
  {
    key: "receiver",
    value: '',
    match: "like",
  },
  {
    key: "createTime",
    value: "",
    match: "gt",
  },
  {
    key: "createTime",
    value: "",
    match: "lt",
  },
  {
    key: "createTime",
    value: "createTime",
    match: "orderByDesc",
  },

]);
const changeTime = (time: string) => {
  var str = time.slice(0, 19).replace('T', ' ')
  return str
}
const searchHandle = () => {
  searchParamsModel.searchParams = searchModel.value
  searchParamsModel.pageParams.pageSize = 15;
  smsSendService.list(searchParamsModel).then((res: Response) => {
    if (res.code == 200) {
      const { pageInfo, results } = res.data
      results.forEach((item: any) => {
        item.createTime = changeTime(item.createTime)
      });
      tableData.list = results
      searchParamsModel.pageParams.total = pageInfo.total;
    }
  })

}
searchHandle()
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = 15;
  searchHandle();
};

// 模板管理
const mouldsData = reactive({
  dialogHidden: false,
})
const moulds = () => {
  mouldsData.dialogHidden = true
}
const closeMouldsDialog = () => {
  mouldsData.dialogHidden = false

}

// 短信推送
const messagesData = reactive({
  dialogHidden: false,
  formData: {},
  isAgain: false,
})
const push = () => {
  messagesData.dialogHidden = true
  messagesData.isAgain = false
}
const messageDialog = ref()
const closeMessageDialog = () => {
  messagesData.dialogHidden = false
  messagesData.isAgain = false
  messageDialog.value.clean()
  searchHandle()
}
// 通讯录管理
const distributionListData = reactive({
  dialogHidden: false,

})
const distributionList = () => {
  distributionListData.dialogHidden = true
}
const closeDistributionDialog = () => {
  distributionListData.dialogHidden = false
}
const compareDate = (d1: string, d2: string) => {
  return ((new Date(d1.replace(/\-/g, "\/"))) > (new Date(d2.replace(/\-/g, "\/"))));
}
const changeData = (flag: boolean) => {
  if (flag) {
    if (searchModel.value[5].value) {
      if (compareDate(searchModel.value[4].value as string, searchModel.value[5].value as string)) {
        searchModel.value[4].value = "";
        ElMessage.error("开始时间不能大于结束时间！");
      }
    }
  } else {
    if (searchModel.value[4].value) {
      if (compareDate(searchModel.value[4].value as string, searchModel.value[5].value as string)) {
        searchModel.value[5].value = "";
        ElMessage.error("结束时间不能小于开始时间！");
      }
    }
  }
}
const detailData = reactive({
  formData: {},
  dialogHidden: false
})
const closeDetailDialog = () => {
  detailData.dialogHidden = false
}
const editHandle = (row: any) => {
  console.log('1')
  detailData.formData = row
  detailData.dialogHidden = true
}
const commandClick = (command: string, row: any) => {
  console.log('row', row)
  messagesData.dialogHidden = true
  messagesData.isAgain = true
  messagesData.formData = JSON.parse(JSON.stringify(row))
}

</script>
<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
}

.sh3h-search-box {
  background-color: var(--lt-tree-background-color);
  margin: 0;
}

::v-deep(.table) {
  height: calc(100% - 100px) !important;
}

.search-input {
  width: calc(100% - 165px);
  height: 100%;
  float: left;
  margin: 0 0 0 3px;
}

::v-deep(.el-date-editor) {
  width: calc(100% - 110px);
  height: 100%;
  float: left;
  margin: 0 0 0 10px;
}

.concatIcon {
  font-size: $font-size-14;
  font-weight: 500;
  margin: 0 5px;
}

.tableWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 10px;

  .buttonBox {
    display: flex;
    margin-bottom: 10px
  }

  .tableContent {
    flex: 1;
    height: calc(100% - 100px);
  }

  .pageWrapper {
    margin-top: 10px;
  }
}
</style>