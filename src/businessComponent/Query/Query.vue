<template>
  <div class="searchWrapper">
    <div class="searchText">
      <el-icon class="icon" @click="clearAll"><Filter /></el-icon>
      <div class="cnWrapper">
        <div class="cn" v-for="res in result">
          <div class="label">{{ res.label }}:&ensp;</div>
          <div class="label">{{ res.value }};&ensp;</div>
        </div>
      </div>
    </div>
    <div class="searchContent">
      <div class="filterQuery">
        <div
          class="btn"
          v-for="(query, index) in queryBtn"
          :class="query.isSelected ? 'active' : ''"
          @click="btnClick(index, query.key, query.value)"
        >
          <div :class="query.type" class="shortName">
            {{ query.shortName }}
          </div>
          <span class="name">{{ query.name }}</span>
        </div>
      </div>
      <el-button :icon="Search" @click="search" />
      <el-select
        v-model="keywords"
        multiple
        filterable
        ref="selectRef"
        allow-create
        default-first-option
        placeholder="请选择条件"
        @keyup.enter="search"
      >
        <el-option
          v-for="option in selectOptions"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-link
        type="primary"
        :underline="false"
        class="highSearch"
        @click="advControl = true"
        >高级搜索</el-link
      >
      <el-link
        type="primary"
        :underline="false"
        class="highSearch"
        @click="caseListExport"
        :disabled="disabled"
        v-if="props.export"
        >列表导出</el-link
      >
    </div>
  </div>
  <div class="advWrapper" v-show="advControl">
    <AdvanceSearch
      :isXF="props.isXF"
      @close="advControl = false"
      @paramsCn="getParams"
      :node-code="props.nodeCode"
      @clearPrams="clearAll"
      ref="advSearch"
    />
  </div>
</template>
<script lang="ts" setup>
import { Session } from "@/utils/storage";
import { options, xfOptions } from "./selectOpt";
import { ElMessage, ElSelect } from "element-plus";
import AdvanceSearch from "./AdvancedSearch.vue";
import { useNodeCode } from "@/hooks/useNodeCode";
import { SearchModel } from "@/api/model/baseModel";
import { ref, getCurrentInstance, nextTick, computed } from "vue";
import { Search, Filter } from "@element-plus/icons-vue";
import { CaseInfoModel } from "@/api/model/dispatchModel";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
import { CaseService } from "@/api/service/WorkTicket/CaseService";
import { useDepartment } from "@/hooks/useDepartment";
import { useRoute } from "vue-router";
import { debounce } from "lodash-es";

type Key = keyof CaseInfoModel;

interface Result {
  label: string;
  value: string;
}

const caseService = new CaseService();
const route = useRoute();
let queryBtn = ref([
  {
    type: "primary",
    shortName: "国",
    name: "国办单",
    isSelected: false,
    key: "CASE_TYPE",
    value: "3",
  },
  {
    type: "primary",
    shortName: "复",
    name: "复核单",
    isSelected: false,
    key: "CASE_TYPE",
    value: "2",
  },
  {
    type: "primary",
    shortName: "业",
    name: "业务单",
    isSelected: false,
    key: "CASE_TYPE",
    value: "0",
  },
  {
    type: "primary",
    shortName: "督",
    name: "督办单",
    isSelected: false,
    key: "CASE_TYPE",
    value: "1",
  },
]);
const props = withDefaults(
  defineProps<{
    nodeCode: NodeCodeKey;
    isXF?: boolean;
    export?: boolean;
  }>(),
  {
    isXF: false,
    export: false,
  }
);
const selectOptions = computed(() => {
  return props.isXF ? xfOptions : options;
});
const disabled = ref(false)
const advSearch = ref();
const { currentDepartmentCode } = useDepartment();
const selectRef = ref<InstanceType<typeof ElSelect>>();
const keywords = ref<Key[]>(["taskId"]);
const result = ref<Result[]>([]);
const advControl = ref(false);
const { getSortByNodeCode, getSessionParams } = useNodeCode();
const { proxy } = <any>getCurrentInstance()!;
const emit = defineEmits(["getPrams"]);
const searchModel = ref<SearchModel<CaseInfoModel>[]>([]);
const btnClick = (index: number, key: Key, value: string) => {
  queryBtn.value[index].isSelected = !queryBtn.value[index].isSelected;
  searchModel.value = [...getSessionParams(props.nodeCode)];
  if (queryBtn.value.filter(({ isSelected }) => isSelected).length > 0) {
    //需要用or
    const filterQuery = queryBtn.value.filter(({ isSelected }) => isSelected);
    searchModel.value.push({
      key: "caseType",
      value: "",
      match: "in",
    });
    let str = "";
    filterQuery.forEach((other) => {
      str += other.value + ",";
    });
    searchModel.value[searchModel.value.length - 1].value = (
      searchModel.value[searchModel.value.length - 1].value + str
    ).slice(0, str.length - 1);
  }
  emit("getPrams", searchModel.value);
};
const clearAll = () => {
  Session.remove("advCnForm");
  Session.remove("advSearch");
  Session.remove("advFormData");
  result.value = [];
  const defaultParams = getSortByNodeCode(props.nodeCode);
  proxy.mittBus.emit("advParams", defaultParams);
  advSearch.value.clear();
};
const getParams = (advCnForm: any) => {
  result.value = [];
  Object.keys(advCnForm).forEach((key) => {
    result.value.push({
      label: key,
      value: advCnForm[key],
    });
  });
};
if (Session.get("advCnForm")) {
  result.value = [];
  const advCnForm = Session.get("advCnForm");
  getParams(advCnForm);
}

