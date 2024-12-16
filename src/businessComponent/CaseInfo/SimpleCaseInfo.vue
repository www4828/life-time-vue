<template>
  <div class="SimpleCaseInfo">
    <div class="SimpleCaseInfo-title">
      <el-row :gutter="3" >
        <el-col :span="6">
          <div class="col">
            <span class="label">工单编号</span>
            <span class="value">{{props.caseInfo.TASKID}}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="col">
            <span class="label">案件类型</span>
            <span class="value">{{props.caseInfo.CASETYPE}}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="col">
            <span class="label">接报时间</span>
            <span class="value">{{props.caseInfo.REPORT_TIME ? props.caseInfo.REPORT_TIME.replace('T',' ') : ''}}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="col">
            <span class="label">反应内容</span>
            <span class="value">
              <el-tooltip placement="bottom" effect="light" :content="props.caseInfo.FYNR">{{ props.caseInfo.FYNR }}
              </el-tooltip>
            </span>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="SimpleCaseInfo-content">
      <span class="label">问题描述</span>
      <span class="value description">
        {{ props.caseInfo.DESCRIPTION }}
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import Title from '@/components/Title/Title.vue'
import { replace } from 'lodash-es';
const props = withDefaults(defineProps<{
  caseInfo: any
}>(), {})

</script>

<style lang="scss" scoped>
.SimpleCaseInfo{
  @include fontStyle(var(--sh3h-font-family-medium), $font-size-18, var(--sh3h-label-color));
  width: 100%;
  height: 142px;
  box-sizing: border-box;
  overflow: hidden;
  margin-bottom: 15px;
  .SimpleCaseInfo-title{
    width: 100%;
    height: 45px;
    .el-row{
      height: 100%;
      .el-col{
        height: 100%;
        .col{
          height: 100%;
          background-color: var(--sh3h-home-title-blue);
          line-height: 45px;
          padding-left: 60px;
          width: 100%;
          box-sizing: border-box;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        &:nth-of-type(2){
          .value{
            margin-left: 50px;
          }
        }
      }
      
    }
  }
  .label{
    @include fontStyle(var(--sh3h-font-family-medium), $font-size-20, var(--sh3h-value-color));
    margin-right: 10px;
  }
  .SimpleCaseInfo-content{
    width: 100%;
    height: 100px;
    padding: 10px 20px 10px 60px;
    box-sizing: border-box;
    background-color: var(--sh3h-menu-background-color);
    display: flex;
    .label{
      white-space: nowrap;
    }
    .value{
      line-height: 34px;
      max-height: 100px;
      overflow-y: auto;
    }
  }
}
</style>
