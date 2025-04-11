<template>
  <McLayout class="container">
    <McHeader :title="'SH3H-政务助手'" :logoImg="'https://matechat.gitcode.com/logo.svg'">
    </McHeader>
    <McLayoutContent v-if="startPage" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      ">
      <McIntroduction :logoImg="'https://matechat.gitcode.com/logo2x.svg'" :title="'SH3H-政务助手'"
        :subTitle="'Hi，SH3H-政务助手'" :description="description"></McIntroduction>
      <McPrompt :list="introPrompt.list" :direction="introPrompt.direction" class="intro-prompt"
        @itemClick="onSubmit($event.label)"></McPrompt>
    </McLayoutContent>
    <div v-else ref="conversationRef" class="conversation-area content-container">
      <template v-for="(msg, idx) in messages" :key="idx">
        <McBubble v-if="msg.from === 'user'" :content="msg.content" :align="'right'" :avatarConfig="msg.avatarConfig">
        </McBubble>
        <McBubble v-else :loading="msg.loading ?? false" :avatarConfig="msg.avatarConfig">
          <McMarkdownCard :content="msg.content" :theme="theme"></McMarkdownCard>
          <template #bottom>
            <div class="bubble-bottom-operations">
              <i class="icon-copy-new"></i>
              <i class="icon-like"></i>
              <i class="icon-dislike"></i>
            </div>
          </template>
        </McBubble>
      </template>
    </div>
    <div class="shortcut" style="display: flex; align-items: center; gap: 8px">
      <McPrompt v-if="!startPage" :list="simplePrompt" :direction="'horizontal'" style="flex: 1"
        @itemClick="disabled || onSubmit($event.label)"></McPrompt>
      <Button style="margin-left: auto" icon="add" shape="circle" title="新建对话" size="sm" @click="newConversation" />
    </div>
    <McLayoutSender>
      <McInput style="font-size: 16px" :value="inputValue" :maxLength="2000" @change="(e: string) => (inputValue = e)"
        @submit="onSubmit" :disabled="disabled" >
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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { Button } from 'vue-devui/button'
import { SSEChatParams, SSEService } from '@/api/service/Chat/SSEService'

const sseService = new SSEService()
const conversationRef = ref()
const theme = ref('light')
const description = [
  '虎子哥语音转文字模型 可以辅助研发人员将语音转为文字等。',
  '作为AI模型，虎音可以准确的将您的声音转化为准确的声音。',
]
const aiModelAvatar = {
  imgSrc: 'https://matechat.gitcode.com/logo.svg',
  width: 32,
  height: 32,
}
const customerAvatar = {
  imgSrc: 'https://matechat.gitcode.com/png/demo/userAvatar.svg',
  width: 32,
  height: 32,
}
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
}
const simplePrompt = [
  {
    value: 'quickSort',
    iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
    label: '上海三高计算机股份有限公司',
  },
  {
    value: 'helpMd',
    iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
    label: '政务事业小助手功能简介',
  },
]
const startPage = ref(false)
const disabled = ref(false)
const inputValue = ref('')
const inputFootIcons = [{ icon: 'icon-add', text: '附件' }]
const messages = ref<any[]>([
  {
    from: 'user',
    content: '你好',
    vatarPosition: 'side-right',
    avatarConfig: { ...customerAvatar },
  },
  {
    from: 'model',
    content: '你好，我是上海三高政务助手',
    id: 'init-msg',
    vatarPosition: 'side-left',
    avatarConfig: { ...aiModelAvatar },
  },
])

const newConversation = () => {
  startPage.value = true
  messages.value = []
}

const onSubmit = (evt: string) => {
  inputValue.value = ''
  startPage.value = false
  // 用户发送消息
  messages.value.push({
    from: 'user',
    content: evt,
    vatarPosition: 'side-right',
    avatarConfig: { ...customerAvatar },
  })
  nextTick(() => {
    conversationRef.value?.scrollTo({
      top: conversationRef.value.scrollHeight,
      behavior: 'smooth',
    })
  })
  getAIAnswer(evt)
}
// const getAIAnswer = (content: string) => {
//   messages.value.push({
//     from: 'model',
//     content: '',
//     avatarPosition: 'side-left',
//     avatarConfig: { ...aiModelAvatar },
//     loading: true,
//   })

//   /* 模拟流式数据返回 */
//   setTimeout(async () => {
//     messages.value.at(-1).loading = false
//     for (let i = 0; i < content.length; ) {
//       await new Promise((r) => setTimeout(r, 300 * Math.random()))
//       messages.value[messages.value.length - 1].content = content.slice(
//         0,
//         (i += Math.random() * 10)
//       )
//       nextTick(() => {
//         conversationRef.value?.scrollTo({
//           top: conversationRef.value.scrollHeight,
//         })
//       })
//     }
//   }, 1000)
// }


const getAIAnswer = (content: string) => {
  disabled.value = true
  // 建立连接
  messages.value.push({
    from: 'model',
    content: '',
    avatarPosition: 'side-left',
    avatarConfig: { ...aiModelAvatar },
    loading: true,
  })
  let sseChatParams: SSEChatParams = {
    url: '/chat/stream',
    data: { "message": content },
    onmessage: (message: any) => {
      // 收到消息
      messages.value.at(-1).loading = false
      if(message === '[END]'){
        disabled.value = false
      }else{
        messages.value[messages.value.length - 1].content  += message
      }
      nextTick(() => {
        conversationRef.value?.scrollTo({
          top: conversationRef.value.scrollHeight,
        })
      })
    },
    onerror () {
      disabled.value = false
    },
    finallyHandler: () => { },
  }
  sseService.connect(sseChatParams)
}

// onUnmounted(() => {
//   sseService.disconnect()
// })
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
  box-sizing: border-box;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
  font-size: 14px;
  font-weight: 700;
  height: 1000px;
}

.conversation-are {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 0 12px;
  gap: 8px;
  font-size: 16px;
  overflow-y: auto;
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
    &>*:not(:first-child) {
      margin-left: 8px;
    }
  }
}

.bubble-bottom-operations {
  margin-top: 8px;

  i {
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #ebebeb;
    }
  }
}

.mc-input-content {
  font-size: 14px !important;
}

.mc-markdown-render {
  font-size: 14px;
  font-weight: 400;
}

.mc-code-block-header {
  padding: 10px 15px !important;
}

.mc-code-lang {
  font-size: 16px !important;
}

.mc-code-block {
  margin: 10px 0 !important;
}

.hljs {
  font-size: 14px !important;
}
</style>
