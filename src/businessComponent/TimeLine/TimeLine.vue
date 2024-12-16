<template>
  <div class="TimeLine">
    <div class="title">时间轴、责任轴示例</div>
    <div class="canvas" ref="timeline"></div>
    <div class="bottom">
      <span v-if="totalTimeStr">总办理时长，{{ totalTimeStr }} </span>
      <span v-if="handleTimeStr">单位间协办时长， {{ handleTimeStr }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import * as ECharts from "echarts";
interface Any {
  [index: string]: string;
}
const totalTimeStr = ref("");
const handleTimeStr = ref("");
const tempArray = ref<Array<any>>([]);
const timeline = ref<null | HTMLDivElement>(null);
const route = useRoute();
const seriesColor: Any = {
  发现: "#05b0ff",
  受理: "#05b0ff",
  立案: "#05b0ff",
  转核验结案: "#05b0ff",
  回访: "#05b0ff",
  结案: "#05b0ff",
};
const category = ["申请延期", "处理反馈", "拒绝延期"];
const getChartsData = () => {
  // TODO: 接入接口
};
const getSeriesColor = (label: string): string => {
  let color = "#6bcd5d"; // 默认颜色
  Object.keys(seriesColor).map((key) => {
    if (String(label).indexOf(key) !== -1) {
      color = seriesColor[key];
    }
  });
  return color;
};
const getCategory = (label: string) => {
  return category.filter((f) => f == label);
};
/* 此方法用于两点之间计算横向markline y轴坐标，因为左侧y轴为类目轴，多种情况判断固定markline y绉坐标位置
      num1:当前节点数据
      num2:下一节点数据
      */
const formatText = (num1: number, num2: number) => {
  let val = 0;
  //例：0代表最上一级，固定markline y轴坐标为2
  switch (num1) {
    case 0: //市中心
      val = 2;
      break;
    case 1: //二级区中心
      if (num2 - num1 == 0 || num2 - num1 == 1) {
        val = 0;
      } else if (num2 - num1 == 2) {
        val = 4;
      } else if (num2 - num1 == 3) {
        val = 0;
      } else {
        val = 2;
      }
      break;
    case 2: //二级承办
      if (num2 - num1 == 0 || num2 - num1 == 1) {
        val = 1;
      } else {
        val = 3;
      }
      break;
    case 3: //三级分中心
      if (num2 - num1 == 0 || num2 - num1 == 1 || num2 - num1 == 2) {
        val = 2;
      } else {
        val = 0;
      }
      break;
    case 4:
      if (num2 - num1 == 0) {
        val = 3;
      } else if (num2 - num1 < -1) {
        val = 1;
      } else {
        val = 2;
      }
      break;
    case 5:
      if (num1 - num2 == 0) {
        val = 4;
      } else if (num1 - num2 == 1) {
        val = 3;
      } else if (num1 - num2 == 2) {
        val = 2;
      } else if (num1 - num2 == 3) {
        val = 1;
      } else {
        val = 0;
      }
      break;
  }
  return val;
};
const option: any = reactive({
  grid: {
    left: "15%",
  },
  // x 轴缩放
  dataZoom: [
    {
      show: true,
      realtime: true,
      start: 0,
      end: 100,
    },
    {
      type: "inside",
      realtime: true,
      start: 0,
      end: 100,
    },
  ],
  // x轴设置为时间轴
  xAxis: {
    type: "value",
    minInterval: 1,
    splitNumber: 20,
    boundaryGap: ["5%", "5%"],
    axisLine: {
      lineStyle: {
        color: "#818c92",
        width: 2,
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: "dashed",
        color: "#9ca0a2",
        width: 1,
      },
    },
    axisTick: {
      show: true,
      alignWithLabel: true,
    },
    axisLabel: {
      show: false,
    },
  },
  // y轴自定义
  yAxis: {
    type: "category",
    data: ["市中心", "二级区中心", "二级承办", "三级分中心", "三级承办", "四级工作站"],
    inverse: true, //是否反向坐标
    minInterval: 1,
    boundaryGap: true,
    axisLabel: {
      color: "#adadad",
      fontSize: 32,
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: "dashed",
        color: "#9ca0a2",
        width: 1,
      },
    },
    axisTick: {
      alignWithLabel: true,
    },
    axisLine: {
      onZero: false,
      lineStyle: {
        color: "#818c92",
        width: 2,
      },
    },
  },
  // 一条线用多个系列
  series: [],
});
const setSeries = () => {
  const tempSeries = [];
  for (let i = 0; i < tempArray.value.length; i++) {
    const {
      operateTypeName: label1,
      departmentName: d1,
      thisTimeStr: x1,
      flowChartLevelName: y1,
      flowChartLevelCode: t1,
      interval: i1,
      isOver: c1,
    } = tempArray.value[i];
    const {
      operateTypeName: label2,
      departmentName: d2,
      thisTimeStr: x2,
      flowChartLevelName: y2,
      flowChartLevelCode: t2,
      interval: i2,
      isOver: c2,
    } = tempArray.value[i + 1] || {};

    const lineColor = getSeriesColor(label1);

    const tempObj: any = {
      type: "line",
      // 配置点显示
      label: {},
      symbol: "circle",
      symbolSize: 22,
      itemStyle: {
        color: lineColor,
      },
      // 线样式
      lineStyle: {
        width: 4,
      },
      // 标记线设置
      markLine: {},
      // 系列起始位置
      data: [],
    };
    // 隔一个 设置标签
    if (i % 2 == 0) {
      tempObj.label = {
        show: true,
        position: "top",
        fontSize: 24,
        align: "center",
        distance: -75,
        formatter: function (obj: any) {
          if (obj.dataIndex % 2 == 0) {
            if (
              getCategory(obj.value[2]).length > 0 ||
              obj.value[5] == "1" ||
              obj.value[3] == ""
            ) {
              return `{a|${obj.value[2]}} \n{b|${obj.value[4]}}`;
            } else {
              return `{a|${obj.value[2] + "(" + obj.value[3] + ")"}} \n{b|${
                obj.value[4]
              }}`;
            }
          } else {
            if (
              getCategory(obj.value[2]).length > 0 ||
              obj.value[5] == "1" ||
              obj.value[3] == ""
            ) {
              return `{a|${obj.value[2]}} \n{b|${obj.value[4]}}\n\n\n`;
            } else {
              return `{a|${obj.value[2] + "(" + obj.value[3] + ")"}} \n{b|${
                obj.value[4]
              }}\n\n\n`;
            }
          }
        },
        rich: {
          a: {
            color: "#e9f7ff",
            fontSize: 24,
            fontFamily: "Microsoft YaHei",
          },
          b: {
            color: "#adadad",
            fontSize: 24,
          },
        },
      };
    }

    let yval = formatText(t1, t2);
    // 配置markline和数据
    if (x1 && x2) {
      tempObj.markLine = {
        symbol: "none",
        data: [
          [
            // 开始位置
            {
              name: i1,
              xAxis: i,
              yAxis: yval,
            },
            // 结束位置
            {
              xAxis: i + 1,
              yAxis: yval,
            },
          ],
        ],
        // 标记线样式和颜色
        lineStyle: {
          type: "solid",
          color: c1 == 0 ? "#a2dffc" : "#c12c3c",
          width: 4,
        },
        // 标记线文本提示
        label: {
          show: true,
          position: "middle",
          fontSize: 24,
          distance: 10,
        },
      };
      tempObj.data = [
        [i, y1, label1, d1, x1, t1, c1, i1],
        [i + 1, y2, label2, d2, x2, t2, c2, i2],
      ];
    } else {
      // 只有一条数据
      tempObj.data = [[i, y1, label1, d1, x1, t1, c1, i1]];
    }

    tempSeries.push(tempObj);
    option.series = tempSeries;
  }
};
const initEcharts = () => {
  const myChart = ECharts.init(timeline.value!);
  myChart.setOption(option);
};
watch(() => tempArray.value, initEcharts, {
  deep: true,
});
</script>

<style lang="scss" scoped>
.TimeLine {
  height: 915px;
  background: url("@/assets/timeline/timeline_bg.png") no-repeat center center;
  background-size: 100% 100%;
  .title {
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-45,
      var(--sh3h-TimeLine-title-color)
    );
    text-align: center;
    padding: 45px 0;
  }
  .canvas {
    min-height: 700px;
    max-height: 800px;
  }
  .bottom {
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-40,
      var(--sh3h-TimeLine-title-color)
    );
    text-align: center;
    margin-top: 20px;
  }
}
</style>
