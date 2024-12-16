<template>
    <el-dialog :model-value="props.dialogVisible" :title="props.title" width="80%" @close="handleClose" destroy-on-close
        custom-class="card-mark">
        <RoleLayout>
            <template #search>
                <div class="sh3h-search-box div-flex-column">
                    <el-row>
                        <el-col :span="6">
                            <span class="sh3h-search-lable div-flex-right">{{ props.addTitle + ':' }}</span>
                            <el-input class="sh3h-search-input" v-model.trim="searchModel[0].value" />
                        </el-col>
                        <el-col :span="6" v-if="props.typeHidden">
                            <span class="sh3h-search-lable div-flex-right">简报类型:</span>
                            <el-select v-model="searchModel[1].value" class="sh3h-search-input" clearable>
                                <el-option label="日报" value="日报"></el-option>
                                <el-option label="周报" value="周报"></el-option>
                                <el-option label="通报" value="通报"></el-option>
                                <el-option label="专报" value="专报"></el-option>

                            </el-select>
                        </el-col>
                        <el-col :span="6">
                            <span class="sh3h-search-lable div-flex-right">发布日期:</span>
                            <el-date-picker class="sh3h-search-input" v-model="searchModel[2].value" type="date"
                                format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                        </el-col>
                        <el-col :span="6" v-if="!props.typeHidden"></el-col>
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
                    <el-table-column prop="name" :label="props.addTitle" />
                    <el-table-column prop="type" label="简报类型" v-if="props.typeHidden" />
                    <el-table-column prop="fileName" label="文件名" v-if="!props.isLink">
                        <template #default="scope">
                            <a :href="scope.row.url" download>{{ scope.row.fileName }}</a>
                        </template>
                    </el-table-column>
                    <el-table-column prop="fileSize" label="文件大小" v-if="!props.isLink" width="120" />
                    <el-table-column prop="noticeTime" label="发布日期" v-if="props.dateHidden" width="120"/>
                    <el-table-column prop="remark" label="备注" />

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
import { PortalModel } from "@/api/model/portalModel";
import { SearchModel } from "@/api/model/baseModel";
import { Response, SearchParamsModel } from "@/api/interface";
import { WorkRemindService } from "@/api/service/Portal/WorkRemindService";
import { JobBriefService } from "@/api/service/Portal/JobBriefService";
import { RelatedDocumentService } from "@/api/service/Portal/RelatedDocumentService";
import { LinkService } from "@/api/service/Portal/LinkService";

interface Props {
    dialogVisible?: boolean;
    title: string
    addTitle: string
    typeHidden?: boolean
    dateHidden?: boolean
    isLink?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    dialogVisible: false,
    title: "",
    addTitle: "",
    typeHidden: false,
    dateHidden: true,
    isLink: false,

});
const searchModel = ref<SearchModel<PortalModel>[]>([
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
        key: "createTime",
        value: 'sort',
        match: "orderByDesc",
    },
    {
        key: "status",
        value: '1',
        match: "eq",
    },
])

const state = reactive({
    tableData: [],
})
const emit = defineEmits(['save', 'close'])
const handleClose = () => {
    emit("close", false);
}
// 工作提示
const workRemindSever = new WorkRemindService()
const tipsSearchModel = reactive(new SearchParamsModel<PortalModel>());
// 工作简报
const jobBriefSever = new JobBriefService()
const jobSearchModel = reactive(new SearchParamsModel<PortalModel>());
// 相关文件
const filesSever = new RelatedDocumentService()
const filesSearchModel = reactive(new SearchParamsModel<PortalModel>());



const getTipsData = () => {
    tipsSearchModel.searchParams = searchModel.value;
    tipsSearchModel.pageParams.pageSize = 6;
    workRemindSever.list(tipsSearchModel).then((res: Response) => {
        if (res.code === 200) {
            const { results } = res.data;
            state.tableData = results
        }
    })
}
const getWorkReportData = () => {
    jobSearchModel.searchParams = searchModel.value;
    jobSearchModel.pageParams.pageSize = 11;
    jobBriefSever.list(jobSearchModel).then((res: Response) => {
        if (res.code === 200) {
            const { results } = res.data;
            state.tableData = results
        }
    })
}
const getFilesData = () => {
    filesSearchModel.searchParams = searchModel.value;
    filesSearchModel.pageParams.pageSize = 11;
    filesSever.list(filesSearchModel).then((res: Response) => {
        if (res.code === 200) {
            console.log('res', res);
            const { results } = res.data;
            state.tableData = results
        }
    })
}

const searchHandle = () => {
    if (props.title == "工作提示") {
        getTipsData()
    } else if (props.title == "热线简报") {
        getWorkReportData()
    } else if (props.title == "政策文件") {
        getFilesData()
    }
}
searchHandle()
</script>
<style lang="scss" scoped>
.sh3h-search-box {
    background-color: var(--sh3h-tree-background-color);
    margin: 0;
}
.tableBox{
  width: 100%;
  height: 400px;
}
</style>