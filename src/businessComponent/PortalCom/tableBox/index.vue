<template>
    <el-table :data="props.tableData" style="width:100%" height="100%" :header-cell-style="{ 'text-align': 'center', }"
        :cell-style="{ 'text-align': 'center' }">
        <el-table-column prop="name" :label="props.addTitle" />
        <el-table-column prop="type" label="简报类型" v-if="props.typeHidden" />
        <el-table-column prop="fileName" label="文件名" v-if="!props.isLink">
            <template #default="scope">
                <a :href="scope.row.url" download>{{ scope.row.fileName }}</a>
            </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" v-if="!props.isLink" />
        <el-table-column prop="noticeTime" label="发布日期" v-if="props.dateHidden" />
        <el-table-column prop="" label="是否公开">
            <!-- 1公开  0不公开 -->
            <template #default="scope">
                <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="statusChange(scope.row)" />
            </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作">
            <template #default="scope">
                <el-button type="primary" class="save" @click="remove(scope.row)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
interface Props {
    addTitle: string
    typeHidden?: boolean
    tableData: any
    dateHidden?: boolean
    isLink?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    addTitle: "",
    typeHidden: false,
    tableData: [],
    dateHidden: true,
    isLink: false,
});
const emit = defineEmits(['removeClick',"changeStatus"])
const remove = (row: any) => {
    emit("removeClick", row)
}
const statusChange=(row:any)=>{
    console.log('row',row)
    emit("changeStatus",row)
}
</script>