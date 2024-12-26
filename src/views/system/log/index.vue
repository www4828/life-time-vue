<template>
    <div class="wrapper">
        <RoleLayout>
            <template #search>
                <div class="sh3h-search-box div-flex-column">
                    <el-row>
                        <el-col :span="8">
                            <span class="search-lable div-flex-right">操作时间:</span>
                            <div class="search-input div-flex-row">
                                <el-date-picker class="div-flex-left" @change="changeData(true)"
                                    v-model="searchModel[6].value" type="datetime" :editable="false" format=" YYYY-MM-DD HH:mm "
                                    value-format=" YYYY-MM-DD HH:mm" clearable />
                                <div class="concatIcon">—</div>
                                <el-date-picker v-model="searchModel[7].value" type="datetime" :editable="false" @change="changeData(false)"
                                    format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" clearable />
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <span class="sh3h-search-lable div-flex-right">操作人:</span>
                            <el-input class="sh3h-search-input"  v-model.trim="searchModel[9].value" />
                        </el-col>
                        <el-col :span="8">
                            <span class="sh3h-search-lable div-flex-right">操作类型:</span>
                            <el-select class="sh3h-search-input" v-model="searchModel[1].value" clearable>
                                <el-option v-for="type in state.types" :label="type.codeName" :value="type.codeValue" />
                            </el-select>

                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            <span class="sh3h-search-lable div-flex-right">日志描述:</span>
                            <el-input class="sh3h-search-input"  v-model.trim="searchModel[0].value" />
                        </el-col>
                        <el-col :span="8">
                            <span class="sh3h-search-lable div-flex-right">调用方法:</span>
                            <el-input class="sh3h-search-input"  v-model.trim="searchModel[2].value" />
                        </el-col>
                        <el-col :span="8">
                            <span class="sh3h-search-lable div-flex-right">请求信息:</span>
                            <el-input class="sh3h-search-input"  v-model.trim="searchModel[3].value" />
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            <span class="sh3h-search-lable div-flex-right">返回信息:</span>
                            <el-input class="sh3h-search-input"  v-model.trim="searchModel[4].value" />
                        </el-col>
                        <el-col :span="8">
                            <span class="sh3h-search-lable div-flex-right">错误信息:</span>
                            <el-input class="sh3h-search-input"  v-model.trim="searchModel[5].value" />
                        </el-col>
                        <el-col :span="8" class="div-flex-right">
                            <el-button type="primary" :icon="Search" @click="getAll">搜索</el-button>
                        </el-col>
                    </el-row>
                </div>
            </template>
            <template #table>
                <div class="tableWrapper">
                    <div class="tableContent">
                        <el-table :data="tableData.clientList" style="width:100%" height="100%"
                            :header-cell-style="{ 'text-align': 'center', }" :cell-style="{ 'text-align': 'center' }" tooltip-effect="light">
                            <el-table-column prop="description" align="center" label="日志描述" show-overflow-tooltip />
                            <el-table-column prop="apiMethod" align="center" label="调用方法" show-overflow-tooltip />
                            <el-table-column prop="createTime" align="center" label="操作时间" show-overflow-tooltip />
                            <el-table-column prop="requestArguments" align="center" label="请求信息" show-overflow-tooltip />
                            <el-table-column prop="errorMsg" align="center" label="错误信息" show-overflow-tooltip />
                            <el-table-column prop="responseResult" align="center" label="返回信息" show-overflow-tooltip />
                            <el-table-column label="操作">
                                <template #default="scope">
                                    <el-button type="primary" @click="edit(scope.row)">详情</el-button>

                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    <div class="pageWrapper">
                        <Pagination :currentPage="searchParamsModel.pageParams.pageIndex"
                            :pageSize="searchParamsModel.pageParams.pageSize" :total="searchParamsModel.pageParams.total"
                            :callBack="paginationChange" layout="prev,pager,next,slot" />
                    </div>
                </div>


            </template>

        </RoleLayout>
        <DetailDialog :showFlag="dialogState.EditDialog" :formData="editform" :dialogStatus="dialogState.titleName"
            @closeDialog="closeDialog" />
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus, Setting, RefreshLeft } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
import DetailDialog from "./components/DetailDialog.vue";
import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import { LogModel } from "@/api/model/logModel";
import { LogService } from "@/api/service/System/LogService";
import { Response, SearchParamsModel } from "@/api/interface";
import { SearchModel } from "@/api/model/baseModel";
import { CodeTreeModel } from '@/api/model/codeModel'
import Pagination from "@/components/pagination/index.vue";

interface PageInfo {
    currentPage: number;
    pageSize: number;
}
const searchParamsModel = reactive(new SearchParamsModel<LogModel>());
const logSever = new LogService();

