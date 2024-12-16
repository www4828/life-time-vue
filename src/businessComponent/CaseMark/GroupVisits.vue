<template>
  <div class="groupvisits">
    <Title title="群访件（多人一诉）" class="marginB" align="flex-start">
    </Title>
    <div class="content">
      <div class="row">
        <span class="label">报警标题:</span>
        <span class="value description"> {{ groupvisitsInfo.title }} </span>
      </div>
      <div class="row">
        <span class="label">地址:</span>
        <span class="value description"> 闵行区顾戴路2000弄92号2201室 </span>
      </div>
      <div class="row">
        <span class="label">报警产生:</span>
        <span class="value description"> 2024-10-19 00:35:53 </span>
      </div>
      <div class="row">
        <span class="label">报警更新:</span>
        <span class="value description"> 2024-10-19 00:35:53 </span>
      </div>
      <div class="row">
        <span class="label">涉及案件:</span>
        <span class="value description"> 24件 </span>
      </div>

    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { MarkIcon } from "../CaseIcon/type";
import Title from '@/components/Title/Title.vue'

const props = withDefaults(
  defineProps<{
    caseMark?: MarkIcon[];
    taskId?: string | number;
  }>(),
  {
    taskId: "",
  }
);
const groupvisitsInfo = reactive({
  title: '核心问题概要：2020年交付的皇都花园三期92号楼漏水积水，导致异味和重大安全隐患，质保期内问题未得到有效解决，业主要求管理部门核实监督整改房屋质量问题。',

}) 
</script>

<style lang="scss" scoped>
.groupvisits {
  .content {
    width: 100%;

    .row {
      width: 100%;
      display: flex;
      margin-bottom: 10px;
    }
  }

  .label {
    width: 100px;
    @include fontStyle(var(--sh3h-font-family-medium),
      $font-size-16,
      var(--sh3h-label-color));
    margin-right: 5px;
  }

  .value {
    @include fontStyle(var(--sh3h-font-family-medium),
      $font-size-16,
      var(--sh3h-value-color));
    font-weight: bold;

    &.address {
      width: calc(100% - 90px);
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    &.description {
      width: calc(100% - 150px);
      max-height: 75px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 5px;
      }
    }
  }

}
</style>
