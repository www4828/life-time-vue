<template>
  <div class="orders">
    <div class="orderNums">
      <div :class="['item',item.PTYPE === state.active ? 'active' : '',item.key]" v-for="(item, index) in state.list" @click="getDetail(item.PTYPE)">
        <div class="total">{{ item.total }} <span>件</span></div>
        <div class="label">{{ item.title }}</div>
      </div>
    </div>
    <div class="orderList">
      <SimpleCaseInfo :case-info="item" v-for="item in state.caseList" :key="item.TASKID"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import SimpleCaseInfo from '@/businessComponent/CaseInfo/SimpleCaseInfo.vue'
import Title from '@/components/Title/Title.vue'
import { NewsService } from "@/api/service/Portal/NewsService";
import { EsCaseModel } from '@/api/model/caseModel'

const newsSever = new NewsService()
// const props = withDefaults(defineProps<{}>(), {})

const state = reactive({
  list: [
    { title: '今日紧急单', total: '', key: 'JJD', PTYPE: 'JJ' },
    { title: '今日国办单', total: '', key: 'GBD', PTYPE: 'GB' },
    { title: '今日群访单', total: 0, key: '', PTYPE: '' },
  ],
  caseList:[] as Array<EsCaseModel>,
  active: ''
})

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
const getDetail = (PTYPE:string) => {
  state.active = PTYPE
  newsSever.getEsData('36',{PTYPE}).then(res => {
    if (res.values?.length > 0) {
      state.caseList = res.values
    }else{
      state.caseList = []
    }
  })
}
const init = ()=>{
  getTotal()
  getDetail('JJ')
}
init()
</script>

<style lang="scss" scoped>
.orders {
  width: 100%;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .orderNums {
    width: 19%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    background-color: var(--sh3h-menu-background-color);
    padding: 0 50px;
    box-sizing: border-box;
    .item {
      width: 100%;
      height: 33%;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      box-sizing: border-box;
      position: relative;
      cursor: pointer;
      border-bottom: 2px solid var(--sh3h-tree-border-color);
      color: var(--el-color-danger);
      position: relative;
      
      .total {
        @include fontStyle('Arial', $font-size-45, var(--el-color-danger));
        font-weight: 600;
        span {
          font-size: $font-size-14;
        }
      }
      &:nth-child(2) {
        .total,
        .label {
          color: var(--el-color-warning);
        }
      }
      &:nth-child(3) {
        border: none;
        .total,
        .label {
          color: var(--el-color-primary);
        }
      }
      .label {
        font-size: $font-size-18;
        // @include fontStyle(
        //   var(--sh3h-font-family),
        //   $font-size-18,
        //   var(--sh3h-value-color));
        //   font-weight: 600;
      }
    }
    .active::after{
      content: '';
      width: 20px;
      height: 20px;
      // background-color: white;
      background: linear-gradient(to top right, #fff 30%, rgba(#53adfb, 0.3));
      position: absolute;
      right: -60px;
      transform: rotateZ(45deg);
    }
    .JJD::after{
      background: linear-gradient(to top right, #fff 30%, rgba(#e23a25, 0.2));
    }
    .GBD::after{
      background: linear-gradient(to top right, #fff 30%, rgba(#f7b817, 0.3));
    }
  }
  .orderList {
    width: 80%;
    height: 100%;
    overflow-y: auto;
    &::-webkit-scrollbar {
        width: 0px;
      }
  }
}
</style>
