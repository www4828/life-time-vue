<template>
    <div class="slide_box1">
      <el-button  :icon="Close" size="small" class="slider-close-btn" circle @click="handleClose" />
      <div class="slide_innerbox">
        <slide-verify class="slide_box"  style="font-size: 16px;" ref="block" slider-text="" :accuracy="1" @again="onAgain" @success="onSuccess"
                      @fail="onFail" @refresh="onRefresh" :imgs="img"></slide-verify>
        <div class="msgbox" :style="'color:'+fontColor">{{ msg }}</div>
      </div>
    </div>
  </template>
  
  <script scoped lang="ts" setup>
  import { ref } from "vue";
  import SlideVerify, { SlideVerifyInstance } from "vue3-slide-verify"; //引入滑动验证组件
  import "vue3-slide-verify/dist/style.css"; //引入滑动验证组件样式
  
  import slideImg from "@/assets/slideImgs/1.jpg";
  import slideImg1 from "@/assets/slideImgs/2.jpg";
  import slideImg2 from "@/assets/slideImgs/3.jpg";
  import slideImg3 from "@/assets/slideImgs/4.jpg"; 
  import {Close} from "@element-plus/icons-vue";
  
  const msg = ref("");
  //自定义图片
  const img = ref([slideImg, slideImg1,slideImg2,slideImg3]);
  const block = ref<SlideVerifyInstance>();
  const emit = defineEmits(['again', 'success', 'fail', 'refresh', 'close']);
  
  const fontColor = ref("");
  
  const onAgain = () => {
    msg.value = "检测到非人为操作！";
    fontColor.value="red"
    // 刷新
    block.value?.refresh();
  };
  //成功的回调
  const onSuccess = (times: number) => {
    msg.value =  "验证通过，耗时" + (times / 1000).toFixed(1) + "秒";
    fontColor.value="green"
    emit("success")
  
  };
  const handleClose =()=>{
    msg.value = "";
    emit("close")
  }
  //失败的回调
  const onFail = () => {
    msg.value = "验证不通过";
    fontColor.value="red"
  
    setTimeout(()=>{
      msg.value=''
    },1000)
  
  
  };
  //点击刷新回调
  const onRefresh = () => {
    msg.value = "";
  };
  
  
  </script>
  <style scoped>
  .slide_box1 {
    background: #fff;
    padding: 10px;
    position: absolute;
    z-index: 99;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 330px;
    height: auto;
    min-height: 240px;
    max-height: 255px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    box-shadow: rgba(192, 196, 204, 0.6) 2px 2px 5px;
  }
  .slider-close-btn{
    z-index: 100;
    position: absolute;
    right: -10px;
    top: -10px;
  }
  .slide_innerbox{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .msgbox{
    font-size: 14px;
  }
  </style>
  
  