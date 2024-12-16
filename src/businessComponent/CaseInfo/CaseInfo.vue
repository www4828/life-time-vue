<template>
  <div class="caseInfo">
    <div class="caseHeader">
      <div class="flexWrapper">
        <div class="taskId">
          <span class="titleLabel">工单编号</span>
          <span
            class="titleValue cursor marginR"
            @click="jumpToDetail(props.caseInfo.taskId + '')"
            >{{ props.caseInfo.taskId }}</span
          >
        </div>
        <CaseIcon v-if="markIcons.icons.length > 0" :icons="markIcons.icons" :task-id="props.caseInfo.taskId + ''" />
      </div>
      <div class="concatWrapper">
        <span class="titleLabel" v-show="showExternal">外系统编号</span>
        <span
          class="titleValue concat"
          v-show="showExternal"
          @click="
            jump(props.caseInfo.eventSourceCode === '2', props.caseInfo.externalNumber)
          "
          >{{ props.caseInfo.externalNumber }}</span
        >
        <div class="formType" :class="getIConClass">
          <span class="titleLabel">事件来源</span>
          <span class="titleValue">{{ props.caseInfo.eventSourceName }}</span>
        </div>
      </div>
    </div>
    <div class="caseContent">
      <div class="caseDetail">
        <el-row :gutter="20" class="marginB">
          <el-col :span="5">
            <span class="label">接报时间：</span>
            <span class="value">{{ props.caseInfo.reportTime }}</span>
          </el-col>
          <el-col :span="4">
            <span class="label">业务类型：</span>
            <span class="value">{{ props.caseInfo.businessTypeName }}</span>
          </el-col>
          <el-col :span="5">
            <span class="label">反映来源：</span>
            <span class="value">{{ props.caseInfo.reflectSourceName }}</span>
          </el-col>
          <el-col :span="5">
            <span class="label">反&ensp;映&ensp;人：</span>
            <span class="value address">
              <el-tooltip placement="top" effect="light">
                <template #content>
                  {{ props.caseInfo.reportPerson }} {{ userPhone }}
                </template>
                {{ props.caseInfo.reportPerson }} {{ userPhone }}
              </el-tooltip>
            </span>
          </el-col>
          <el-col :span="5">
            <span class="label">反映区名：</span>
            <span class="value">{{ props.caseInfo.districtName }}</span>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="marginB">
          <el-col :span="5">
            <span class="label">主责部门：</span>
            <span class="value">{{ props.caseInfo.executeDepartmentName }}</span>
          </el-col>
          <el-col :span="9">
            <span class="label">事项类别：</span>
            <span class="value">{{ classType }}</span>
          </el-col>
          <el-col :span="10">
            <span class="label">发生地址：</span>
            <span class="value address">
              <el-tooltip placement="top" effect="light" :content="props.caseInfo.sourceAddress"
                >{{ props.caseInfo.sourceAddress }}
              </el-tooltip>
            </span>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="marginB">
          <el-col :span="21">
            <span class="label">问题描述：</span>
            <span class="value description">
              {{ props.caseInfo.description }}
            </span>
          </el-col>
          <el-col :span="3" class="buttonGroup">
            <ButtonGropup
              class="buttonWrapper"
              :row="props.caseInfo"
              :list="props.buttons"
              @dropdownClick="editHandle"
              @commandClick="commandClick"
            ></ButtonGropup>
          </el-col>
          <div class="caseMarkWrapper" v-if="markIcons.caseMark.length>0" :class="{ topNegative: isShortDes }">
            <CaseMark :caseMark="markIcons.caseMark"></CaseMark>
          </div>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { cloneDeep } from "lodash-es";
import { ElMessage } from "element-plus";
import { useLock } from "@/hooks/useLock";
import { getTaskIcon } from "@/hooks/useMarkIcon";
import { getCurrentInstance, computed,watch, reactive } from "vue";
import { useDepartment } from "@/hooks/useDepartment";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import CaseIcon from "@/businessComponent/CaseIcon/CaseIcon.vue";
import CaseMark from "@/businessComponent/CaseMark/CaseMark.vue";
import ButtonGropup from "@/components/ButtonGroup/ButtonGropup.vue";
import { CaseInfoModel, ButtonInfoModel } from "@/api/model/dispatchModel";
import { Icon, MarkIcon, MarkType, ClassName } from "@/businessComponent/CaseIcon/type";

const props = defineProps<{
  caseInfo: CaseInfoModel;
  buttons: ButtonInfoModel[];
  tagsAndWaterMarks?: any
}>();
const { jumpToDetail, jumpToXFDetail } = useCaseDetail();
const { lockCase, hasLockCase, isLocked } = useLock();
const { jumpToOldDetail } = useCaseDetail();
const { proxy } = <any>getCurrentInstance()!;
// const { markIcons } = getTaskIcon(props.tagsAndWaterMarks);
const markIcons = reactive({
  icons:[] as Icon[],
  caseMark:[] as MarkIcon[]
})
const getIConClass = computed(() => {
  if (props.caseInfo.eventSourceCode === "1") {
    return "hotLine";
  } else if (props.caseInfo.eventSourceCode === "2") {
    return "other";
  }
  return props.caseInfo.eventSourceName;
});
const showExternal = computed(() => {
  return props.caseInfo?.externalNumber !== "";
});
const isShortDes = computed(() => {
  return props.caseInfo.description.length <= 77;
});
const { username } = useDepartment();
const userPhone = computed(() => {
  const phone = props.caseInfo.contactPhone || props.caseInfo.reportPhone;
  return phone ? "-" + phone : "";
});
const classType = computed(() => {
  return props.caseInfo.reflectIndustryName + "-" + props.caseInfo.reflectClassName;
});
const getButton = (buttonName: string): ButtonInfoModel => {
  const btn = cloneDeep(props.buttons);

  return btn.find(({ name }) => name === buttonName)!;
};
const jump = (is12319: boolean, url: string) => {
  if (is12319) return;
  jumpToOldDetail(url);
};

