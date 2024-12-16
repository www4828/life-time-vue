<template>
    <Title title="处置情况">
        <div class="titleRight">
            <div class="more" @click="moreClick">更多</div>
            <div class="YMD">
                <span :class="state.checkType == 'W' ? 'weightClick' : 'reportClick'" @click="getAll('W')">周</span>
                <span>/</span>
                <span :class="state.checkType == 'M' ? 'weightClick' : 'reportClick'" @click="getAll('M')">月</span>
                <!-- <span>/</span>
                <span :class="state.checkType == 'Y' ? 'weightClick' : 'reportClick'" @click="getAll('Y')">年</span> -->
            </div>
        </div>
        <template #content>
            <div class="tableBox">
                <el-table height="100%" :data="state.tableData" style="width: 100%" v-loading="loading" :header-cell-style="{
                    'text-align': 'center',
                    background: ' #c5e2ff',
                }" :cell-style="{ 'text-align': 'center' }" :row-class-name="tableRowClassName">
                    <el-table-column type="index" label="序号" width="60" />
                    <el-table-column prop="DISPOSEDEPTNAME" label="单位名称" show-overflow-tooltip />
                    <el-table-column prop="SLS" label="受理" />
                    <el-table-column label="处理">
                        <el-table-column prop="XLS" label="先联" />
                        <el-table-column prop="CLS" label="处理" />
                        <el-table-column prop="CQCL" label="超期处理" />
                        <el-table-column prop="CQWCL" label="超期未处理" />
                    </el-table-column>
                    <!-- <el-table-column label="回访">
                        <el-table-column prop="xl" label="不满意" />
                        <el-table-column prop="cl" label="不满意率" />
                    </el-table-column> -->

                </el-table>
            </div>
        </template>
        <DisposeDialog v-if="state.dialogHidden" :dialogVisible="state.dialogHidden" @close="closeDialog">
        </DisposeDialog>
    </Title>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import Title from "@/components/Title/Title.vue";
import { NewsService } from "@/api/service/Portal/NewsService";
import DisposeDialog from './DisposeDialog.vue';

const newsSever = new NewsService()
const loading = ref(false)
const state = reactive({
    checkType: 'W',
    tableData: [],
    dialogHidden: false,

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
const moreClick = () => {
    state.dialogHidden = true

}
const closeDialog = () => {
    state.dialogHidden = false

}
const getAll = (type: string) => {
    loading.value = true
    state.checkType = type
    newsSever.getEsData('35', { PDATE: type }).then(res => {
        // 周：W 月：M 年：Y
        if (res.values?.length > 0) {
            state.tableData = res.values
            loading.value = false

        } else {
            state.tableData = []
            loading.value = false
        }
    }).catch(() => {
        state.tableData = []
        loading.value = false

    })
}
getAll('W')
</script>
<style lang="scss" scoped>
.tableBox {
    height: 100%;
    width: 100%;
}

.YMD {
    color: #2c569e;
    line-height: 30px;
    float: right;
    font-size: $font-size-18;
    margin-right: 25px;
    display: flex;
    justify-content: space-evenly;
    width: 100px;
    font-weight: 500;
}

.more {
    background: url("@/assets/layout/more.png") no-repeat right center;
    padding-right: 22px;
    margin-right: 25px;
    font-size: $font-size-18;
    color: #2c569e;
    line-height: 30px;
    float: right;
    font-weight: 500;
}

::v-deep(.el-table__body tr.el-table__row--striped td) {
    background-color: #e7f3ff
}

::v-deep(.el-table__row) {
    background: #ffffff;
}

.reportClick {
    cursor: pointer;
}

.weightClick {
    cursor: pointer;
    font-weight: bolder;
}
</style>