<template>
  <div class="fullCalendar">
    <FullCalendar :options="calendarOptions" class="calendar" ref="fullCalendarRef">
      <template v-slot:eventContent="arg">
        <div class="customer" :class="arg.event.classNames[0]">
          <div class="calendarTitle">
            {{ arg.event.title }}
          </div>
          <div class="calendarContent">{{ arg.event.constraint }}</div>
        </div>
      </template>
    </FullCalendar>
    <div class="add">
      <el-form
        :model="caseInfo"
        class="from"
        ref="reportForm"
        label-width="110px"
        :rules="dispatchRules"
      >
        <el-form-item label="节假日设置">
          <el-date-picker
            v-model="caseInfo.taskId"
            type="date"
            valueFormat="YYYY-MM-DD"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="设置为">
          <el-select
            v-model="caseInfo.taskId"
            class="selectS"
            clearable
            placeholder="请选择类型"
          >
            <el-option label="调休节假日" :value="1" />
            <el-option label="法定节假日" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button class="save-btn" size="default" type="primary" @click="save">
        保存
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  CalendarOptions,
  EventApi,
  DateSelectArg,
  EventClickArg,
  EventInput,
} from "@fullcalendar/core";
import dayjs from "dayjs";
import { ref, reactive } from "vue";
import { FormRules } from "element-plus";
import { HolidayUtil } from "lunar-javascript";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";

const fullCalendarRef = ref();
const matchList = ref<EventInput[]>([]);
const caseInfo = reactive({
  taskId: "",
});
const dispatchRules = reactive<FormRules>({
  content: [{ required: true, message: "意见说明不能为空", trigger: "blur" }],
  reason: [{ required: true, message: "申请原因不能为空", trigger: "blur" }],
  deadline: [{ required: true, message: "申请原因不能为空", trigger: "blur" }],
});
const getHolidays = (year: number, months: number) => {
  const holidays = HolidayUtil.getHolidays(year, months);

  holidays.forEach((holiday: any) => {
    const { day, name, work } = holiday._p;
    if (work) {
      matchList.value.push({
        start: day,
        display: "background",
        backgroundColor: "#ddd6",
        textColor: "#444",
        title: "班",
        className: "work",
        constraint: "",
      });
    } else {
      matchList.value.push({
        start: day,
        display: "background",
        backgroundColor: "#fdf7f4",
        textColor: "#d43900",
        title: "休",
        className: "holiday",
        constraint: name,
      });
    }
  });
};
getHolidays(dayjs().get("year"), dayjs().get("M") + 1);
const handleEventClick = (clickInfo: EventClickArg) => {
  console.log(clickInfo);
};
const calendarOptions = reactive<CalendarOptions>({
  initialView: "dayGridMonth", //初始视图
  plugins: [dayGridPlugin], //需要加载的插件
  locale: "zh-cn", //语言汉化
  selectable: true,
  editable: true,
  droppable: false,
  dayMaxEventRows: 2.0, //事件最大展示列数
  fixedWeekCount: false, //因为每月起始日是星期几不固定，导致一个月的行数会不固定，是否固定行数
  handleWindowResize: true,
  windowResizeDelay: 100,
  aspectRatio: 2, //宽高比
  customButtons: {
    myPrev: {
      text: "上一月",
      click: function () {
        const api = fullCalendarRef.value.getApi();

        api.prev();
        const currentData: Date = api.currentData.currentDate;
        getHolidays(dayjs(currentData).get("year"), dayjs(currentData).get("M") + 1);
      },
    },
    myToday: {
      text: "今天",
      click: function () {
        const api = fullCalendarRef.value.getApi();
        api.today();
        const currentData: Date = api.currentData.currentDate;
        getHolidays(dayjs(currentData).get("year"), dayjs(currentData).get("M") + 1);
      },
    },
    myNext: {
      text: "下一月",
      click: function () {
        const api = fullCalendarRef.value.getApi();
        api.next();
        const currentData: Date = api.currentData.currentDate;
        getHolidays(dayjs(currentData).get("year"), dayjs(currentData).get("M") + 1);
      },
    },
  },
  headerToolbar: {
    left: "title",
    center: "",
    right: "myPrev,myToday,myNext",
  },
  events: matchList.value, //绑定展示事件//点击日期info是单元格的信息
  eventClick: handleEventClick,
});
const save = () => {};
</script>

<style lang="scss" scoped>
.fullCalendar {
  display: flex;

  background-color: white;
  height: 100%;
  .calendar {
    flex: 1;
    font-size: 16px;
    padding: 10px;
    .customer {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      font-weight: bold;
      &.holiday {
        color: #d43900;
      }
      &.work {
        color: #444;
      }
      .calendarTitle {
        padding: 5px;
      }
      .calendarContent {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
      }
    }
    ::v-deep(.fc-daygrid-day-top) {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    ::v-deep(.fc-button-group) {
      .fc-button-primary:focus {
        box-shadow: none;
      }
    }
  }
  .add {
    display: flex;
    flex-direction: column;
    padding: 70px 20px 20px;
    height: 100%;
    box-sizing: border-box;
    .from {
      flex: 1;
    }
    .save-btn {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
    }
  }
}
</style>
