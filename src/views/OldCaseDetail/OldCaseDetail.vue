<template>
  <div class="oldCase">
    <div class="caseTitle">12345原始工单详情</div>
    <Scrollbar>
      <Title title="基本信息">
        <template #content>
          <el-form :model="caseInfo" class="from" ref="caseForm" label-width="120px">
            <el-row>
              <el-col :span="6">
                <el-form-item label="外系统编号">
                  <span>{{ caseInfo.wpid }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="来电时间">
                  <span>{{ caseInfo.hotdate }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="联系人">
                  <span>{{ caseInfo.relName }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="联系电话">
                  <span>{{ caseInfo.relPhoneno }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="派单时间">
                  <span>{{ caseInfo.date1 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="主办协办">
                  <span>{{ caseInfo.acceptflag }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="主办单位">
                  <span>{{ caseInfo.deptLevel2 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="办结时间要求">
                  <span>{{ caseInfo.limitTime }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="分类1级">
                  <span>{{ caseInfo.class1 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="分类2级">
                  <span>{{ caseInfo.class2 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="分类3级">
                  <span>{{ caseInfo.class3 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="分类4级">
                  <span>{{ caseInfo.class4 }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="工单类型">
                  <span>{{ caseInfo.wpType }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="工单来源">
                  <span>{{ caseInfo.wpSource }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="诉求地址">
                  <span>{{ caseInfo.relAddress }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="所属区域">
                  <span>{{ caseInfo.relDistrict }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-form-item label="内容描述">
                <span>{{ caseInfo.summary }}</span>
              </el-form-item>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="工单级别">
                  <span>{{ caseInfo.priority }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="客户类型">
                  <span>{{ caseInfo.wpCustomertype }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="服务类型">
                  <span>{{ caseInfo.wpServicetype }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="复核单标识">
                  <span>{{ caseInfo.callbackFlag }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-form-item label="附件信息">
                <span>{{ caseInfo.appealUpload }}</span>
              </el-form-item>
            </el-row>

            <el-row>
              <el-col :span="6">
                <el-form-item label="领导指派">
                  <span>{{ caseInfo.assignFlag }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="是否匿名">
                  <span>{{ caseInfo.ishidden }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="是否公开">
                  <span>{{ caseInfo.ispublic }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="是否信访">
                  <span>否</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="是否重复">
                  <span>{{ caseInfo.isrepeat }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="重复工单号">
                  <span>{{ caseInfo.rewpid }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </Title>
      <Title title="其他信息">
        <template #content>
          <el-form :model="otherForm" class="from" label-width="120px">
            <el-row>
              <el-col :span="6">
                <el-form-item label="工单标题">
                  <span>{{ otherForm.wpTitle }}</span>
                  <!-- <span>{{ caseInfo.wpTitle }}</span> -->
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="工单备注">
                  <span>{{ otherForm.note }}</span>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="处理描述">
                  <span>{{ otherForm.requirement }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="来电电话">
                  <span>{{ otherForm.phoneno }}</span>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="18">
                                <el-form-item label="市民原信内容">
                                    <span>{{ otherForm.appealContent }}</span>
                                </el-form-item>
                            </el-col> -->
            </el-row>
            <el-row>
              <el-form-item label="市民原信内容">
                <span>{{ otherForm.appealContent }}</span>
              </el-form-item>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="市民移动电话">
                  <span>{{ otherForm.mobile }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="市民证件类型">
                  <span>{{ otherForm.cardtype }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="来电市民姓名">
                  <span>{{ otherForm.customerName }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="来电市民地址">
                  <span>{{ otherForm.address }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="来电市民性别">
                  <span>{{ otherForm.gender }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="市民所在区域">
                  <span>{{ otherForm.district }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="市民证件号码">
                  <span>{{ otherForm.cardnum }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="电子邮件">
                  <span>{{ otherForm.email }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </Title>
      <Title title="退单信息">
        <template #content>
          <el-form :model="backForm" class="from" label-width="120px">
            <el-row>
              <el-col :span="6">
                <el-form-item label="已退单次数">
                  <span>{{ backForm.backCount }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="第一次退单部门">
                  <span>{{ backForm.backDept1 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="第一次退单时间">
                  <span>{{ backForm.backTime1 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="第一次退单理由">
                  <span>{{ backForm.backReason1 }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="第二次退单部门">
                  <span>{{ backForm.backDept2 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="第二次退单时间">
                  <span>{{ backForm.backTime2 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="第二次退单理由">
                  <span>{{ backForm.backReason2 }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                <el-form-item label="第三次退单部门">
                  <span>{{ backForm.backDept3 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="第三次退单时间">
                  <span>{{ backForm.backTime3 }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="第三次退单理由">
                  <span>{{ backForm.backReason3 }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </Title>
    </Scrollbar>
  </div>
</template>
<script lang="ts" setup>
import Title from "@/components/Title/TitleCollapse.vue";
import { useRoute } from "vue-router";
import Scrollbar from "@/components/scrollbar/index.vue";
import { FileAttachmentModel, NodeCodeKey } from "@/api/model/fileAttachmentModel";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { reactive, ref, computed } from "vue";
import { decrypt } from "@/utils";
const caseService = new CaseService();
const props = defineProps<{
  wpid: string;
}>();
const caseInfo = reactive({
  wpid: "",
  hotdate: "",
  relName: "",
  relPhoneno: "",
  date1: "",
  acceptflag: "",
  deptLevel2: "",
  limitTime: "",
  class1: "",
  class2: "",
  class3: "",
  class4: "",
  wpType: "",
  wpSource: "",
  relAddress: "",
  relDistrict: "",
  summary: "",
  priority: "",
  wpCustomertype: "",
  wpServicetype: "",
  callbackFlag: "",
  appealContent: "",
  appealUpload: "",
  assignFlag: "",
  ishidden: "",
  ispublic: "",
  isrepeat: "",
  rewpid: "",
  wpTitle: "",
});
const otherForm = reactive({
  wpTitle: "",
  note: "",
  requirement: "",
  phoneno: "",
  appealContent: "",
  mobile: "",
  cardtype: "",
  customerName: "",
  address: "",
  gender: "",
  district: "",
  cardnum: "",
  email: "",
});
const backForm = reactive({
  backNumber: "1",
  backCount: 0,
  backDept1: "",
  backDept2: "",
  backDept3: "",
  backReason1: "",
  backReason2: "",
  backReason3: "",
  backTime1: "",
  backTime2: "",
  backTime3: "",
});
const files = reactive<{ attachmentsInfo: FileAttachmentModel[] }>({
  attachmentsInfo: [],
});
const route = useRoute();
const wpid = computed(() => {
  const id = route.query.wpid as string;
  return id.length === 14 ? id : decrypt(route.query.wpid as string);
});
const getCaseInfo = () => {
  caseService.getSmrxHotJs(wpid.value).then((res) => {
    if (res.code == 200) {
      console.log("res", res);
      if (res.data != "") {
        caseInfo.wpid = res.data.wpid; //工单编号
        caseInfo.hotdate = res.data.hotdate; //来电时间
        caseInfo.relName = res.data.relName; //联系人
        caseInfo.relPhoneno = res.data.relPhoneno; //联系电话
        caseInfo.date1 = res.data.date1; //派单时间
        caseInfo.acceptflag = res.data.acceptflag == "0" ? "主办" : "协办"; //主办协办
        caseInfo.deptLevel2 = res.data.deptLevel2; //主办单位
        caseInfo.limitTime = res.data.limitTime; //办结时间要求
        caseInfo.class1 = res.data.class1; //分类1级
        caseInfo.class2 = res.data.class2; //分类2级
        caseInfo.class3 = res.data.class3; //分类3级
        caseInfo.class4 = res.data.class4; //分类4级
        caseInfo.wpType = res.data.wpType; //工单类型
        caseInfo.wpSource = res.data.wpSource; //工单来源
        caseInfo.relAddress = res.data.relAddress; //诉求地址
        caseInfo.relDistrict = res.data.relDistrict; //所属区域
        caseInfo.summary = res.data.summary; //内容描述
        if (res.data.priority == "0") {
          caseInfo.priority = "紧急"; //工单级别
        } else if (res.data.priority == "1") {
          caseInfo.priority = "普通"; //工单级别
        } else if (res.data.priority == "2") {
          caseInfo.priority = "信访"; //工单级别
        } else if (res.data.priority == "3") {
          caseInfo.priority = "紧急+信访"; //工单级别
        } else {
          caseInfo.priority = "";
        }

        caseInfo.wpCustomertype = res.data.wpCustomertype == "1" ? "个人" : "企业"; //客户类型
        caseInfo.wpServicetype = res.data.wpServicetype == "1" ? "综合服务" : "一网通办"; //服务类型
        caseInfo.callbackFlag = res.data.callbackFlag == "Y" ? "是" : "否"; //复核单标识
        caseInfo.appealUpload = res.data.appealUpload; //附件信息
        caseInfo.assignFlag = res.data.assignFlag == "0" ? "普通单" : "领导指派单"; //领导指派
        caseInfo.ishidden = res.data.ishidden == "0" ? "否" : "是"; //是否匿名
        caseInfo.ispublic = res.data.ispublic == "0" ? "否" : "是"; //是否公开
        caseInfo.isrepeat = res.data.isrepeat == "0" ? "否" : "是"; //是否重复
        caseInfo.rewpid = res.data.rewpid; //重复工单号

        // caseInfo.wpTitle = res.data.wpTitle
        otherForm.wpTitle = res.data.wpTitle; //工单标题
        otherForm.note = res.data.note; //工单备注
        otherForm.requirement = res.data.requirement; //处理描述
        otherForm.phoneno = res.data.phoneno; //来电电话
        otherForm.appealContent = res.data.appealContent; //市民原信内容
        otherForm.mobile = res.data.mobile; //市民移动电话
        otherForm.cardtype = res.data.cardtype; //市民证件类型
        otherForm.customerName = res.data.customerName; //来电市民姓名
        otherForm.address = res.data.address; //来电市民地址
        otherForm.gender = res.data.gender; //来电市民性别
        otherForm.district = res.data.district; //来电所在区域
        otherForm.cardnum = res.data.cardnum; //市民证件号码
        otherForm.email = res.data.email; //电子邮件

        backForm.backCount = res.data.backCount; //退单次数
        backForm.backDept1 = res.data.backDept1; //第一次退单部门
        backForm.backDept2 = res.data.backDept2; //第二次退单部门
        backForm.backDept3 = res.data.backDept3; //第三次退单部门
        backForm.backReason1 = res.data.backReason1; //第一次退单理由
        backForm.backReason2 = res.data.backReason2; //第二次退单理由
        backForm.backReason3 = res.data.backReason3; //第三次退单理由
        backForm.backTime1 = res.data.backTime1; //第一次退单时间
        backForm.backTime2 = res.data.backTime2; //第二次退单时间
        backForm.backTime3 = res.data.backTime3; //第三次退单时间
      }
    }
  });
};
getCaseInfo();
</script>
<style lang="scss" scoped>
.oldCase {
  height: 100%;
  box-sizing: border-box;
  margin: 20px 40px;

  .el-form-item {
    margin-bottom: 5px;

    ::v-deep(label) {
      margin: 0;
      color: var(--sh3h-label-form-color);
      // font-size: 14px;
      font-weight: 500;
      width: 120px;
    }

    ::v-deep(.el-form-item__content) {
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-14,
        var(--sh3h-value-color)
      );
    }
  }

  .caseTitle {
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-20,
      var(--sh3h-label-form-color)
    );
    color: var(--sh3h-menu-active-font-color);
    margin-bottom: 20px;
    font-weight: bold;
  }

  .attachments {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid #ccc;
    padding-bottom: 10px;

    .header {
      display: flex;

      li {
        flex: 1;
        text-align: center;
        line-height: 1.8;
        @include fontStyle(
          var(--sh3h-font-family-medium),
          $font-size-14,
          var(--sh3h-tips-color)
        );
      }
    }

    .content {
      display: flex;
      padding: 3px;
      margin-bottom: 5px;
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-14,
        var(--sh3h-attachment-color)
      );
      background-color: var(--sh3h-attachment-background-color);
      font-weight: bold;
      line-height: 2;
    }
  }
}
</style>
