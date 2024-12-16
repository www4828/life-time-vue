<template>
    <el-dialog :model-value="props.dialogVisible" title="处置情况" width="70%" @close="handleClose" destroy-on-close
        custom-class="card-mark">
        <RoleLayout>
            <template #search>
                <div class="sh3h-search-box div-flex-column">
                    <el-row>
                        <el-col :span="6">
                            <span class="sh3h-search-lable div-flex-right">范围:</span>
                            <el-select v-model="state.dateType" class="sh3h-search-input">
                                <el-option label="最近一周" value="W"></el-option>
                                <el-option label="最近一月" value="M"></el-option>
                                <!-- <el-option label="最近一年" value="Y"></el-option> -->
                            </el-select>
                        </el-col>
                        <el-col :span="12"></el-col>
                        <el-col :span="6" class="div-flex-right">
                            <el-button type="primary" :icon="Search" @click="searchHandle">搜索</el-button>
                        </el-col>
                    </el-row>
                </div>
            </template>
            <template #table>
                <div class="tableBox">
                    <el-table :data="state.tableData" style="width:100%" height="100%"
                        :header-cell-style="{ 'text-align': 'center', }" :cell-style="{ 'text-align': 'center' }">
                        <el-table-column type="index" label="序号" width="55" />
                        <el-table-column prop="DISPOSEDEPTNAME" label="单位名称" />
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
        </RoleLayout>
    </el-dialog>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus } from "@element-plus/icons-vue";

import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import { NewsService } from "@/api/service/Portal/NewsService";
interface Props {
    dialogVisible?: boolean;

}
const props = withDefaults(defineProps<Props>(), {
    dialogVisible: false

})
const newsSever = new NewsService()

const state = reactive({
    tableData: [],
    dateType: "W",
})
const emit = defineEmits(['close'])

const handleClose = () => {
    emit("close", false);
}
const searchHandle = () => {
    newsSever.getEsData('35', { PDATE: state.dateType }).then(res => {
        // 周：W 月：M 年：Y
        if (res.values?.length > 0) {
            state.tableData = res.values
        } else {
            state.tableData = []

        }
    })
}
searchHandle()
</script>
<style lang="scss" scoped>
.sh3h-search-box {
    background-color: var(--sh3h-tree-background-color);
    margin: 0;
}

.tableBox {
    height: 400px;
    width: 100%;
}
</style>