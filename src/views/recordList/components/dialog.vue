<template>
  <el-dialog
    :model-value="props.showFlag"
    title="操作案件"
    width="65%"
    @close="$emit('closeDialog')"
    destroy-on-close
  >
  <div class="table_box">
    <el-table
      :data="tableData"
      style="width: 100%"
      height="100%"
      :header-cell-style="{ 'text-align': 'center' }"
      :cell-style="{ 'text-align': 'center' }"
    >
      <el-table-column prop="recordId" label="操作编码"  />
      <el-table-column prop="warnName" label="预警标题" show-overflow-tooltip />
      <el-table-column prop="taskId" label="案件编号"  >
        <template #default="scope">
          <el-link type="primary" @click="jumpToDetail(scope.row.taskId)" >{{ scope.row.taskId }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作主单"  >
        <template #default="scope">
          <el-tag type="primary" v-if="scope.row.type == 1" >是</el-tag>
          <el-tag type="warning" v-else >否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="executeFlag" label="执行状态" >
        <template #default="scope">
          <el-tag v-if="scope.row.executeFlag == 0">执行中</el-tag>
          <el-tag type="success" v-if="scope.row.executeFlag == 1">成功</el-tag>
          <el-tag type="danger" v-if="scope.row.executeFlag == 2">失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="操作时间" />
      <el-table-column prop="nodeName" label="操作环节"/>
      <el-table-column prop="remark" label="备注"/>
    </el-table>
  </div>
    <template #footer>
      <div class="dialog-footer-between">
        <Pagination
          :currentPage="searchParamsModel.pageParams.pageIndex"
          :pageSize="searchParamsModel.pageParams.pageSize"
          :total="searchParamsModel.pageParams.total"
          :callBack="paginationChange"
          :page-sizes="[5, 10, 20, 30, 50]"
        />
        <div>
          <el-button type="primary" @click="getList">刷新</el-button>
          <el-button @click="$emit('closeDialog')">关闭</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, ref } from 'vue'
import Pagination from "@/components/pagination/index.vue";
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { SearchParamsModel } from '@/api/interface';
import { CroupVisitModel } from '@/api/model/disposeModel';
import { SearchModel } from '@/api/model/baseModel';
import { watch } from 'vue';
import { NODE_CODE } from "@/utils";
import { useCaseDetail } from '@/hooks/useCaseDetail';
type NodeCode = keyof typeof NODE_CODE;

const emits = defineEmits(['closeDialog', 'update', 'save'])
const props = defineProps<{
  recordId: string
  showFlag: boolean
}>()
const disposeService = new DisposeService()
const { jumpToDetail } = useCaseDetail();
const tableData = ref([])
const searchParamsModel = reactive(new SearchParamsModel<CroupVisitModel>());
const searchModel = ref<SearchModel<CroupVisitModel>[]>([
  {
    key: "recordId",
    value: '',
    match: "eq"
  }
]);

const getList = ()=>{
  tableData.value = []
  searchParamsModel.searchParams = searchModel.value;
  disposeService.getBatchCaseList(searchParamsModel).then(res=>{
    res.data.results.map((i:CroupVisitModel)=> i.nodeName = NODE_CODE[i.node as NodeCode])
    tableData.value = res.data.results
    searchParamsModel.pageParams.total = res.data.pageInfo.total
  })
}
interface PageInfo {
    currentPage: number;
    pageSize: number;
}
const paginationChange = (pageInfo: PageInfo) => {
  searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
  searchParamsModel.pageParams.pageSize = pageInfo.pageSize;
  getList();
};
watch(()=>props.recordId,val=>{
  searchModel.value[0].value = val
  if(val){
    getList();
  }else{
    tableData.value = []
  }
})
// watch(()=>props.showFlag,val=>{
//   if(!val){
//     tableData.value = []
//   }
// })
</script>
<style lang="scss" scoped>
.el-dialog {
  // ::v-deep(.el-dialog__footer){
  //   width: 100%;
  //   display: flex;
  //   align-items: center;
  //   justify-content: space-between;
  // }
  .dialogFooter {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .table_box{
    height: 500px;
  }
}
</style>
