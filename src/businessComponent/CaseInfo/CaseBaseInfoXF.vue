<template>
  <div class="baseinfo">
    <Title title="基本信息" class="marginB" align="flex-start">
      <CaseIcon :icons="markIcon" />
      <template #content>
        <el-form :model="caseInfo" class="from" ref="reportForm">
          <el-row>
            <el-col :span="6">
              <el-form-item label="信访单号">
                <el-link :underline="false" @click="jumpToXFDetail(props.taskId)">{{
                  caseInfo.taskId
                }}</el-link>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-show="caseInfo.xfTaskId">
              <el-form-item label="工单编号">
                <el-link :underline="false" @click="jumpToDetail(caseInfo.xfTaskId)">{{
                  caseInfo.xfTaskId
                }}</el-link>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="事件来源">
                <span>{{ caseInfo.eventSourceName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="反&ensp;映&ensp;人">
                <span
                  >{{ caseInfo.reportPerson }} -
                  {{ caseInfo.contactPhone || caseInfo.reportPhone }}</span
                >
              </el-form-item>
            </el-col>
            <!-- </el-row>
          <el-row> -->
            <el-col :span="6">
              <el-form-item label="接报时间">
                <span>{{ caseInfo.reportTime || "--" }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="紧急程度" prop="caseInfo.emergency">
                <span>{{ caseInfo.emergencyName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="反映区名" prop="caseInfo.district">
                <span>{{ caseInfo.districtName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="caseInfo.externalNumber !== ''">
              <el-form-item label="关联单号">
                <div v-if="caseInfo.xfTaskId !== ''">
                  <el-link
                    @click="canJump(caseInfo.externalNumber!, caseInfo.eventSourceCode)"
                    type="primary"
                    :underline="false"
                    >{{ caseInfo.externalNumber || "--" }}</el-link
                  >
                </div>
                <el-link
                  v-else
                  @click="
                  canJump2(caseInfo.externalNumber!)
                  "
                  type="primary"
                  :underline="false"
                  >{{ caseInfo.externalNumber || "--" }}</el-link
                >
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="特殊标签">
                <el-select v-if="props.specialEdit" v-model="specialTips" multiple collapse-tags collapse-tags-tooltip >
                  <el-option
                    v-for="type in specialTypes"
                    :label="type.codeName"
                    :value="type.codeValue"
                  />
                </el-select>
                <div v-else>
                  <template v-for="item in caseInfo.specialName?.split(',')">
                    <el-tag :style="{ marginRight: '5px' }" v-if="item">{{ item }}</el-tag>
                  </template>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="案件状态">
                <el-tag :style="{ marginRight: '5px' }">{{
                  caseInfo.flowStateName
                }}</el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="工单类型">
                <span>{{ caseInfo.caseTypeName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="业务类型">
                <span>{{ caseInfo.businessTypeName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="主责部门" prop="caseInfo.district">
                <span>{{ caseInfo.executeDepartmentName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="canShow">
              <el-form-item label="协办部门">
                <span>{{ caseInfo.cooperateDepartmentName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="caseInfo.eventSourceCode == '1'">
              <!-- <el-col :span="12"> -->
              <el-form-item label="原始分类">
                <span
                  >{{ caseInfo?.class1 }}
                  -
                  {{ caseInfo?.class2 }}
                  -
                  {{ caseInfo?.class3 }}
                  -
                  {{ caseInfo?.class4 }}
                </span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="事项类别">
                <span
                  >{{ caseInfo.reflectIndustryName }} -
                  {{ caseInfo.reflectClassName }}</span
                >
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="原截止时间">
                <span>{{ caseInfo.deadline }}</span>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="6">
              <el-form-item label="退单截止时间">
                <span>{{ caseInfo.tdjzTime }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="延期截止时间">
                <span>{{ caseInfo.yqjzTime }}</span>
              </el-form-item>
            </el-col> -->
          </el-row>
          <el-row> </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="发生地址">
                <span>{{ caseInfo.sourceAddress }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="定位地址">
                <span>{{ caseInfo.address }}</span>
                <el-link
                  type="primary"
                  :icon="LocationInformation"
                  :style="{ marginLeft: '5px', fontSize: '20px' }"
                  @click="showMap"
                  v-show="caseInfo.lon !== '' && caseInfo.lat !== ''"
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="24" v-if="caseInfo.splitTaskID">
              <el-form-item label="拆单">
                <SplitOrder :task-id="props.taskId" />
                <!-- <span>{{ caseInfo.splitTaskID }}</span> -->
                <!-- <el-link
                  type="primary"
                  :underline="false"
                  v-for="(item,index) in caseInfo.splitTaskID?.split(',')"
                  :key="item"
                  @click="jumpToXFDetail(item)"
                >
                  {{ item }}
                  
                  {{ (caseInfo.splitTaskID?.split(',').length > 1 && index !==caseInfo.splitTaskID?.split(',').length - 1) ? ',' : ''}}
                </el-link> -->
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="问题描述" prop="caseInfo.description">
            <span>
              {{ caseInfo.description }}
              <el-tooltip
                placement="top"
                effect="light"
                :content="description"
                raw-content
                popper-class="descriptionContent"
              >
                <el-link type="primary" :underline="false">
                  <el-icon><View /></el-icon>
                </el-link>
              </el-tooltip>
            </span>
          </el-form-item>
        </el-form>
        <div class="caseMarkWrapper">
          <CaseMark :caseMark="markIcons.caseMark"></CaseMark>
        </div>
      </template>
    </Title>
  </div>
</template>
<script lang="ts" setup>
import { cloneDeep, isEmpty, padStart } from "lodash-es";
import { ElMessage } from "element-plus";
import { useCode } from "@/hooks/useCode";
import Title from "@/components/Title/Title.vue";
import { useMarkIconXF } from "@/hooks/useMarkIcon";
import { useDepartment } from "@/hooks/useDepartment";
import { useTransform } from "@/hooks/useTransform";
import { CaseFormModel, SpecialTipsModel } from "@/api/model/caseModel";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import CaseIcon from "@/businessComponent/CaseIcon/CaseIcon.vue";
import CaseMark from "@/businessComponent/CaseMark/CaseMark.vue";
import SplitOrder from "./SplitOrder.vue";
import { LocationInformation, View } from "@element-plus/icons-vue";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import {
  reactive,
  watchEffect,
  getCurrentInstance,
  onBeforeUnmount,
  computed,ref
} from "vue";
import { Session } from "@/utils/storage";

const props = defineProps<{
  taskId: string;
  specialEdit:boolean
}>();

const { sourceTypes, specialTypes } = useCode();
const { proxy } = <any>getCurrentInstance()!;
const emit = defineEmits(["setCaseInfo", "getDeadline"]);
const { markIcons } = useMarkIconXF(props.taskId);
const { jumpToXFDetail, getDetailXF, jumpToOldDetail, jumpToDetail } = useCaseDetail();
const { currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const { getDisposeList } = useTransform();
const specialTips = ref<string[]>([]);
const filterSpecialTips = ref<string[]>([]);
const description = computed(() => {
  const str = caseInfo.description.replace(
    /[。.]/g,
    "。<br/> &nbsp; &nbsp; &nbsp; &nbsp;"
  );
  return padStart(str, str.length + 42, "&nbsp;");
});
const caseInfo = reactive<CaseFormModel>({
  taskId: 0,
  eventSourceCode: "",
  eventSource: "",
  repeatCount: 0,
  emergency: "",
  reportTime: "",
  reportPerson: "",
  repeatTaskId: "",
  address: "",
  reportPhone: "",
  district: "",
  reflectSourceCode: "",
  caseType: "",
  reflectIndustryCode: "",
  reflectIndustry: "",
  reflectIndustryName: "",
  reflectClassCode: "",
  reflectClass: "",
  reflectClassName: "",
  reflectContentCode: "",
  reflectContent: "",
  reflectContentName: "",
  description: "",
  contactPhone: "",
  isNM: "",
  reportDepartmentCode: "",
  eventSourceName: "",
  externalNumber: "",
  emergencyName: "",
  flowState: "",
  specialName: "",
  caseTypeName: "",
  districtName: "",
  class1: "",
  class2: "",
  class3: "",
  class4: "",
  lon: "",
  lat: "",
  locationAddress: "",
  locationDistrict: "",
  locationStreet: "",
  locationRoad: "",
  tdjzTime: "",
  yqjzTime: "",
  sourceAddress: "",
  cooperateDepartmentName: "",
});
const showMap = () => {
  proxy.mittBus.emit("tabClick");
  proxy.mittBus.emit("showMarker", { lng: caseInfo.lon, lat: caseInfo.lat });
};
onBeforeUnmount(() => {
  proxy.mittBus.off("waterMark");
});
const canShow = computed(() => {
  return !isEmpty(caseInfo.cooperateDepartmentName);
});
const markIcon = computed(() => {
  markIcons.icons.length > 0 &&
    emit(
      "getDeadline",
      markIcons.icons
        .find((item) => item.remark.indexOf("处置截止时间") > -1)
        ?.remark.split("时间:")[1]
    );
  if (caseInfo.tdjzTime !== "") {
    return [
      ...markIcons.icons,
      {
        name: "",
        icon: "",
        note: "退单截止时间" + caseInfo.tdjzTime,
        remark: "退单截止时间" + caseInfo.tdjzTime,
      },
    ];
  }

  return markIcons.icons;
});
const jumpTo = (taskId: string) => {
  const { externalSysUrl } = Session.get("appConfig").urls;
  window.open(`${externalSysUrl}${taskId}`);
};
const canJump = (wpid: string, code: string) => {
  if (code === "1") {
    jumpToOldDetail(wpid);
  }
};
const canJump2 = async (externalNumber: string) => {
  if (externalNumber !== "") {
    const xfDetail = await getDetailXF(externalNumber);
    if (xfDetail) {
      jumpToXFDetail(externalNumber);
    } else {
      ElMessage.error("本系统无此关联工单！");
    }
  }
};

const getSpecialTips = () => {
  if (specialTips.value.length === 0) {
    return [];
  }
  const tips = cloneDeep(specialTypes.value);
  // .filter((tip) => specialTips.value.some((special) => special === tip.codeValue))
  const filterTips: SpecialTipsModel[] = tips
    .filter(item=>specialTips.value.indexOf(item.codeValue) > -1)
    .map((special) => {
      return {
        specialCode: Number(special.codeValue),
        specialName: special.codeName,
        taskId: props.taskId,
      };
    });
  return filterTips
};

watchEffect(() => {
  if (props.taskId) {
    
    getDetailXF(props.taskId).then(async (data) => {
      Object.keys(data).forEach((key) => {
        caseInfo[key] = data[key];
      });
      filterSpecialTips.value = specialTips.value = caseInfo.specialCode ? caseInfo.specialCode.split(',') : []
      
      const { secondParam } = sourceTypes.value?.find(
        ({ codeValue }) => codeValue === caseInfo.businessType
      )!;
      proxy.mittBus.emit("getSecondParam", {
        secondParam,
        businessType: caseInfo.businessType,
        taskId: caseInfo.taskId,
        caseType: caseInfo.caseType,
        eventSourceCode: caseInfo.eventSourceCode,
        isGB: caseInfo.isGB === "1",
      });
      emit("setCaseInfo", data);
    });
  }
});
defineExpose({
  getSpecialTips
});
</script>

<style lang="scss" scoped>
.from {
  position: relative;
  margin-bottom: 10px;

  .caseMarks {
    position: absolute;
    z-index: 2;
    top: -45px;
    left: 50%;
    transform: translateX(-50%);
  }

  .el-form-item {
    margin-bottom: 5px;

    ::v-deep(label) {
      margin: 0;
      color: var(--sh3h-label-form-color);
      font-size: 16px;
      font-weight: bold;
      width: 90px;
    }

    ::v-deep(.el-form-item__content) {
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-16,
        var(--sh3h-value-color)
      );
      font-weight: bold;
    }
    ::v-deep(.el-link__inner) {
      font-size: 16px;
      font-weight: bold;
    }
    .zoomIcon {
      color: var(--sh3h-attachment-color);
      cursor: pointer;
      margin-left: 5px;
    }
  }
}
.caseMarkWrapper {
  display: flex;
  position: absolute;
  top: 39%;
  right: 30px;
  width: auto;
}
.content {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  .description {
    width: 99%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
