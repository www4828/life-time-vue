<template>
  <div class="PlatformDynamics-container">
    <div class="left">
      <div class="key">PLATFORM DYNAMICS</div>
      <div class="title">平台动态</div>
    </div>
    <div class="right">
      <div class="today-title">
        <div
          :class="[
            'item',
            state.active === item.key ? 'active' : '',
            item.class,
          ]"
          v-for="(item, index) in state.list"
          @click="clickHandle(item.key)"
        >
          <div class="label">{{ item.title }}</div>
          <div class="total">{{ item.total }}</div>
        </div>
      </div>
      <el-table
        :data="state.tableData"
        style="width: 100%"
        height="70%"
        :row-class-name="tableRowClassName"
        @cell-click="cellClickHandle"
      >
        <el-table-column
          prop="ROWNUM"
          label="序号"
          width="100"
          align="center"
        />
        <el-table-column
          prop="TASKID"
          label="工单编号"
          align="center"
          class-name="taskIdColumn"
        />
        <el-table-column prop="REPORT_TIME" label="接报时间" align="center">
          <template #default="scope">{{
            scope.row.REPORT_TIME?.replace('T', ' ')
          }}</template>
        </el-table-column>
        <el-table-column
          prop="DISPOSEDEPTNAME"
          label="承办单位"
          align="center"
        />
        <el-table-column prop="DEADLINE" label="办结时限" align="center">
          <template #default="scope">{{
            scope.row.DEADLINE?.replace('T', ' ')
          }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { NewsService } from '@/api/service/Portal/NewsService'
import { useCaseDetail } from '@/hooks/useCaseDetail'
import { ElMessage } from 'element-plus'

const newsSever = new NewsService()
const { jumpToDetail, getDetail, jumpToOldDetail } = useCaseDetail()
// const props = withDefaults(defineProps<{}>(), {})

const state = reactive({
  list: [
    { title: '即将超期', total: '0', key: 'JJCQ', class: 'warning' },
    { title: '已超期', total: '0', key: 'YCQ', class: 'danger' },
    { title: '紧急工单', total: '0', key: 'JJD', class: 'danger' },
    { title: '国办单', total: '0', key: 'GBD', class: 'success' },
    { title: '复核单', total: '0', key: 'FHD', class: 'primary' },
  ],
  tableData: [],
  active: 'JJCQ',
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
const clickHandle = (type: string) => {
  state.active = type
  if (type === 'JJCQ' || type === 'YCQ') {
    getDelayList(type)
  } else {
    getList(type)
  }
}
const cellClickHandle = (row: any, column: any, cell: any, event: any) => {
  let isLogin = sessionStorage.getItem('token')
  if (column.property === 'TASKID') {
    if (isLogin) {
      jumpToDetail(row.TASKID)
    } else {
      ElMessage.warning('请登录后查看案件详情')
    }
  }
}

const getTotal = () => {
  newsSever.getEsData('30').then((res) => {
    if (res.values?.length > 0) {
      state.list.forEach((item) => {
        Object.keys(res.values[0]).forEach((key) => {
          if (item.key === key) {
            item.total = res.values[0][key]
          }
        })
      })
    }
  })
}
const getTotalTwo = () => {
  newsSever.getEsData('31').then((res) => {
    if (res.values?.length > 0) {
      state.list.forEach((item) => {
        Object.keys(res.values[0]).forEach((key) => {
          if (item.key === key) {
            item.total = res.values[0][key]
          }
        })
      })
    }
  })
}
const getDelayList = (PTYPE: string) => {
  state.tableData = []
  newsSever.getEsData('32', { PTYPE }).then((res) => {
    if (res.values?.length > 0) {
      state.tableData = res.values
    }
  })
}
const getList = (PTYPE: string) => {
  state.tableData = []
  newsSever.getEsData('33', { PTYPE }).then((res) => {
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
.PlatformDynamics-container {
  width: 100%;
  height: 50%;
  background: url('@/assets/protal/ptdt.png') no-repeat left bottom;
  padding: 0 350px 80px;
  box-sizing: border-box;
  position: absolute;
  bottom: 0px;
  display: flex;
  .left {
    width: 230px;
    @include fontStyle('SourceHanSansCN-Regular', $font-size-16, #000);
    .key {
      color: #999999;
      margin-bottom: 10px;
    }
    .title {
      font-size: 24px;
      margin-bottom: 90px;
    }
  }
  .right {
    width: calc(100% - 230px);

    .today-title {
      width: 100%;
      height: 55px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;

      .item {
        width: 185px;
        display: flex;
        align-items: center;
        height: 100%;
        justify-content: space-evenly;
        position: relative;
        cursor: pointer;
        border: 1px solid #e6e6e6;
        @include fontStyle('SourceHanSansCN-Normal', $font-size-16, #414141);
        line-height: 100%;
        &::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--el-color-warning);
        }
        &.active {
          border: 1px solid #255ba5;
        }
        &.danger{
          &::before{
            background-color: var(--el-color-danger);
          }
        }
        &.success{
          &::before{
            background-color: var(--el-color-success);
          }
        }
        &.primary{
          &::before{
            background-color: var(--el-color-primary);
          }
        }
        .total {
          font-size: 20px;
          font-weight: 600;
        }
      }
    }

  }
}
// ::v-deep(.el-table__body tr.el-table__row--striped td) {
//     background-color: #e7f3ff
// }
::v-deep(.taskIdColumn) {
  cursor: pointer;
}
</style>
