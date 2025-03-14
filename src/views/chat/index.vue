<template> 
  <McLayout class="container"> 
    <McHeader
      :title="'虎音转换助手'"
      :logoImg="'https://matechat.gitcode.com/logo.svg'"
    >
    </McHeader>
    <McLayoutContent
      v-if="startPage"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      "
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
    <div v-else ref="conversationRef"  class="conversation-area content-container"> 
      <template v-for="(msg, idx) in messages" :key="idx">
        <McBubble
          v-if="msg.from === 'user'"
          :content="msg.content"
          :align="'right'"
          :avatarConfig="msg.avatarConfig"
        ></McBubble>
        <McBubble
          v-else
          :loading="msg.loading ?? false"
          :avatarConfig="msg.avatarConfig"
        >
          <McMarkdownCard
            :content="msg.content"
            :theme="theme"
          ></McMarkdownCard>
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
      <McInput
        style="font-size: 16px"
        :value="inputValue"
        :maxLength="2000"
        @change="(e) => (inputValue = e)"
        @submit="onSubmit"
      >
        <template #extra>
          <div class="input-foot-wrapper">
            <div class="input-foot-left">
              <span v-for="(item, index) in inputFootIcons" :key="index">
                <i :class="item.icon"></i>
                {{ item.text }}
              </span>
              <span class="input-foot-dividing-line"></span>
              <span class="input-foot-maxlength"
                >{{ inputValue.length }}/2000</span
              >
            </div>
            <div class="input-foot-right">
              <Button
                icon="op-clearup"
                shape="round"
                :disabled="!inputValue"
                @click="inputValue = ''"
                >清空输入</Button
              >
            </div>
          </div>
        </template>
      </McInput>
    </McLayoutSender>
  </McLayout>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Button } from "vue-devui/button";
const conversationRef = ref();
const theme = ref("light");
const description = [
  "虎子哥语音转文字模型 可以辅助研发人员将语音转为文字等。",
  "作为AI模型，虎音可以准确的将您的声音转化为准确的声音。",
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
  direction: "horizontal",
  list: [
    {
      value: "quickSort",
      label: "语音快速转为文字",
      iconConfig: { name: "icon-info-o", color: "#5e7ce0" },
      desc: "语音快速转为文字",
    },
    {
      value: "helpMd",
      label: "你可以帮我做些什么？",
      iconConfig: { name: "icon-star", color: "rgb(255, 215, 0)" },
      desc: "了解当前大模型可以帮你做的事",
    },
    {
      value: "bindProjectSpace",
      label: "怎么训练真人声音",
      iconConfig: { name: "icon-priority", color: "#3ac295" },
      desc: "如何训练真人声音",
    },
  ],
};
const simplePrompt = [
  {
    value: "quickSort",
    iconConfig: { name: "icon-info-o", color: "#5e7ce0" },
    label: "帮我写一个快速排序算法",
  },
  {
    value: "helpMd",
    iconConfig: { name: "icon-star", color: "rgb(255, 215, 0)" },
    label: "你可以帮我做些什么？",
  },
];
const startPage = ref(false);
const inputValue = ref("");
const inputFootIcons = [{ icon: "icon-add", text: "附件" }];
const messages = ref<any[]>([
  {
    from: "user",
    content: "你好",
    vatarPosition: "side-right",
    avatarConfig: { ...customerAvatar },
  },
  {
    from: "model",
    content: "你好，我是虎音转化助手",
    id: "init-msg",
    vatarPosition: "side-left",
    avatarConfig: { ...aiModelAvatar },
  },
]);

const newConversation = () => {
  startPage.value = true;
  messages.value = [];
};

const onSubmit = (evt) => {
  inputValue.value = "";
  startPage.value = false;
  // 用户发送消息
  messages.value.push({
    from: "user",
    content: evt,
    vatarPosition: "side-right",
    avatarConfig: { ...customerAvatar },
  });
  nextTick(() => {
    conversationRef.value?.scrollTo({
      top: conversationRef.value.scrollHeight,
      behavior: "smooth",
    });
  });
  if(evt=="帮我写一个快速排序算法"){
    getAIAnswer(quickSort.value);
  }else{
    getAIAnswer(evt ?? e);
  }
  
};
const getAIAnswer = (content) => {
  messages.value.push({
    from: "model",
    content: "",
    avatarPosition: "side-left",
    avatarConfig: { ...aiModelAvatar },
    loading: true,
  });

  /* 模拟流式数据返回 */
  setTimeout(async () => {
    messages.value.at(-1).loading = false;
    for (let i = 0; i < content.length; ) {
      await new Promise((r) => setTimeout(r, 300 * Math.random()));
      messages.value[messages.value.length - 1].content = content.slice(
        0,
        (i += Math.random() * 10)
      );
      nextTick(() => {
        conversationRef.value?.scrollTo({
          top: conversationRef.value.scrollHeight,
        });
      });
    }
  }, 1000);
};
const quickSort = ref(`
# 快速排序（Quick Sort） 
### 介绍
**快速排序（Quick Sort）**：是一种高效的排序算法，它采用分治法（Divide and Conquer）的思想。它的基本思路是： 
1. 选择一个基准值（pivot）
2. 将数组分成两部分：小于基准值的部分和大于等于基准值的部分
3. 递归地对这两部分进行排序 
### 代码实现 
1. 以下是快速排序的实现方法
\`\`\`ts
function quickSort(arr) {
  function quickSort(arr) {
  if (arr.length < 2) {
    return arr;
  }

  const pivot = arr[0];
  const left = [];
  const right = [];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

// 使用示例
const arr = [3, 6, 8, 10, 1, 2, 1];
console.log(quickSort(arr)); // 输出排序后的数组
}
\`\`\`
`); 



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
  height:1000px 
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
    & > *:not(:first-child) {
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
        background-color: #EBEBEB;
      }
    }
  }
 .mc-input-content{
   font-size: 14px !important;
 } 
.mc-markdown-render{
  font-size: 14px;
  font-weight: 400;
}
.mc-code-block-header{ 
  padding: 10px 15px !important; 
}
.mc-code-lang{
  font-size: 16px !important;
}
.mc-code-block {
    margin: 10px 0 !important
}
.hljs{
  font-size: 14px !important;
}
</style>
