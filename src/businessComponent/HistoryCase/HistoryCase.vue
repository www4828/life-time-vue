<template>
  <Title title="历史工单">
    <template #content>
      <div class="historyContentWrapper" :class="{ isEmpty: historyCase.length === 0 }">
        <div class="historyWrapper" v-if="historyCase.length > 0">
          <div class="history" v-for="history in historyCase">
            <div class="taskId" @click="jumpToDetail(history.taskId, true)">
              <span class="label">任务单号</span
              ><span class="value"
                >{{ history.taskId
                }}<el-button
                  :type="history.flowState === 'Z400' ? 'info' : 'primary'"
                  round
                  size="small"
                  class="status"
                  >{{ history.flowStateName }}</el-button
                ></span
              >
            </div>
            <div class="externalNumber">
              <span class="label">外系统编号</span>
              <span class="value" @click="jumpToOldDetail(history.externalNumber!)" >{{ history.externalNumber }}</span>
            </div>
            <div class="desc">
              <span class="label">接报时间</span>
              <span class="value">{{ history.reportTime }}</span>
            </div>
            <div class="desc">
              <span class="label">事件描述</span>
              <el-tooltip placement="left" effect="light" :popper-options="{ modifiers: sameWidth }">
                <template #content>
                  {{ history.description }}
                </template>
                <span class="value">{{ history.description }}</span>
              </el-tooltip>
            </div>
          </div>
        </div>
        <el-empty description="暂无历史工单" v-else />
      </div>
    </template>
  </Title>
</template>
<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import Title from "@/components/Title/Title.vue";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
const props = defineProps<{
  phone: string;
  taskId?: string;
}>();
interface HistoryCase {
  taskId: string;
  description: string;
  flowState: string;
  flowStateName: string;
  reportTime: string;
  externalNumber: string;
}
const historyCase = ref<HistoryCase[]>([]);
const { jumpToDetail, jumpToOldDetail } = useCaseDetail();
const caseService = new CaseService();
const getHistoryCase = () => {
  historyCase.value = [];
  caseService.getHistoryCase(props.phone, props.taskId).then((res) => {
    if (res.code === 200) {
      res.data.forEach((item: any) => {
        historyCase.value.push({
          taskId: item.taskId,
          description: item.description,
          flowState: item.flowState,
          flowStateName: item.flowStateName,
          reportTime: item.reportTime,
          externalNumber: item.externalNumber,
        });
      });
    }
  });
};
const sameWidth:any = [{
  name: "sameWidth",
  enabled: true,
  phase: "beforeWrite",
  requires: ["computeStyles"],
  fn: ({ state }:any) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }:any) => {
    state.elements.popper.style.width = `${
      state.elements.reference.offsetWidth
    }px`;
    state.elements.popper.style.fontSize = '16px'
    state.elements.popper.style.letterSpacing = '2px'
  }
}];
watchEffect(() => {
  if (props.phone !== "0" && props.phone !== "" && props.phone !== "-") {
    getHistoryCase();
  }
});
</script>

<style lang="scss" scoped>
.historyContentWrapper {
  display: flex;
  flex-direction: column;
  height: 80%;
  ::v-deep(.el-empty) {
    padding: 0;
  }
  .historyWrapper {
    width: 100%;
    .history {
      padding-bottom: 10px;
      border-bottom: 1px dashed #ccc;
      .label,
      .value {
        @include fontStyle(
          var(--sh3h-font-family-medium),
          $font-size-16,
          var(--sh3h-historyCase-label-color)
        );
      }
      .label {
        width: 30%;
        text-align: justify;
        text-align-last: justify;
        padding-right: 10px;
        box-sizing: border-box;
        &::after{
          content: '：';
          float: right;
        }
      }
      .value {
        width: 70%;
        color: var(--sh3h-historyCase-value-color);
      }
      .taskId,
      .externalNumber,
      .desc {
        display: flex;
        .value {
          display: -webkit-box;
          word-break: break-all;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: pre-line;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      }
      .taskId {
        padding-top: 10px;
        cursor: pointer;
      }
      .externalNumber{
        .value{
          cursor: pointer;
        }
      }
      .status {
        margin-left: 10px;
      }
    }
  }
  &.isEmpty {
    justify-content: center;
    align-items: center;
  }
}
</style>
