<template>
  <el-select
    v-model="state.company"
    multiple
    filterable
    remote
    reserve-keyword
    placeholder="请输入四个字符以上关键词进行搜索"
    remote-show-suffix
    :remote-method="remoteMethod"
    :loading="state.loading"
    @change="changeHandle"
    style="width: 100%;height: 100%;"
    collapse-tags
    collapse-tags-tooltip
    :no-data-text="state.noDataText"
    >
    <el-option
      v-for="item in state.options"
      :key="item.Qymc"
      :label="item.Qymc"
      :value="item.Qymc"
    />
  </el-select>
</template>
<script lang="ts" setup>
import { ref, watch, reactive } from "vue";
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { debounce } from "lodash-es";
import { CompanyService } from '@/api/service/Dispose/CompanyService';
import { CompanyModel } from '@/api/model/disposeModel';

const companyService = new CompanyService()
const disposeService = new DisposeService();
const props = withDefaults(
  defineProps<{
    taskId?: string;
  }>(),
  {
    taskId: "",
  }
);
const emit = defineEmits(["changeSelect", "changeLoading", "done"]);

const state = reactive({
  company:[],
  loading: false,
  options: [] as any,
  list:[ ],
  noDataText: '无数据'
})
const remoteMethod = debounce((query: string)=>{
  query = query.replace(/\s*/g,"")
  if (query?.length > 3) {
    state.loading = true
    disposeService.getQymcList(query).then(res=>{
      state.loading = false
      if(res.data?.length > 0){
        state.options = res.data?.filter((item:any) => item.Qymc.includes(query))
      }else{
        state.noDataText = '无数据'
      }
    }).finally(()=>state.loading = false)
  } else {
    state.noDataText = '请输入四个字符以上关键词进行搜索'
    state.options = []
  }
},1000)

const changeHandle = (val:any)=>{
  let list = val.map((item:string)=>{
    return {'company':item,taskId: props.taskId,department:''}
  })
  emit('changeSelect',list)
}

defineExpose({
  clear(){
    state.company = []
  }
})
</script>
<style lang="scss" scoped>
::v-deep(.el-input){
  height: 100% !important;
}
::v-deep(.el-input__inner){
  height: 100% !important;
}
::v-deep(.select-trigger) {
  height: 100%;
}
::v-deep(.el-select__tags){
   max-width: 100% !important;
}
</style>
