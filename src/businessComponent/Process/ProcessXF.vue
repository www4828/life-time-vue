<template>
  <Title title="处理流程" align="flex-start">
    <template #default>
      <img
        src="@/assets/process/sortIconDown.png"
        class="sort"
        v-if="!isSort"
        @click="turnOver"
        alt=""
      />
      <img
        src="@/assets/process/sortIcon.png"
        class="sort"
        v-else
        @click="turnOver"
        alt=""
      />
    </template>
    <template #content>
      <div class="process" v-for="process in processList" :key="process.id">
        <div class="processing">
          <el-checkbox :model-value="true" />
          <div :class="['dashedLine', isSort ? 'dashedLineRotate' : '']"></div>
        </div>
        <div class="content">
          <div class="status line" @click="showDetail(process)">
            <span class="sta">{{ process.nodeName }}</span
            ><span>{{ process.time }}</span>
          </div>
          <div class="line">操作部门: {{ process.departmentName }}</div>
          <div class="line">操作人员: {{ process.userName }}</div>
          <div class="line">
            操作备注:
            <el-tooltip :content="process.description" placement="top" effect="light">
              {{ process.description }}
            </el-tooltip>
          </div>
        </div>
      </div>
      <StepDetail
        :process="process"
        :dialogVisible="dialogVisible"
        @close="dialogVisible = false"
      />
    </template>
  </Title>
</template>
<script lang="ts" setup>
import { ref, watch, reactive } from "vue";
import Title from "@/components/Title/Title.vue";
import {
  CaseRecodeService,
  ProcessModel,
} from "@/api/service/WorkTicket/CaseRecodeService";
import { LettersVisitService } from "@/api/service/LettersVisit/LettersVisitService";
import { Response } from "@/api/interface";
import { cloneDeep } from "lodash-es";
import StepDetail from "./StepDetail.vue";
import dayjs from "dayjs";

interface Process {
  nodeName: string;
  time: string;
  departmentName: string;
  userName: string;
  description: string;
  currentNode?: string;
  id: string;
}
const process = ref<any>({});
const dialogVisible = ref(false);
const caseRecodeService = new CaseRecodeService();
const lettersVisitService = new LettersVisitService();
const props = withDefaults(defineProps<{ taskId: string }>(), {
  taskId: "",
});
const processList = ref<Process[]>([]);
const isSort = ref(true);
const getProcessFlow = () => {
  // TODO: 接入接口
  lettersVisitService.find(props.taskId).then((res: Response) => {
    // console.log('res', res)
    res.data.forEach((item: any) => {
      item.time = dayjs(item.createTime).format("YYYY-MM-DD HH:mm");
    });
    processList.value = res.data;
  });
};
const turnOver = () => {
  isSort.value = !isSort.value;
  processList.value = processList.value.reverse();
};
const showDetail = (pro: any) => {
  process.value = pro;
  dialogVisible.value = true;
};
defineExpose({
  turnOver,
});
watch(() => props.taskId, getProcessFlow, {
  immediate: true,
});
</script>

<style lang="scss" scoped>
.sort {
  width: 20px;
  cursor: pointer;
}
.process {
  display: flex;
  padding-bottom: 10px;
  box-sizing: border-box;
  .processing {
    display: flex;
    flex-direction: column;
    align-items: center;
    // justify-content: stretch;
    justify-content: space-between;
    margin-right: 20px;
    .el-checkbox {
      height: fit-content;
      margin-top: 5px;
    }

    .dashedLine {
      position: relative;
      height: calc(100% - 20px);
      border-left: 2px dashed var(--sh3h-tags-active-font-color);

      &::before {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-60%, -50%);
        content: "";
        width: 0;
        height: 0;
        border-bottom: 10px solid var(--sh3h-tags-active-font-color);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
      }
    }
    .dashedLineRotate{
      transform: rotateZ(180deg);
    }
  }

  .content {
    flex: 1;
    max-width: calc(100% - 35px);
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-16,
      var(--el-color-info)
    );
    font-weight: bold;

    .line {
      // margin-bottom: 5px;
      width: 100%;
      overflow: hidden; //超出的文本隐藏
      text-overflow: ellipsis; //溢出用省略号显示
      white-space: nowrap; // 默认不换行；
    }

    .status {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      cursor: pointer;

      .sta {
        color: var(--sh3h-tags-active-font-color);
        font-size: 16px;
      }
    }
  }

  &:last-of-type {
    .dashedLine {
      border-left-width: 0;

      &::before {
        border-bottom-width: 0;
      }
    }
  }
}
</style>
