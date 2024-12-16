<template>
  <div class="caseMark">
    <div class="mark" v-for="mark in props.caseMark" :class="[mark.className, mark.type]">
      <el-popover placement="left" :width="500" trigger="click" @show="show=true" @hide="show=false">
        <template #reference>
          <span v-if="mark.name.indexOf('群访') > -1">{{ mark.name }}</span>
        </template>
        <GroupVisits :uuid="mark.note" v-if="show"/>
      </el-popover>
      <span v-if="mark.name.indexOf('群访') === -1">{{ mark.name }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { MarkIcon } from "../CaseIcon/type";
import GroupVisits from "@/businessComponent/GroupVisits/GroupVisitsPopup.vue";

const props = withDefaults(
  defineProps<{
    caseMark?: MarkIcon[];
    taskId?: string | number;
  }>(),
  {
    taskId: "",
  }
);
const show=ref(false)
</script>

<style lang="scss" scoped>
.caseMark {
  display: flex;

  .mark {
    position: relative;
    width: 72px;
    height: 68px;

    &.round {
      background: url("@/assets/taskMark/blueRound.png") no-repeat center;
      background-size: 100% 100%;
      @include fontStyle(var(--sh3h-font-family-medium),
        $font-size-16,
        var(--sh3h-mark-blue-color));
      font-weight: bold;

      span {
        position: absolute;
        top: 30%;
        left: 5%;
        width: 100%;
        text-align: center;
        transform: rotate(20deg);
        cursor: pointer;
      }

      &.red {
        background-image: url("@/assets/taskMark/redRound.png");
        color: var(--sh3h-mark-red-color);
      }

      &.blue {
        background-image: url("@/assets/taskMark/blueRound.png");
        color: var(--sh3h-mark-blue-color);
      }

      &.green {
        background-image: url("@/assets/taskMark/greenRound.png");
        color: var(--sh3h-mark-green-color);
      }
    }

    &.rect {
      width: 82px;
      height: 36px;
      background: url("@/assets/taskMark/blueRect.png") no-repeat center;
      background-size: 100% 100%;
      @include fontStyle(var(--sh3h-font-family-medium),
        $font-size-16,
        var(--sh3h-mark-blue-color));
      font-weight: bold;

      span {
        position: absolute;
        top: 20%;
        width: 100%;
        text-align: center;
        font-size: $font-size-14;
      }

      &.red {
        background-image: url("@/assets/taskMark/redRect.png");
        color: var(--sh3h-mark-red-color);
      }

      &.blue {
        background-image: url("@/assets/taskMark/blueRect.png");
        color: var(--sh3h-mark-blue-color);
      }

      &.green {
        background-image: url("@/assets/taskMark/greenRect.png");
        color: var(--sh3h-mark-green-color);
      }
    }
  }
}
</style>
