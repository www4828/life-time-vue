<template>
  <div class="wrapper">
    <div v-show="minishow" class="phoneMainBar" style="">
      <el-form :inline="true" :model="phoneInfo">
        <div class="pclass">
          <el-form-item label="话机状态">
            <div class="hjleft">
              {{ phoneInfo.status }}
            </div>
          </el-form-item>
          <el-form-item :label="status == 3 ? '外拨号码' : '来电号码'">
            <div class="hjleft">
              {{ status == 3 ? phoneInfo.outPhoneNo : phoneInfo.callPhoneNo }}
            </div>
          </el-form-item>
          <el-form-item label="持续时间">
            <div class="hjleft">
              {{ waitTimes }}
            </div>
          </el-form-item>
          <el-row>
            <el-button type="success" @click="holdReturn" :disabled="!isLogin" v-show="bcstatus">继续</el-button>
            <el-button type="warning" @click="hold" :disabled="!(status == 2 || status == 3)"
              v-show="!bcstatus">保持</el-button>
            <!-- <el-button type="success" size="small" @click="setReady" :disabled="!isLogin">就绪</el-button>
     <el-button type="warning" size="small" @click="setBusy" :disabled="!isLogin">未就绪</el-button> -->

            <el-button type="success" @click="answer" :disabled="status != 1">
              接听
            </el-button>
            <el-button type="danger" @click="hangUp" :disabled="!(status == 2 || status == 1 || status == 3)">
              挂机
            </el-button>
          </el-row>
        </div>
        <div class="rclass">
          <el-row>
            <el-col :span="13">
              <el-form-item label="坐席状态">
                <el-dropdown @command="agentAway">
                  <el-link class="zxzt">
                    {{ phoneInfo.fxstatus
                    }}<el-icon>
                      <ArrowDown />
                    </el-icon>
                  </el-link>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="item" v-for="item in fxstatusList" :key="item.key">{{ item.val
                      }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-form-item>
            </el-col>
            <el-col :span="9">
              <el-form-item label="分机号">
                <label class="fjh"> {{ phoneInfo.dn }}</label>
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <div class="item itemClose">
                <el-link @click="minishow = false"><el-icon>
                    <Close />
                  </el-icon>
                </el-link>
              </div>
            </el-col>
          </el-row>
          <el-form-item label="外拨号码">
            <!-- v-show="status == -1 || status == 0 || status == 3" -->
            <el-input v-model="phoneInfo.outPhoneNo" placeholder="请输入号码" class="wbhm">
            </el-input>
            <button class="phonebutton jt" @click="callMake">
              <!-- v-show="status != 3" -->
            </button>
          </el-form-item>
          <el-form-item label="转接">
            <!--  -->
            <el-select v-model="phoneInfo.transforNo" filterable placeholder="请选择" class="zjsel">
              <el-option v-for="item in transforNoList" :label="item" :value="item" :key="item"></el-option>
            </el-select>
            <button @click="transfor" v-bind:disabled="status != 2 && status != 3" class="phonebutton zj"></button>
          </el-form-item>
          <el-row class="loginrow">
            <el-button type="primary" :loading="loadingLogin" @click="login">{{
              isLogin ? "退&nbsp;&nbsp;&nbsp;出" : "登&nbsp;&nbsp;&nbsp;录"
            }}</el-button>
          </el-row>
        </div>
      </el-form>
    </div>
    <div class="phoneMiniBar">

      <!-- <template v-if="status == 0 || status == 1">
      {{ status == 1 ? phoneInfo.callPhoneNo : '' }}
      <el-button v-show="status == 1" type="success" title="接听" @click="answer" circle><el-icon>
          <phone />
        </el-icon>
      </el-button>
      <el-button type="danger" v-show="status == 1" title="挂机" @click="hangUp" style="margin:0 15px 0 15px;"
        circle><el-icon>
          <close />
        </el-icon>
      </el-button>
    </template> -->
      <template v-if="!minishow && status > 0">
        <label style="vertical-align: middle"><el-icon style="vertical-align: top">
            <PhoneFilled />
          </el-icon>
          {{
            status == 2 || status == 1 ? phoneInfo.callPhoneNo : phoneInfo.outPhoneNo
          }}</label>
        <label style="vertical-align: middle"><el-icon class="cxsj">
            <Timer />
          </el-icon>
          持续时间：{{ waitTimes }}</label>
        <el-button v-show="status == 1" type="success" size="small" title="接听" style="margin-left: 0.1rem" @click="answer"
          circle><el-icon>
            <phone />
          </el-icon>
        </el-button>
        <el-button type="danger" size="small" title="挂机" @click="hangUp" style="margin: 0 0.08rem 0 0.08rem"
          circle><el-icon>
            <close />
          </el-icon>
        </el-button>
        <!-- <el-link @click="minishow = false" v-show="!isMiniVisible" style="color:#8effab;font-size: 18px;"><el-icon
          :size="22" style="margin-right: 10px;">
          <Phone />
        </el-icon> {{ phoneInfo.status }} </el-link> -->
      </template>

      <el-link @click="minishow = !minishow" v-if="seatAccount != null && seatAccount != ''"
        style="color: #ffffff; font-size: 0.095rem"><el-icon style="margin-right: 10px">
          <Phone />
        </el-icon>{{ phoneInfo.status }}</el-link>
    </div>
    <div style="display: none">
      <video id="video-container" webkit-playsinline="true" playsinline="true" x5-playsinline x-webkit-airplay="allow"
        x5-video-player-fullscreen="false"></video>
      <video id="local-video" webkit-playsinline="true" playsinline="true" x5-playsinline x-webkit-airplay="allow"
        x5-video-player-fullscreen="false"></video>
      <audio src="https://shhb.ccod.com:1443/WebAgent/WA/sounds/Hangup.wav" id="hangup"></audio>
      <audio id="belling-ring"></audio>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Session } from "@/utils/storage";