const commandClick = (buttonName: string) => {
  const button = getButton(buttonName);
  dealDoneButton(button);
};
const dealDoneButton = (params: ButtonInfoModel) => {
  if (params.name === "派遣" || params.name === "销单" || params.name === "案件详情") {
    proxy.mittBus.emit("grandsonClick", {
      buttonInfo: {...params},
      callBackButtons: cloneDeep(props.buttons),
      
    });
  } else {
    const taskId = props.caseInfo.taskId + "";
    // 先请求当前登录人是否有案件被锁 如果没有再判断案件是否上锁 上锁的人是当前用户还是其他用户
    isLocked(taskId, params.code!).then((lockStatus) => {
      // 判断当前用户是否有锁单的情况
      if (typeof lockStatus === "boolean") {
        hasLockCase().then((status) => {
          if (typeof status === "boolean") {
            lockCase(taskId).then(() => {
              proxy.mittBus.emit("grandsonClick", {
                buttonInfo: {...params,eventSource: props.caseInfo.eventSourceCode},
                callBackButtons: cloneDeep(props.buttons),
              });
            }).catch((err)=>{
              if(err.message){
                ElMessage.error(err.message)
              }
            });
          } else {
            ElMessage.error(status as string);
          }
        });
      } else {
        if(lockStatus.indexOf('批量') > -1){
          ElMessage.error(lockStatus as string);
        }else{
          const pattern = /用户:(\w+)/;
          const match = (lockStatus as string).match(pattern);
          const name = match ? match[1] : "";
          if (username === name) {
            proxy.mittBus.emit("grandsonClick", {
              buttonInfo: {...params,eventSource: props.caseInfo.eventSourceCode},
              callBackButtons: cloneDeep(props.buttons),
            });
          } else {
            ElMessage.error(lockStatus as string);
          }
        }
      }
    });
  }
};

const editHandle = () => {
  const params = props.buttons[0];
  dealDoneButton(params);
};

watch(()=>props.tagsAndWaterMarks,()=>{
  if(props.tagsAndWaterMarks){
    let marks:any = getTaskIcon(props.tagsAndWaterMarks);
    markIcons.icons = marks.icons
    markIcons.caseMark = marks.caseMark
  }
},{
  immediate: true
})
</script>

<style lang="scss" scoped>
.caseInfo {
  margin-bottom: 17px;
  overflow: hidden;

  .caseHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    padding: 0 20px;
    background: url("@/assets/list/headerIcon.png") no-repeat left center
      var(--sh3h-case-header-color);
    background-size: 7px 48px;

    .flexWrapper,
    .taskId,
    .formType {
      display: flex;
    }

    .taskId {
      padding-left: 30px;
      background: url("@/assets/list/taskId.png") no-repeat left center;
    }

    .formType {
      padding-left: 30px;
      background: url("@/assets/list/formType.png") no-repeat left center / 21px;

      &.hotLine {
        background-image: url("@/assets/list/12345.png");
      }

      &.other {
        background-image: url("@/assets/list/other.png");
      }
    }

    .caseIcon {
      margin: 0 20px;
      max-width: 300px;
    }
  }

  .concatWrapper {
    display: flex;

    .concat {
      margin-right: 20px;
    }
  }

  .titleLabel {
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-18,
      var(--sh3h-label-color)
    );
    font-weight: bold;
    margin-right: 10px;
  }

  .label {
    width: 100px;
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-18,
      var(--sh3h-label-color)
    );
    margin-right: 10px;
  }

  .titleValue {
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-18,
      var(--sh3h-value-color)
    );
    font-weight: bold;

    &.marginR {
      margin-right: 10px;
    }

    &.cursor {
      cursor: pointer;
    }
  }

  .value {
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-18,
      var(--sh3h-value-color)
    );
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

  .caseContent {
    display: flex;
    padding: 0 20px;
    background-color: var(--sh3h-taskInfo-background-color);

    .caseDetail {
      position: relative;
      display: flex;
      width: 100%;
      flex-direction: column;
      padding: 10px 0;
      height: 100%;
      box-sizing: border-box;

      ::v-deep(.el-row) {
        .el-col {
          display: flex;
          height: 100%;
        }

        &:nth-of-type(2) {
          flex: 1;
          height: 70%;
        }
      }

      .caseMarkWrapper {
        position: absolute;
        right: 130px;
        top: 0;
        display: flex;

        &.topNegative {
          top: -30px;
        }
      }

      .buttonGroup {
        position: absolute;
        right: 52px;
        top: 0;
      }
    }

    .marginB {
      margin-bottom: 10px;
    }

    .wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;

      & > div {
        display: flex;
      }
    }

    .desc {
      margin-top: 5px;
    }
  }
}
</style>
