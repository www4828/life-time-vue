<template>
  <div class="searchWrapper">
    <div class="searchText">
      <el-form :model="form" class="formC" v-if="isMyQuery" >
        <el-form-item label="操作时间:">
          <el-date-picker
            v-model="form.createTime"
            type="daterange"
            range-separator="至"
            format="YYYY-MM-DD"
            @change="timeRange"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
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
        @change="changeSelect"
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
    </div>
  </div>
  <div class="advWrapper" v-show="advControl">
    <AdvanceSearch
      :isXF="props.isXF"
      @close="advControl = false"
      @paramsCn="getParams"
      :node-code="props.nodeCode"
      :is-my-query="props.isMyQuery"
      @clearPrams="clearAll"
      ref="advSearch"
    />
  </div>
</template>
<script lang="ts" setup>
import { Session } from '@/utils/storage'
import { options, xfOptions } from './selectOpt'
import { ElSelect } from 'element-plus'
import AdvanceSearch from './AdvancedSearch.vue'
import { useNodeCode } from '@/hooks/useNodeCode'
import { SearchModel } from '@/api/model/baseModel'
import { ref, getCurrentInstance, nextTick, computed, reactive, onBeforeUnmount } from 'vue'
import { Search, Filter } from '@element-plus/icons-vue'
import { CaseInfoModel } from '@/api/model/dispatchModel'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'

type Key = keyof CaseInfoModel

interface Result {
  label: string
  value: string
}

let queryBtn = ref([
  {
    type: 'primary',
    shortName: '国',
    name: '国办单',
    isSelected: false,
    key: 'CASE_TYPE',
    value: '3',
  },
  {
    type: 'primary',
    shortName: '复',
    name: '复核单',
    isSelected: false,
    key: 'CASE_TYPE',
    value: '2',
  },
  {
    type: 'primary',
    shortName: '业',
    name: '业务单',
    isSelected: false,
    key: 'CASE_TYPE',
    value: '0',
  },
  {
    type: 'primary',
    shortName: '督',
    name: '督办单',
    isSelected: false,
    key: 'CASE_TYPE',
    value: '1',
  },
])
const props = withDefaults(
  defineProps<{
    nodeCode: NodeCodeKey
    isXF?: boolean
    isMyQuery?: boolean
  }>(),
  {
    isXF: false,
    isMyQuery: false,
  }
)
const form = reactive({
  createTime: [dayjs().startOf('M'), dayjs()] as any,
  time: cloneDeep(Session.get('createTime'))
})
const selectOptions = computed(() => {
  return props.isXF ? xfOptions : options
})
const advSearch = ref()
const selectRef = ref<InstanceType<typeof ElSelect>>()
const keywords = ref<Key[]>(['taskId'])
const result = ref<Result[]>([])
const advControl = ref(false)
const { getSortByNodeCode, getSessionParams } = useNodeCode()
const { proxy } = <any>getCurrentInstance()!
const emit = defineEmits(['getPrams'])
const searchModel = ref<SearchModel<CaseInfoModel>[]>([])
const btnClick = (index: number, key: Key, value: string) => {
  queryBtn.value[index].isSelected = !queryBtn.value[index].isSelected
  searchModel.value = getSessionParams(props.nodeCode).filter(item=>item.key !== 'createTime');
  let time = cloneDeep(Session.get('createTime'));

  if (queryBtn.value.filter(({ isSelected }) => isSelected).length > 0) {
    //需要用or
    const filterQuery = queryBtn.value.filter(({ isSelected }) => isSelected)
    searchModel.value.push({
      key: 'caseType',
      value: '',
      match: 'in',
    })
    let str = ''
    filterQuery.forEach((other) => {
      str += other.value + ','
    })
    searchModel.value[searchModel.value.length - 1].value = (
      searchModel.value[searchModel.value.length - 1].value + str
    ).slice(0, str.length - 1)
  }
  searchModel.value = searchModel.value.concat(time)
  emit('getPrams', searchModel.value)
}
const clearAll = () => {
  Session.remove('advCnForm')
  Session.remove('advSearch')
  Session.remove('advFormData')
  Session.remove('createTime')
  result.value = []
  setDefault()
  const defaultParams = getSortByNodeCode(props.nodeCode)
  proxy.mittBus.emit('advParams', defaultParams)
  advSearch.value.clear()
}
const getParams = (advCnForm: any) => {
  result.value = []
  Object.keys(advCnForm).forEach((key) => {
    result.value.push({
      label: key,
      value: advCnForm[key],
    })
  })
}

