import { phone } from "@/api/phone";
import { ElMessage } from "element-plus";
import { config } from "process";

const phoneToken = new phone();
export const phoneBur = {
    outBoundNum: '',
    phoneNo: '',//分机号 用户名
    userPassword: '1',//用户密码--暂时未用到
    callId: '',//当前通话ID
    token: '',
    eventListener: {} as any,
    //初始化
    init: () => {
        WebAgent.init({
            loadBootstrap: 'unload',
            useLocal: false,
            webRTCConfig: {
                tag: 'video-container',
                ringFile: 'https://shhb.ccod.com:1443/WebAgent/WA/sounds/bell_ring2.wav',
                ringTag: 'belling-ring',
                localTag: "local-video"
            },
            WaParams: {
                ui: false,
                sipUseCphone: false
            },
            isUseCChat: false,
            ChatParams: {},
            callback: function () {
                WebAgent.registerEventHandler(function (data) {
                    // console.log(data);
                    if (phoneBur.eventListener[data.type] != undefined) {
                        phoneBur.eventListener[data.type](data);
                    }
                });
                WebAgent.registerResultHandler(function (data) {
                    console.log(data);
                });

            }
        });
    },
    callMake: (outPhoneNo: string) => {
        // var resul=CR.checkDevice();
        // if(!resul.supportVideo||!resul.supportVoice){
        //     ElMessage({
        //         message: '当前浏览器没有音视频麦克风权限',
        //         type: "error",
        //     });
        //     return;
        // }
        WebAgent.extend.makeCall({
            outCallNumber: outPhoneNo,
            disNumber: phoneBur.outBoundNum
        }).then(function () {
        }, function (res) {
            let mess = '外呼异常';
            if (res.code == -1) {
                mess = '不符合外呼的条件(置忙的时候可以外呼，置闲的时候不可以外呼)';
            } else if (res.code == -2) {
                mess = '参数不合法（外呼号码为空）';
            }
            //外呼失败
            ElMessage({
                message: mess,
                type: "error",
            });
        });
    },
    userLogin: (user: string, entId: string) => {
        phoneToken.getToken({ account: user }).then(function (res: any) {
            phoneBur.token = res.token;
            WebAgent.multiChannelLogin(WebAgent, {
                entId: entId,
                //   agentId: '1001',
                //  agentPassword: '1001',
                // agentNumber: "",
                waAutoLoginResult: false,
                isForce: true,
                token: res.token,
                isLocking: function (s, moreStates) { // console.log('[CDesk] 当前置忙置闲状态不能使用');

                },
                unLocking: function (s, moreStates) {   //console.log('[CDesk] 当前置闲置忙状态能使用,状态为:'+s);

                    if (s == 'BUSY') {
                        //   console.log('已经置忙');         
                    }
                    else {
                        //   console.log('已经置闲'); 
                    }
                }
            });
            WebAgent.multiRegisterEvent("onReadSignResult", function (data) {
                ElMessage.info(data.msg);
            });

            WebAgent.multiRegisterEvent("login", function (data) {
                if (data.type == "loginFail")
                    ElMessage.info(data.msg);
            });
        }).catch(function (error: any) {
            ElMessage({
                message: '登录失败',
                type: "error",
            });
            console.log(error);
        });



    },
    loginOut: () => {
        WebAgent.multiChannelLogout();
    },
    hold: () => {
        WebAgent.extend.hold();
    },
    holdReturn: () => {
        WebAgent.extend.holdReturn();
    },
    callClose: () => {
        //结束通话
        CR.hangup();
    },
    agentAway: (status: number, callback: any) => {
        WebAgent.multiChannelState.agentAway(function () {
            callback();
        }, function () { }, status)
    },

    setReady: (callback: any) => {
        WebAgent.multiChannelState.agentReady(function () {
            callback()
        }, function () {
            ElMessage({
                message: '设置就绪失败',
                type: "error",
            });
        });
    },
    setBusy: (callback: any) => {
        WebAgent.multiChannelState.agentBusy(function () { callback() }, function () {
            ElMessage({
                message: '设置未就绪失败',
                type: "error",
            });
        });
    },
    answer: () => {
        CR.answer();
    },
    hangup: () => {
        CR.hangup();
    },
    transfor: (number: string) => {
        var result = WebAgent.extend.consult({
            consultAgent: number,
            type: 1
        });
        if (result.code == 0) {
            WebAgent.extend.conference({
                transferTo: number,
                type: 1
            });
        } else {
            let mess = '咨询异常';
            if (result.code == -1) {
                mess = '不符合发起咨询的条件';
            } else if (result.code == -2) {
                mess = '咨询号码必填';
            }
            //外呼失败
            ElMessage({
                message: mess,
                type: "error",
            });
        }
    },
    agentList: () => {
        //获取空闲坐席
        WebAgent.extend.agentGetList('1');
    },
    errorInfo: (res: any) => {
        ElMessage.error(res.msg);
    },
    phoneRecord:(t:any)=>{
        phoneToken.save(t).then(function (res: any) {}).catch(function (error: any) {          
            console.log(error);
        });
    }
};