import { phoneBur } from "@/utils/phoneBur";
import { reactive, ref, getCurrentInstance } from "vue";
import {
  Phone,
  PhoneFilled,
  DocumentAdd,
  Close,
  Minus,
  CopyDocument,
  Refresh,
  ArrowDown,
  Timer,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const { username, seatAccount, seatEnterprise } = Session.get("userInfo");
const router = useRouter();
const callVisible = ref<boolean>(true);
const isMiniVisible = ref<boolean>(true); //是否通过回访页面打开
const outDialingIsShow = ref<boolean>(false);
const isLogin = ref<boolean>(false);
const loadingLogin = ref<boolean>(false);
const minishow = ref<boolean>(false);
const bcstatus = ref<boolean>(false);
const transforNoList = ref<Array<string>>([]);
const status = ref<number>(-1); //-1 未登录  0已登录/空闲状态 1来电待接听 2来电通话中 3去电通话中
const waitTimes = ref<String>("00:00:00");
const timer = ref<any>(null);
const fxstatusList = ref<Array<{ key: number; val: string }>>([
  { key: 11, val: "就绪" },
  { key: 22, val: "未就绪" },
  { key: 1, val: "小休" },
  { key: 2, val: "就餐" },
  { key: 3, val: "下班" },
  { key: 4, val: "开会" },
  { key: 5, val: "如厕" },
  { key: 6, val: "休息" },
  { key: 7, val: "培训" },
  { key: 8, val: "其他" },
]);
const phoneInfo = ref<{
  dds: number;
  status: string;
  fxstatus: string;
  dn: string;
  outPhoneNo: string;
  callPhoneNo: string;
  transforNo: string;
  sessionId: string;
}>({
  dds: 0,
  status: "请登录",
  fxstatus: "请登录",
  dn: "",
  outPhoneNo: "",
  callPhoneNo: "",
  transforNo: "",
  sessionId: "",
});
const emit = defineEmits(["update:visible"]);
let callback = (str: string) => { };
const { proxy } = <any>getCurrentInstance();
const mainInit = () => {
  if (seatAccount != null && seatAccount != "") {
    isMiniVisible.value = false;
    // const script = document.createElement('script');
    // script.async = true;
    // script.src = "https://shhb.ccod.com:1443/WebAgent/public_lib/jquery-2.1.4.min.js";
    // script.id = "jquery-2.1.4";
    // document.body.appendChild(script);

    // const sdkscript = document.createElement('script');
    // sdkscript.async = true;
    // sdkscript.src = "https://shhb.ccod.com:1443/WebAgent/WebAgent.js";
    // sdkscript.id = "jquery-2.1.4";
    // document.body.appendChild(sdkscript);
    //setTimeout(function () { init(); }, 6000);
    init();
    // setTimeout(function () {
    //   var links = document.getElementsByTagName("link");
    //   for (var i = 0; i < links.length; i++) {
    //     var _href = links[i].href;
    //     if (links[i] && links[i].href && links[i].href.indexOf('https://shhb.ccod.com:1443/WebAgent/public_css/bootstrap.min.css') != -1) {
    //       links[i].parentNode.removeChild(links[i]);
    //     }
    //   }
    // }, 6000);
  }
  // init();
  proxy.mittBus.on("phoneCallMake", (str: any) => {
    if (seatAccount == null || seatAccount == "" || seatAccount == undefined) {
      ElMessage({
        message: "该用户未配置分机号",
        type: "info",
      });
      return;
    }
    phoneBur.userLogin(username, seatEnterprise);
    //通过操作页面拨号 展示最小化窗口
    // minishow.value = true;
    isMiniVisible.value = true;//是否通过回访页面打开
    phoneInfo.value.outPhoneNo = str.outPhoneNo.trim();

    //emit("update:visible", true);
    minishow.value = false;
    callback = str.callback;
  });
};

const init = () => {
  phoneInfo.value.dn = seatAccount;

  phoneBur.init();

  // proxy.mittBus.emit('phoneCallMake', {
  //   outPhoneNo: '18621199372', callback: function (res: string) {

  //   }
  // });

  var log = function (message: string, evt: object) {
    phoneInfo.value.status = message;
    //  console.log("3h----" + message + JSON.stringify(evt));
  };
  var addEvent = function (name: string, handler: any) {
    phoneBur.eventListener[name] = handler;
  };
  addEvent("EVENT_AGENT_LOGIN", function (data: any) {
    phoneBur.outBoundNum = data.ext.outBoundNumList;
    isLogin.value = true;
    status.value = 0;
    phoneInfo.value.fxstatus = "未就绪";
    if (isMiniVisible.value) {
      //操作页面直接拨打电话 默认设置为繁忙才能外拨
      phoneInfo.value.sessionId = "";
     // setBusy();
      callMake();
    }
    log("空闲", data);
    waitTimes.value = "00:00:00";

    phoneBur.phoneRecord({
      "createUser": username,
      "modifierUser": "",
      "operateCode": "",
      "operateName": "",
      "remark": "登录",
      "seatGroup": seatAccount,
      "status": 33,
      "userId": username
    });
  });
  addEvent("EVENT_AGENT_LOGOUT", function (data: any) {
    isLogin.value = false;
    status.value = -1;
    phoneInfo.value.fxstatus = "未登录";
    phoneInfo.value.status = data.ext.forceLogout == "1" ? "强制登出" : "未登录";
    phoneInfo.value.outPhoneNo='';
    phoneBur.phoneRecord({
      "createUser": username,
      "modifierUser": "",
      "operateCode": "",
      "operateName": "",
      "remark": "登出",
      "seatGroup": seatAccount,
      "status": 44,
      "userId": username
    });
  });
  addEvent("EVENT_OUTBOUND_ALERTING_TP", function (data: any) {
    phoneBur.answer();
    status.value = 3;
    phoneInfo.value.sessionId = data.ext.sessionId;
    callback(phoneInfo.value.sessionId);
    log("外呼坐席振铃", data);
  });
  addEvent("EVENT_OUTBOUND_CONNECTED_TP", function (data: any) {
    status.value = 3;
    log("坐席呼叫中", data);
  });
  addEvent("EVENT_OUTBOUND_ALERTING_OP", function (data: any) {
    status.value = 3;
    log("外呼客户振铃", data);
  });
  addEvent("EVENT_OUTBOUND_CONNECTED_OP", function (data: any) {
    status.value = 3;
    startTimer();
    log("外呼客户接通", data);
  });
  addEvent("EVENT_INBOUND_ALERTING", function (data: any) {
    status.value = 1;
    phoneInfo.value.callPhoneNo = data.ext.strAni;
    phoneInfo.value.sessionId = data.ext.sessionId;
    log("呼入振铃", data);
    if (props.visible == false) {
      //如果当前话务工具条隐藏  来电展示出小工具条
      // emit("update:visible", true);
      minishow.value = false;
    }
  });
  addEvent("EVENT_INBOUND_CONNECTED", function (data: any) {
    status.value = 2;
    startTimer();
    log("呼入接通", data);
  });
  addEvent("EVENT_TP_DISCONNECT", function (data: any) {
    status.value = 0;
    phoneInfo.value.callPhoneNo = "";
    endTimer();
    bcstatus.value = false;
    //坐席挂断
    log("空闲", data);
    waitTimes.value = "00:00:00";
    setBusy();
    //如果是回访部门 通话完毕直接退出
    if (isMiniVisible.value) {
      //退出
      phoneBur.loginOut();
      isLogin.value = false;
      status.value = -1;
      phoneInfo.value.fxstatus = "未登录";
      phoneInfo.value.status = "未登录";
      minishow.value = false;
      isMiniVisible.value = false;
      // emit("update:visible", false);
    }
  
  });
  addEvent("EVENT_OP_DISCONNECT", function (data: any) {
    status.value = 0;
    phoneInfo.value.callPhoneNo = "";
    endTimer();
    bcstatus.value = false;
    //客户挂断
    log("空闲", data);
    waitTimes.value = "00:00:00";
    setBusy();
    //如果是回访部门 通话完毕直接退出
    if (isMiniVisible.value) {
      //退出
      phoneBur.loginOut();
      isLogin.value = false;
      status.value = -1;
      phoneInfo.value.fxstatus = "未登录";
      phoneInfo.value.status = "未登录";
      minishow.value = false;
      isMiniVisible.value=false;
      //  emit("update:visible", false);
    }
  });
  addEvent("EVENT_AGENT_GET_LIST", function (data: any) {
    transforNoList.value = [];
    phoneInfo.value.transforNo = "";
    if (data.ext.agentList != "") {
      data.ext.agentList.split("|").map((item: any) => {
        if (item != "") transforNoList.value.push(item.split(":")[0]);
      });
    }
  });
  addEvent("EVENT_AGENT_NOTREADY", function (data: any) {
    phoneInfo.value.fxstatus = "未就绪";
    phoneBur.phoneRecord({
      "createUser": username,
      "modifierUser": "",
      "operateCode": "",
      "operateName": "",
      "remark": "未就绪",
      "seatGroup": seatAccount,
      "status": 22,
      "userId": username
    });
  });
  addEvent("EVENT_AGENT_READY", function (data: any) {
    phoneInfo.value.fxstatus = "就绪";
    phoneBur.phoneRecord({
      "createUser": username,
      "modifierUser": "",
      "operateCode": "",
      "operateName": "",
      "remark": "就绪",
      "seatGroup": seatAccount,
      "status": 11,
      "userId": username
    });
  });
  addEvent("EVENT_SOCKET_ABNORMAL_DISCONNECT", function (data: any) {
    //连接断开事件
    isLogin.value = false;
    status.value = -1;
    phoneInfo.value.fxstatus = "未登录";
    phoneInfo.value.status = "连接断开";
  });
  addEvent("EVENT_AGENT_AWAY", function (data: any) {
    //离开状态触发
    phoneBur.phoneRecord({
      "createUser": username,
      "modifierUser": "",
      "operateCode": "",
      "operateName": "",
      "remark": "",
      "seatGroup": seatAccount,
      "status": parseInt(data.ext.awayStatus),
      "userId": username
    });

    let i = fxstatusList.value.filter(
      (item) => {
        if (item.key.toString() == data.ext.awayStatus) {
          console.log(item.val);

          phoneInfo.value.fxstatus = item.val;
        }
      }
    );
  });
  addEvent("EVENT_CONSULT_CONNECTED_TP", function (data: any) {
    startTimer();
    log("被转接坐席接通", data);
  });
  addEvent("EVENT_CONSULT_CONNECTED_OP", function (data: any) {
    log("转接接通", data);
    status.value = 0;
    phoneInfo.value.callPhoneNo = "";
    endTimer();
    bcstatus.value = false;
    status.value = 1;
    hangUp();
  });
  addEvent("EVENT_TRANSFER", function (data: any) {
    //转移事件，变为双方通话
    log("转移接通", data);
  });
  addEvent("EVENT_CONSULT_FAIL", function (data: any) {
    ElMessage.error(data.ext.errorMessage);
  });
  addEvent("EVENT_CONSULT_ALTERTING_OP", function (data: any) {
    log("转接振铃", data);
  });
  addEvent("EVENT_CONSULT_ALERTING_TP", function (data: any) {
    status.value = 1;
    phoneBur.agentList(); //获取可转接坐席
    phoneInfo.value.callPhoneNo = data.ext.strAni;
    phoneInfo.value.sessionId = data.ext.sessionId;
    log("被转接振铃", data);
  });
};
mainInit();
const agentAway = (item: any) => {
  if (!isLogin.value) {
    ElMessage({
      message: "请先登录",
      type: "info",
    });
    return;
  }
  if (item.key == 11) {
    setReady();
    return;
  }
  if (item.key == 22) {
    setBusy();
    return;
  }
  phoneBur.agentAway(item.key, function () {
    phoneInfo.value.fxstatus = item.val;
  });
};
const answer = () => {
  //来电接听
  status.value = 2;
  phoneBur.answer();
  toReport();
};
const hangUp = () => {
  //挂断
  phoneBur.callClose();
};
const hold = () => {
  bcstatus.value = true;
  phoneBur.hold();
};
const holdReturn = () => {
  phoneBur.holdReturn();
  bcstatus.value = false;
};
const callMake = () => {
  phoneBur.callMake(phoneInfo.value.outPhoneNo.trim());
}
const setReady = () => {
  phoneBur.setReady(function () {
    //  return phoneInfo.value.fxstatus = '就绪';
  });
};
const setBusy = () => {
  phoneBur.setBusy(function () {
    // return phoneInfo.value.fxstatus = '未就绪';
  });
};
const transfor = () => {
  if (phoneInfo.value.transforNo == "" || phoneInfo.value.transforNo == null) {
    ElMessage({
      message: "请选择转接坐席",
      type: "info",
    });
    return;
  }
  //来电转接
  phoneBur.transfor(phoneInfo.value.transforNo);
};
const login = () => {
  if (status.value == -1) {
    phoneBur.userLogin(username, seatEnterprise);
  } else if (status.value == 0) {
    //退出
    phoneBur.loginOut();
    isLogin.value = false;
    status.value = -1;
    phoneInfo.value.fxstatus = "未登录";
    phoneInfo.value.status = "未登录";
  } else {
    ElMessage({
      message: "请通话结束再退出",
      type: "info",
    });
  }
};

const startTimer = () => {
  waitTimes.value = "00:00:00";
  phoneBur.agentList(); //获取可转接坐席
  window.clearInterval(timer.value);
  var startdate = new Date();
  //计算保持时间
  function CalcTime() {
    var enddate = new Date(); //结束时间
    var diff = (enddate.getTime() - startdate.getTime()) / 1000;
    var time = diff;
    var days = Math.floor(time / 1440 / 60);
    var hours = Math.floor((time - days * 1440 * 60) / 3600);
    var minutes = Math.floor((time - days * 1440 * 60 - hours * 3600) / 60);
    var seconds = (time - days * 1440 * 60 - hours * 3600 - minutes * 60).toFixed(0);
    return (
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds.length < 2 ? "0" + seconds : seconds)
    );
  }
  timer.value = window.setInterval(function () {
    var time = CalcTime();
    waitTimes.value = time;
  }, 1000);
};

