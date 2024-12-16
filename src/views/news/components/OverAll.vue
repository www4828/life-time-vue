<template>
  <Title title="总体情况">
    <div class="titleRight">
        <div class="YMD">
            <span :class="checkType == 'W' ? 'weightClick' : 'reportClick'" @click="getAll('W')">周</span>
            <span>/</span>
            <span :class="checkType == 'M' ? 'weightClick' : 'reportClick'" @click="getAll('M')">月</span>
        </div>
    </div>
    <template #content>
      <div class="overAll">
        <div ref="overAllChart" id="overAllChart" />
      </div>
    </template>
  </Title>
</template>
<script lang="ts" setup>
import { ref, reactive, nextTick } from 'vue'
import * as echarts from 'echarts'
import Title from '@/components/Title/Title.vue'
import { NewsService } from "@/api/service/Portal/NewsService";

// const props = withDefaults(defineProps<{}>(), {})
const newsSever = new NewsService()
const checkType = ref('W')
const overAllChart = ref<null | HTMLDivElement>(null)
const option = reactive({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  legend: {
    data: ['受理', '先联', '反馈'],
    align: 'right',
    right: 10,
    itemWidth: 15,
    itemHeight: 15,
    itemGap: 35,
    textStyle: {
      fontSize: 20
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisLine: {
        show: true,
        lineStyle: {
          color: '#00c7ff',
          width: 1,
          type: 'solid',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: '#00c7ff',
        },
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      axisTick: {
        show: false,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#00c7ff',
          width: 1,
          type: 'solid',
        },
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: '#063374',
        },
      },
    },
  ],
  series: [
    {
      name: '受理',
      type: 'bar',
      data: [],
      barWidth: 10, //柱子宽度
      barGap: 1, //柱子之间间距
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#008cff',
            },
            {
              offset: 1,
              color: '#005193',
            },
          ]),
          opacity: 1,
        },
      },
    },
    {
      name: '先联',
      type: 'bar',
      data: [],
      barWidth: 10,
      barGap: 1,
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#00da9c',
            },
            {
              offset: 1,
              color: '#007a55',
            },
          ]),
          opacity: 1,
        },
      },
    },
    {
      name: '反馈',
      type: 'bar',
      data: [],
      barWidth: 10,
      barGap: 1,
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#c4e300',
            },
            {
              offset: 1,
              color: '#728400',
            },
          ]),
          opacity: 1,
        },
      },
    },
  ],
})
const state = reactive({
  checkType: 'W',
})

const initEcharts = () => {
  const myChart = echarts.init(overAllChart.value!)
  myChart.setOption(option)
}
const getAll = (type:string) => {
  checkType.value = type
  newsSever.getEsData('34',{PDATE:type}).then(res => {
    if (res.values?.length > 0) {
      //获取日期
      option.xAxis[0].data = res.values.map((item: any) => {
        return item.RQ
      })

      // 获取受理数
      option.series[0].data = res.values.map((item: any) => {
        return item.SLS
      })
      // 获取先联数
      option.series[1].data = res.values.map((item: any) => {
        return item.XLS
      })
      // 获取反馈数
      option.series[2].data = res.values.map((item: any) => {
        return item.FKS
      })
      initEcharts()
    }
  })
}
getAll('W')


// nextTick(() => {
//   initEcharts()
//   // console.log(overAllChart.value,document.getElementById('overAllChart'));
// })

</script>

<style lang="scss" scoped>
.overAll {
  width: 100%;
  height: 100%;
  background-color: var(--sh3h-menu-background-color);
  padding: 15px 30px;
  box-sizing: border-box;

  #overAllChart {
    width: 100%;
    height: 100%;
  }
  
}
.YMD {
    color: #2c569e;
    line-height: 30px;
    float: right;
    font-size: $font-size-18;
    margin-right: 25px;
    display: flex;
    justify-content: space-evenly;
    width: 100px;
    font-weight: 500;
}
.reportClick {
    cursor: pointer;
}

.weightClick {
    cursor: pointer;
    font-weight: bolder;
}

.reportClick {
  cursor: pointer;
}

.weightClick {
  cursor: pointer;
  font-weight: bolder;
}

.more {
  background: url("@/assets/layout/more.png") no-repeat right center;
  padding-right: 22px;
  margin-right: 25px;
  font-size: $font-size-18;
  color: #2c569e;
  line-height: 30px;
  float: right;
  font-weight: 500;
}

.YMD {
  color: #2c569e;
  line-height: 30px;
  float: right;
  font-size: $font-size-18;
  margin-right: 25px;
  display: flex;
  justify-content: space-evenly;
  width: 100px;
  font-weight: 500;
}
</style>