const tableData = reactive({
    clientList: [] as Array<any>,
});
let editform = reactive({}) as LogModel;
const state = reactive({
    types: [] as CodeTreeModel[],
    startTime: "",
    endTime: "",
})
const searchModel = ref<SearchModel<LogModel>[]>([
    {
        key: "description",
        value: '',
        match: "like",
    },
    {
        key: "operationType",
        value: '',
        match: "eq",
    },
    {
        key: "apiMethod",
        value: '',
        match: "like",
    },
    {
        key: "requestArguments",
        value: '',
        match: "like",
    },
    {
        key: "responseResult",
        value: '',
        match: "like",
    },
    {
        key: "errorMsg",
        value: '',
        match: "like",
    },
    {
        key: "createTime",
        value: "",
        match: "gt",
    },
    {
        key: "createTime",
        value: "",
        match: "lt",
    },
    {
        key: "createTime",
        value: "createTime",
        match: "orderByDesc",
    },
    {
        key: "createUser",
        value: "",
        match: "eq",
    },
]);
const getOperationType = () => {
    logSever.typeList().then((res: Response) => {
        state.types = res.data
    })
}
getOperationType()
// const searchHandle = () => {
//   searchModel.value.forEach((item: any) => {
//     item.value = form[item.key]
//   })
//   getAll()
// };
const getAll = () => {
    searchParamsModel.searchParams = searchModel.value;
    searchParamsModel.pageParams.pageSize = 20;
    logSever.list(searchParamsModel).then((res: Response) => {
        const { pageInfo, results } = res.data;
        tableData.clientList = results;
        searchParamsModel.pageParams.total = pageInfo.total;

    });
};
getAll();
const paginationChange = (pageInfo: PageInfo) => {
    searchParamsModel.pageParams.pageIndex = pageInfo.currentPage;
    searchParamsModel.pageParams.pageSize = 20;
    getAll();
};

// 弹框
const dialogState = reactive({
    titleName: "" as string,
    EditDialog: false as boolean,
    QXDialog: false as boolean,
});

const edit = (row: LogModel) => {
    console.log('row', row)
    editform = row
    editform.requestArgumentsData = row.requestArguments ? eval("(" + row.requestArguments as string + ")") : {}
    editform.responseResultData = row.responseResult ? eval("(" + row.responseResult as string + ")") : {}
    dialogState.titleName = "详情";
    dialogState.EditDialog = true
}

const closeDialog = () => {
    dialogState.EditDialog = false;
    editform = {} as LogModel
};

const compareDate = (d1: string, d2: string) => {
    return ((new Date(d1.replace(/\-/g, "\/"))) > (new Date(d2.replace(/\-/g, "\/"))));
}
const changeData = (flag: boolean) => {
    // console.log('开始', new Date(searchModel.value[6].value as string))
    // console.log('结束', new Date(searchModel.value[7].value as string))
    // let jg = compareDate(searchModel.value[6].value, searchModel.value[7].value)
    // console.log('结果', jg)
    if (flag) {
        if (searchModel.value[7].value) {
            if (compareDate(searchModel.value[6].value as string, searchModel.value[7].value as string)) {
                searchModel.value[6].value = "";
                ElMessage.error("开始时间不能大于结束时间！");
            }
        }
    } else {
        if (searchModel.value[6].value) {
            if (compareDate(searchModel.value[6].value as string, searchModel.value[7].value as string)) {
                searchModel.value[7].value = "";
                ElMessage.error("结束时间不能小于开始时间！");
            }
        }
    }
};




</script>
  
<style lang="scss" scoped>
.wrapper {
    width: 100%;
    height: 100%;
}

.sh3h-search-box {
    background-color: var(--lt-tree-background-color);
    margin: 0;

    // border: 1px solid var(--lt-tree-border-color);
    .search-lable {
        width: 160px;
        height: 100%;
        line-height: 200%;
        font-size: var(--el-font-size-base);
        font-family: var(--lt-nt-family-normal);
        font-weight: 500;
        float: left;
    }

    .search-input {
        width: calc(100% - 170px);
        height: 100%;
        float: left;
        margin: 0 0 0 10px;
    }

    ::v-deep(.el-date-editor) {
        width: calc(100% - 110px);
        height: 100%;
        float: left;
        // margin: 0 0 0 10px;
    }

    .concatIcon {
        font-size: $font-size-14;
        font-weight: 500;
        margin: 0 5px;
    }
}

::v-deep(.table) {
    height: calc(100% - 130px) !important;
}

::v-deep(.button) {
    margin: 0 !important;
}

::v-deep(.el-dropdown-menu__item) {
    width: 100% !important;
}

.tableWrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    padding: 10px;

    .tableContent {
        flex: 1;
        height: calc(100% - 100px);
    }

    .pageWrapper {
        margin-top: 10px;
    }
}
</style>
  