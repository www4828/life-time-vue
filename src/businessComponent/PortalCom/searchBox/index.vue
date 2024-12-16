<template>
    <div class="sh3h-search-box div-flex-column">
        <el-row>
            <el-col :span="4">
                <span class="sh3h-search-lable ">{{ props.addTitle + ':' }}</span>
                <el-input class="sh3h-search-input" placeholder v-model.trim="props.searchModel[0].value" />
            </el-col>
            <el-col :span="4" v-if="props.typeHidden">
                <span class="sh3h-search-lable div-flex-right">简报类型:</span>
                <el-select v-model="props.searchModel[1].value" class="sh3h-search-input" clearable>
                    <el-option label="日报" value="日报"></el-option>
                    <el-option label="周报" value="周报"></el-option>
                    <el-option label="通报" value="通报"></el-option>
                    <el-option label="专报" value="专报"></el-option>

                </el-select>
            </el-col>
            <el-col :span="4" v-if="props.dateHidden">
                <span class="sh3h-search-lable div-flex-right">发布日期:</span>
                <el-date-picker class="sh3h-search-input" v-model="props.searchModel[2].value" type="date" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD" />
            </el-col>
            <el-col :span="7" v-if="props.typeHidden"></el-col>
            <el-col :span="15" v-if="!props.typeHidden&&!props.dateHidden"></el-col>
            <el-col :span="11" v-if="!props.typeHidden&&props.dateHidden"></el-col>
            <el-col :span="4" class="div-flex-right">
                <el-button type="primary" :icon="Search" @click="searchHandle">搜索</el-button>
                <el-button type="primary" :icon="Plus" @click="add" class="save">增加</el-button>
            </el-col>
        </el-row>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus } from "@element-plus/icons-vue";
import { PortalModel } from "@/api/model/portalModel";
interface Props {
    addTitle: string
    typeHidden?: boolean
    searchModel: any
    dateHidden?:boolean
}
const props = withDefaults(defineProps<Props>(), {
    addTitle: "",
    typeHidden: false,
    dateHidden:true,
    searchModel: [
        {
            key: "name",
            value: '',
            match: "like",
        },
        {
            key: "type",
            value: '',
            match: "eq",
        },
        {
            key: "noticeTime",
            value: '',
            match: "eq",
        },
        
        {
            key: "sort",
            value: 'sort',
            match: "orderByDesc",
        },
    ]
});

const emit = defineEmits(['search', 'addClick'])
const searchHandle = () => {
    emit('search')
}
const add = () => {
    emit('addClick', true)
}
</script>
<style lang="scss" scoped>
.sh3h-search-box {
    background-color: var(--sh3h-tree-background-color);
    margin: 0;
}
</style>