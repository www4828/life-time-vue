<template>
  <div class="todaySituation">
    <div class="today-title">
      <div 
        :class="['item',state.active === item.key ? 'active' : '',item.class]" v-for="(item,index) in state.list"
        @click="clickHandle(item.key)"
      >
        <div class="label">{{item.title}}</div>
        <div class="total">{{item.total}}</div>
      </div>
    </div>
    <el-table :data="state.tableData" style="width: 100%" height="90%"  :row-class-name="tableRowClassName" :header-cell-style="{
                    background: ' #c5e2ff',
                }" border @cell-click="cellClickHandle" >
      <el-table-column prop="ROWNUM" label="序号" width="100" align="center"/>
      <el-table-column prop="TASKID" label="工单编号" align="center" class-name="taskIdColumn"/>
      <el-table-column prop="REPORT_TIME" label="接报时间"  align="center">
        <template #default="scope">{{ scope.row.REPORT_TIME?.replace('T',' ') }}</template>
      </el-table-column>
      <el-table-column prop="DISPOSEDEPTNAME" label="承办单位" align="center" />
      <el-table-column prop="DEADLINE" label="办结时限" align="center" >
        <template #default="scope">{{ scope.row.DEADLINE?.replace('T',' ') }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import Title from "@/components/Title/Title.vue";
import { NewsService } from "@/api/service/Portal/NewsService";
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { ElMessage } from 'element-plus';

const newsSever = new NewsService()
const { jumpToDetail, getDetail, jumpToOldDetail } = useCaseDetail();
// const props = withDefaults(defineProps<{}>(), {})

const state = reactive({
  list:[
    { title:'即将超期', total:'0', key: 'JJCQ', class:'warning' },
    { title:'已超期', total:'0', key: 'YCQ', class:'danger'  },
    { title:'紧急工单', total:'0', key: 'JJD', class:'danger'  },
    { title:'国办单', total:'0', key: 'GBD', class:'success'  },
    { title:'复核单', total:'0', key: 'FHD',class:'primary'  },
  ],
  tableData: [],
  active: 'JJCQ'
})
const tableRowClassName = ({
    row,
    rowIndex,
}: {
    row: any
    rowIndex: number
}) => {
    if (rowIndex % 2 !== 0) {
        return 'el-table__row--striped'
    }
}
const clickHandle = (type:string)=>{
  state.active = type
  if(type === 'JJCQ' || type === 'YCQ' ){
    getDelayList(type)
  }else{
    getList(type)
  }
}
const cellClickHandle = (row:any, column:any, cell:any, event:any)=>{
  let isLogin = sessionStorage.getItem('token')
  if(column.property === 'TASKID'){
    if(isLogin) {
      jumpToDetail(row.TASKID)
    }else{
      ElMessage.warning('请登录后查看案件详情')
    }
  }
}

const getTotal = () => {
  newsSever.getEsData('30').then(res => {
    if (res.values?.length > 0) {
      state.list.forEach(item => {
        Object.keys(res.values[0]).forEach(key => {
          if (item.key === key) {
            item.total = res.values[0][key]
          }
        })
      })
    }
  })
}
const getTotalTwo = () => {
  newsSever.getEsData('31').then(res => {
    if (res.values?.length > 0) {
      state.list.forEach(item => {
        Object.keys(res.values[0]).forEach(key => {
          if (item.key === key) {
            item.total = res.values[0][key]
          }
        })
      })
    }
  })
}
const getDelayList = (PTYPE:string) => {
  state.tableData = []
  newsSever.getEsData('32',{PTYPE}).then(res => {
    if (res.values?.length > 0) {
      state.tableData = res.values
    }
  })
}
const getList = (PTYPE:string) => {
  state.tableData = []
  newsSever.getEsData('33',{PTYPE}).then(res => {
    if (res.values?.length > 0) {
      state.tableData = res.values
    }
  })
}

const init = () => {
  getTotal()
  getTotalTwo()
  getDelayList('JJCQ')
}
init()
</script>

<style lang="scss" scoped>
.todaySituation {
  width: 100%;
  height: 100%;
  background-color: var(--sh3h-menu-background-color);
  padding: 20px 15px;
  box-sizing: border-box;

  .today-title {
    width: 100%;
    height: 15%;
    display: flex;
    justify-content: space-between;

    .item {
      // width: 10%;
      display: flex;
      align-items: center;
      // flex-direction: column;
      height: 80%;
      padding: 10px;
      box-sizing: border-box;
      position: relative;
      cursor: pointer;
      @include fontStyle('Arial',
            $font-size-20,
            var(--sh3h-attachment-color));
      font-weight: 600;
      line-height: 100%;
      &.active{
        background-color: rgba($color: #000, $alpha: 0.1);
        border-radius: 3px;
      }
      &.warning{
        color: var(--el-color-warning);
      }
      &.danger{
        color: var(--el-color-danger);
      }
      &.success{
        color: var(--el-color-success);
      }
      &.primary{
        color: var(--el-color-primary);
      }
      .label {
        margin-right: 10px;
        // @include fontStyle(var(--sh3h-font-family),
        //   $font-size-18,
        //   var(--sh3h-value-color));
        // font-weight: 600;
      }
    }
  }

  .today-active {
    width: 100%;
    height: 80%;
    padding: 0 20px;
    box-sizing: border-box;
    @include fontStyle(var(--sh3h-font-family),
      $font-size-16,
      var(--sh3h-value-color));
    display: flex;
    justify-content: space-between;

    .active-content {
      width: 30%;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding-right: 20px;
      box-sizing: border-box;
      position: relative;

      &:nth-last-child(1) {
        padding-right: 20px;
      }

      .des {
        font-weight: 600;
        @include fontStyle(var(--sh3h-font-family-medium),
          $font-size-20,
          var(--sh3h-deep-blue));
      }

      ul {
        li {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;

          .label {
            font-weight: 600;
            color: var(--sh3h-value-color);
            white-space: nowrap;
            width: 90%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .num {
            color: var(--sh3h-attachment-color);
          }
        }
      }
    }
  }
}
::v-deep(.el-table__body tr.el-table__row--striped td) {
    background-color: #e7f3ff
}
::v-deep(.taskIdColumn){
  cursor: pointer;
}
</style>
