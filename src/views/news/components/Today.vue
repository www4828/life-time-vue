<template>
  <div class="todaySituation">
    <div class="today-title">
      <div 
        :class="['item',state.active === item.PTYPE ? 'active' : '']" v-for="(item,index) in state.list"
        @click="clickHandle(item.PTYPE)"
      >
        <div class="total">{{item.total}} <span>件</span> </div>
        <div class="label">{{item.title}}</div>
      </div>
    </div>
    <div class="today-active">
      <div class="active-content" v-for="item in state.slList">
        <div class="des">{{ item.title }}</div>
        <ul>
          <li v-for="ele in item.list">
            <span class="label" :title="ele.label">{{ ele.label }}</span>
            <span class="num">{{ ele.num }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import Title from "@/components/Title/Title.vue";
import { NewsService } from "@/api/service/Portal/NewsService";

const newsSever = new NewsService()
// const props = withDefaults(defineProps<{}>(), {})

const state = reactive({
  list:[
    { title:'今日受理', total:'', key: 'SLS', PTYPE:'SL' },
    { title:'今日先联', total:'', key: 'XLS', PTYPE:'XL' },
    { title:'今日反馈', total:'', key: 'FKS', PTYPE:'FK' },
  ],
  slList: [
    {
      title: '反应内容前三',
      list: [{ label: '', num: '' }]
    },
    {
      title: '受理单位前三',
      list: []
    },
    {
      title: '反应区名前三',
      list: []
    }
  ],
  active: 'SL'
})

const clickHandle = (type:string)=>{
  state.active = type
  getFYNR()
  getSLDW()
  getFYQM()
}
const getTotal = () => {
  newsSever.getEsData('30').then(res => {
    if (res.values?.length > 0) {
      state.list.forEach(item => {
        Object.keys(res.values[0]).forEach(key => {
          if (item.key === key) {
            item.total = res.values[0][key]
          }
        })
      })
    }
  })
}
const getFYNR = ()=>{ // 反应内容前三
  newsSever.getEsData('31',{PTYPE:state.active}).then(res=>{
    state.slList[0].list = []
    if(res.values?.length>0){
      res.values.forEach((item: any) => {
        state.slList[0].list.push({
          label: item.FL,
          num: item.NUM
        })
      })
    }
  })
}
const getSLDW = ()=>{ // 受理单位前三
  newsSever.getEsData('32',{PTYPE:state.active}).then(res=>{
    state.slList[1].list = []
    if(res.values?.length>0){
      res.values.forEach((item: any) => {
        state.slList[1].list.push({
          label: item.FL,
          num: item.NUM
        })
      })
    }
  })
}
const getFYQM = ()=>{// 反应区名前三
  newsSever.getEsData('33',{PTYPE:state.active}).then(res=>{
    state.slList[2].list = []
    if(res.values?.length>0){
      res.values.forEach((item: any) => {
        state.slList[2].list.push({
          label: item.FL,
          num: item.NUM
        })
      })
    }
  })
}
const init = () => {
  getTotal()
  clickHandle(state.active)
}
init()
</script>

<style lang="scss" scoped>
.todaySituation {
  width: 100%;
  height: 100%;
  background-color: var(--sh3h-menu-background-color);
  padding: 15px 30px;
  box-sizing: border-box;

  .today-title {
    width: 100%;
    height: 40%;
    display: flex;
    justify-content: space-between;
    border-bottom: 3px solid var(--sh3h-deep-blue);

    .item {
      width: 20%;
      display: flex;
      align-items: center;
      flex-direction: column;
      height: 100%;
      padding-top: 20px;
      box-sizing: border-box;
      position: relative;
      cursor: pointer;

      &.active::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 10px;
        background: url("@/assets/layout/activeArrow.png") no-repeat center/100% 100%;
        bottom: -8px;
      }

      .total {
        @include fontStyle('Arial',
          $font-size-45,
          var(--sh3h-attachment-color));
        font-weight: 600;

        span {
          @include fontStyle(var(--sh3h-font-family-normal),
            $font-size-14,
            var(--sh3h-attachment-color));
        }
      }

      .label {
        @include fontStyle(var(--sh3h-font-family),
          $font-size-18,
          var(--sh3h-value-color));
        font-weight: 600;
      }
    }
  }

  .today-active {
    width: 100%;
    height: 60%;
    padding: 20px;
    box-sizing: border-box;
    @include fontStyle('Arial',
      $font-size-16,
      var(--sh3h-value-color));
    display: flex;
    justify-content: space-between;

    .active-content {
      width: 30%;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding-right: 20px;
      box-sizing: border-box;
      position: relative;

      &:nth-last-child(1) {
        padding-right: 20px;
      }

      .des {
        font-weight: 600;
        @include fontStyle(var(--sh3h-font-family-medium),
          $font-size-20,
          var(--sh3h-deep-blue));
      }

      ul {
        li {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;

          .label {
            font-weight: 600;
            color: var(--sh3h-value-color);
            white-space: nowrap;
            width: 90%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .num {
            color: var(--sh3h-attachment-color);
          }
        }
      }
    }
  }
}
</style>