const setDefault = () => {
  if (props.isMyQuery && !Session.get('advCnForm')) {
    result.value.push({
      label: '接报时间',
      value: '当月',
    })
  }
}
const changeSelect = ()=>{
  const [key, value] = keywords.value

  let advSearch = cloneDeep(getSessionParams(props.nodeCode))
  
  if(advSearch.some((item:any)=>item.key === key)){
    advSearch.forEach((item: any) => {
      if (key && item.key === key) {
        item.value = value || ''
      }
    })
  }else{
    advSearch = [
      {
        key,
        value: value ? String(value) : '',
        match: 'like',
      },
      ...getSessionParams(props.nodeCode),
    ]
  }
  searchModel.value = advSearch
  
  Session.set('advSearch', searchModel.value)
}
const search = () => {
  const [key, value] = keywords.value
  let advSearch = cloneDeep(getSessionParams(props.nodeCode)).filter(item=>item.key !== 'createTime'),
  time = cloneDeep(Session.get('createTime'));
  
  if(advSearch.some((item:any)=>item.key === key)){
    advSearch.forEach((item: any) => {
      if (item.key === key) {
        item.value = value
      }
    })
  }else{
    advSearch = [
      {
        key,
        value: value ? String(value) : '',
        match: 'like',
      },
      ...getSessionParams(props.nodeCode).filter(item=>item.key !== 'createTime'),
    ]
  }
  searchModel.value = advSearch.concat(time)
  nextTick(() => {
    selectRef.value?.blur()
  })
  
  Session.set('advSearch', advSearch)
  emit('getPrams', searchModel.value)
}

const timeRange = (val: string[]) => {
  const [startTime, endTime] = val
  let time = cloneDeep(Session.get('createTime'))
  if (time) {
    time.forEach((item:any)=>{
      if (item.match === 'gt') {
        item.value = dayjs(startTime).format('YYYY-MM-DD 00:00:00')
      }
      if (item.match === 'lt') {
        item.value = dayjs(endTime).format('YYYY-MM-DD 23:59:59')
      }
    })
    const advSearch = Session.get('advSearch')?.filter((item:any)=>item.key !== 'createTime') || []
    searchModel.value = advSearch.concat(time)
  } else {
    searchModel.value = [
      {
        key: 'createTime',
        value: dayjs().startOf('M').format('YYYY-MM-DD 00:00:00'),
        match: 'gt',
      },
      {
        key: 'createTime',
        value: dayjs().format('YYYY-MM-DD 23:59:59'),
        match: 'lt',
      },
    ]
  }
  Session.set('createTime', searchModel.value.filter(item=>item.key === 'createTime' ))
  emit('getPrams', searchModel.value)
  // Session.set('advSearch', searchModel.value)
}

const init = () => {
  setDefault()
  if (Session.get('advCnForm')) {
    result.value = []
    const advCnForm = Session.get('advCnForm')
    getParams(advCnForm)
  }
  if (Session.get('advSearch') && keywords.value[0]) {
    const advSearch = cloneDeep( Session.get('advSearch'))
    advSearch.forEach((item: any) => {
      if(item.key === keywords.value[0]){
        keywords.value[1] = item.value
      }
    })
  }
  
  if(Session.get('createTime')){
    let time = Session.get('createTime')
    time.forEach((item:any)=>{
      if (item.match === 'gt') {
        form.createTime[0] = dayjs(item.value)
      }
      if (item.match === 'lt') {
        form.createTime[1] = dayjs(item.value)
      }
    })
  } else {
      form.createTime = [dayjs().startOf('M'), dayjs()]
      searchModel.value = [
        {
          key: 'createTime',
          value: dayjs().startOf('M').format('YYYY-MM-DD 00:00:00'),
          match: 'gt',
        },
        {
          key: 'createTime',
          value: dayjs().format('YYYY-MM-DD 23:59:59'),
          match: 'lt',
        },
      ]
      // Session.set('advSearch', searchModel.value)
      Session.set('createTime', searchModel.value)
    }
}
init()

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
  .formC {
    width: 300px;
    margin-right: 20px;
    ::v-deep(.el-form-item) {
      margin: 0 10px 0 0;
    }
  }
  .highSearch {
    margin-left: 10px;
    margin-right: 20px;
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
