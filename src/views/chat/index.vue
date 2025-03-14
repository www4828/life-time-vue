<template>
     <McLayout class="container">
       <McHeader :title="'虎音转换助手'" :logoImg="'https://matechat.gitcode.com/logo.svg'"> 
       </McHeader>
       <McLayoutContent
         v-if="startPage"
         style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px"
       >
         <McIntroduction
           :logoImg="'https://matechat.gitcode.com/logo2x.svg'"
           :title="'虎音转换助手'"
           :subTitle="'Hi，虎音转换助手'"
           :description="description"
         ></McIntroduction>
         <McPrompt
           :list="introPrompt.list"
           :direction="introPrompt.direction"
           class="intro-prompt"
           @itemClick="onSubmit($event.label)"
         ></McPrompt>
       </McLayoutContent>
       <McLayoutContent class="content-container" ref="conversationRef" v-else>
         <template v-for="(msg, idx) in messages" :key="idx">
           <McBubble
             v-if="msg.from === 'user'"
             :content="msg.content"
             :align="'right'"
             :avatarConfig="{ imgSrc: 'https://matechat.gitcode.com/png/demo/userAvatar.svg' }"
           >
           </McBubble>
           <McBubble v-else :content="msg.content" :avatarConfig="{ imgSrc: 'https://matechat.gitcode.com/logo.svg' }"> </McBubble>
         </template>
       </McLayoutContent>
       <div class="shortcut" style="display: flex; align-items: center; gap: 8px">
         <McPrompt
           v-if="!startPage"
           :list="simplePrompt"
           :direction="'horizontal'"
           style="flex: 1"
           @itemClick="onSubmit($event.label)"
         ></McPrompt>
         <Button
           style="margin-left: auto"
           icon="add"
           shape="circle"
           title="新建对话"
           size="sm"
           @click="newConversation"
         />
       </div>
       <McLayoutSender>
         <McInput style="font-size: 16px;" :value="inputValue" :maxLength="2000" @change="(e) => (inputValue = e)" @submit="onSubmit">
           <template #extra>
             <div class="input-foot-wrapper">
               <div class="input-foot-left">
                 <span v-for="(item, index) in inputFootIcons" :key="index">
                   <i :class="item.icon"></i>
                   {{ item.text }}
                 </span>
                 <span class="input-foot-dividing-line"></span>
                 <span class="input-foot-maxlength">{{ inputValue.length }}/2000</span>
               </div>
               <div class="input-foot-right">
                 <Button icon="op-clearup" shape="round" :disabled="!inputValue" @click="inputValue = ''">清空输入</Button>
               </div>
             </div>
           </template>
         </McInput>
       </McLayoutSender>
     </McLayout>
   </template>
   
   <script setup lang="ts">
   import { ref,nextTick } from 'vue';
   import { Button } from 'vue-devui/button';
   import 'vue-devui/button/style.css';
   const conversationRef = ref();
   const description = [
     '虎子哥语音转文字模型 可以辅助研发人员将语音转为文字等。',
     '作为AI模型，虎音可以准确的将您的声音转化为准确的声音。',
   ];
   const aiModelAvatar = {
  imgSrc: "https://matechat.gitcode.com/logo.svg",
  width: 32,
  height: 32,
};
const customerAvatar = {
  imgSrc: "https://matechat.gitcode.com/png/demo/userAvatar.svg",
  width: 32,
  height: 32,
};
   const introPrompt = {
     direction: 'horizontal',
     list: [
       {
         value: 'quickSort',
         label: '语音快速转为文字',
         iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
         desc: '语音快速转为文字',
       },
       {
         value: 'helpMd',
         label: '你可以帮我做些什么？',
         iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
         desc: '了解当前大模型可以帮你做的事',
       },
       {
         value: 'bindProjectSpace',
         label: '怎么训练真人声音',
         iconConfig: { name: 'icon-priority', color: '#3ac295' },
         desc: '如何训练真人声音',
       },
     ],
   };
   const simplePrompt = [
     {
       value: 'quickSort',
       iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
       label: '帮我将上传的语音快速转为文字',
     },
     {
       value: 'helpMd',
       iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
       label: '你可以帮我做些什么？',
     },
   ];
   const startPage = ref(true);
   const inputValue = ref('');
   const inputFootIcons = [
    
     { icon: 'icon-add', text: '附件' },
   ]; 
   const messages = ref<any[]>([
     {
       from: 'user',
       content: '你好',
       vatarPosition: "side-right",
       avatarConfig: { ...customerAvatar },
     },
     {
       from: 'model',
       content: '你好，我是虎音转化助手',
       id: 'init-msg',
       vatarPosition: "side-left",
       avatarConfig: { ...aiModelAvatar },
     },
   ]);
   
   const newConversation = () => {
     startPage.value = true;
     messages.value = [];
   }
   
   const onSubmit = (evt) => {
     inputValue.value='';
     startPage.value = false;
     // 用户发送消息
     messages.value.push({
       from: 'user',
       content: evt,
     });
     setTimeout(() => {
       // 模型返回消息
       messages.value.push({
         from: 'model',
         content: evt,
       });
       nextTick(() => {
        conversationRef.value?.scrollTo({
          top: conversationRef.value.scrollHeight,
          behavior: "smooth"
        });
      });
     }, 200);
   };
 



   </script>
   
   <style>
   .container {
     width: 1000px;
     margin: 20px auto;
     height: calc(100vh - 40px);
     padding: 20px;
     gap: 8px;
     background: #fff;
     border: 1px solid #ddd;
     border-radius: 16px;
   }
   
   .content-container {
     display: flex;
     flex-direction: column;
     gap: 8px;
     overflow: auto;
     font-size: 14px;
     font-weight: 700;
   }
   
   .input-foot-wrapper {
     display: flex;
     justify-content: space-between;
     align-items: center;
     width: 100%;
     height: 100%;
     margin-right: 8px;
   
     .input-foot-left {
       display: flex;
       align-items: center;
       gap: 8px;
   
       span {
         font-size: 12px;
         color: #252b3a;
         cursor: pointer;
       }
   
       .input-foot-dividing-line {
         width: 1px;
         height: 14px;
         background-color: #d7d8da;
       }
   
       .input-foot-maxlength {
         font-size: 12px;
         color: #71757f;
       }
     }
   
     .input-foot-right {
       & > *:not(:first-child) {
         margin-left: 8px;
       }
     }
   }
   </style>