const endTimer = () => {
  transforNoList.value = []; //清空可转接列表
  phoneInfo.value.transforNo = "";
  window.clearInterval(timer.value);
};

const toReport = () => {
  minishow.value = false;
  router.push({
    path: "/workEntry/report1",
    query: { phone: phoneInfo.value.callPhoneNo, voiceId: phoneInfo.value.sessionId },
  });
};
</script>
<style lang="scss" scoped>
.phoneMiniBar {
  width: auto;
  height: auto;
  position: fixed;
  right: 250px;
  top: 25px;
  border-radius: 6px;
  //padding: 10px;
  z-index: 1000;
  font-size: 18px;
  line-height: 100%;
  color: #ffffff;
  font-family: SourceHanSansCN-Medium;
  text-align: right;
  vertical-align: middle;

  .cxsj {
    margin-right: 5px;
    margin-left: 20px;
    vertical-align: top;
  }
}

.phoneMainBar {
  width: 640px;
  height: 222px;
  position: fixed;
  right: 100px;
  top: 55px;
  background-color: #ffffff;
  border: 1px solid #ccc4c4;
  border-radius: 6px;
  // padding: 10px;
  z-index: 1000;
  font-size: 14px;
  font-family: SourceHanSansCN-Regular;

  .item {
    height: 35px;
    line-height: 35px;
    font-size: 16px;
    margin-bottom: 10px;
  }

  .itemClose {
    text-align: right;
    margin-right: -10px;
    margin-top: -20px;
  }

  .phonebutton {
    border-radius: 3px;
    border: 1px #3cb657 solid;
    height: 32px;
    width: 32px;
    margin-left: 15px;
  }

  .jt {
    height: 32px;
    width: 32px;
    margin-left: 15px;
    background: url("@/assets/phone/1158.png") no-repeat center;
  }

  .zj {
    background: url("@/assets/phone/620.png") no-repeat center;
  }

  .phonebutton:hover {
    background-color: #d2e9e2;
  }

  .pclass {
    background: linear-gradient(to left, #edeef0, #fdfdfd);
    width: calc(44% - 25px);
    float: left;
    padding: 20px 0 20px 20px;

    color: #7a8693;
    overflow: hidden;
    // height: 222px;

    .hjleft {
      float: left;
      display: inline;
      width: 140px;
      border: 0;
      padding-left: 5px;
      height: 32px;
      font-size: 16px;
      color: #464f53;
      background-color: #e3e5e9b5;
    }

    ::v-deep(.el-form-item .el-form-item__label) {
      color: #7a8693;
    }
  }

  .rclass {
    width: calc(55% - 30px);
    float: right;
    padding: 20px;

    .zxzt {
      font-size: 16px;
    }

    .fjh {
      font-size: 18px;
      font-family: Impact;
    }

    .loginrow {
      margin-right: 10px;
      float: right;
    }

    .wbhm {
      width: 180px;
      font-size: 16px;
    }

    .zjsel {
      width: 180px;
      font-size: 16px;
    }
  }
}

::v-deep(.el-form-item .el-form-item__label) {
  // font-size: 16px;
  white-space: nowrap;
  width: 70px;
  text-align: justify;
  text-align-last: justify;
}

/*闪烁动画*/
@keyframes twinkle {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }

  to {
    opacity: 1;
  }
}

.ppp {
  animation: twinkle 2s;
  animation-iteration-count: infinite;
}
</style>