const search = () => {
  const [key, value] = keywords.value;
  searchModel.value = [
    {
      key,
      value: value ? String(value) : "",
      match: "like",
    },
    ...getSessionParams(props.nodeCode),
  ];
  
  nextTick(() => {
    selectRef.value?.blur();
  });
  emit("getPrams", searchModel.value);
};
const caseListExport = debounce(()=>{
  disabled.value = true
  let params = sessionStorage.getItem('advFormData') ? JSON.parse(sessionStorage.getItem('advFormData')!) : {};
  params.nodeCode = props.nodeCode
  params.flowName = route.query.flowName
  params.deptCode = currentDepartmentCode
  
  caseService.postExportCase(params).then(res=>{
    disabled.value = false
    if(res.code == 200){
      ElMessage({
        type:res.code == 200 ? 'success' : 'error',
        message: '离线导出成功，请在导出列表中下载对应文件',
      })
    }else{
      ElMessage({
        type:res.code == 200 ? 'success' : 'error',
        message: res.message,
      })
    }
  })
},500)
</script>

<style lang="scss" scoped>
.searchWrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  ::v-deep(.el-select) {
    width: 300px;
    margin-left: -5px;
    .el-select__tags {
      & > span {
        display: flex;
      }
    }
  }
  .highSearch {
    margin: 5px ;
  }
  .searchContent {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .searchText {
    display: flex;
    justify-content: center;
    align-items: center;
    .icon {
      font-size: $font-size-26;
      margin-right: 10px;
      color: var(--el-color-primary);
      cursor: pointer;
    }
    .cnWrapper {
      display: flex;
      flex-wrap: wrap;
      max-width: 800px;
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-16,
        var(--sh3h-value-color)
      );
      font-weight: bold;
      .cn {
        display: flex;
      }
    }
  }
  .filterQuery {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-14,
      var(--sh3h-label-color)
    );

    .btn {
      display: flex;
      margin-right: 15px;
      .name {
        margin-left: 10px;
        line-height: 25px;
      }
      .shortName {
        width: 25px;
        height: 25px;
        line-height: 25px;
        text-align: center;
        color: var(--sh3h-head-font-color);
        font-size: 12px;
        border-radius: 2px;
        background-color: var(--el-color-info);
      }

      &.active {
        &:nth-of-type(1) {
          .shortName {
            background-color: var(--sh3h-initiative-color);
          }
        }
        &:nth-of-type(2) {
          .shortName {
            background-color: var(--sh3h-mark-green-color);
          }
        }
        &:nth-of-type(3) {
          .shortName {
            background-color: var(--sh3h-mark-blue-color);
          }
        }
        &:nth-of-type(4) {
          .shortName {
            background-color: var(--el-color-warning);
          }
        }
      }
    }
  }
}
</style>
