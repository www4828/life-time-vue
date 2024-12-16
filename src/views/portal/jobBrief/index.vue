<template>
    <div class="wrapper">
        <RoleLayout>
            <template #search>
                <SearchBox ref="searchForm" addTitle="简报标题" :typeHidden="true" @search="searchHandle"
                    :searchModel="searchModel" @addClick="add" :dateHidden="true">
                </SearchBox>

            </template>
            <template #table>
                <TableBox addTitle="简报标题" :typeHidden="true" :tableData="tableData.list" :dateHidden="true" :isLink="false"
                    @removeClick="remove" @changeStatus="statusChange" ></TableBox>

            </template>
        </RoleLayout>
        <Dialog v-if="dialogState.dialogHidden" :dialogVisible="dialogState.dialogHidden" addTitle="简报标题" :typeHidden="true"
            :dateHidden="true" :isLink="false" @close="closeDialog" @save="dialogSave">
        </Dialog>
    </div>
</template>
<script lang="ts" setup>

import { ref, reactive, toRefs, nextTick } from "vue";
import { Search, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
import RoleLayout from "@/components/RoleLayout/RoleLayout.vue";
import Dialog from "@/businessComponent/PortalCom/dialog/index.vue";
import SearchBox from "@/businessComponent/PortalCom/searchBox/index.vue";
import TableBox from "@/businessComponent/PortalCom/tableBox/index.vue";
import { PortalModel } from "@/api/model/portalModel";
import { SearchModel } from "@/api/model/baseModel";
import { Response, SearchParamsModel } from "@/api/interface";
import { JobBriefService } from "@/api/service/Portal/JobBriefService";


const tableData = reactive({
    list: [],
})
const dialogState = reactive({
    dialogHidden: false
})
const searchForm = ref()
const jobBriefSever = new JobBriefService()
const searchParamsModel = reactive(new SearchParamsModel<PortalModel>());
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
])
const getAll = () => {
    searchParamsModel.searchParams = searchModel.value;
    searchParamsModel.pageParams.pageSize = -1;
    jobBriefSever.list(searchParamsModel).then((res: Response) => {
        if (res.code === 200) {
            console.log('res', res);
            const { results } = res.data;
            tableData.list = results
        }
    })
}
getAll()
const searchHandle = () => {
    getAll();
};
const add = () => {
    dialogState.dialogHidden = true;
}
const closeDialog = () => {
    dialogState.dialogHidden = false;
}

const dialogSave = (form: PortalModel) => {
    jobBriefSever.save(form).then((res: Response) => {
        if (res.code === 200) {
            console.log('res', res);
            dialogState.dialogHidden = false;
            ElMessage.success(res.message);
            getAll();
        } else {
            ElMessage.error(res.message);
        }
    })

}
const remove = (row: any) => {
    ElMessageBox.confirm("确定要删除吗？", "删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        jobBriefSever.delete(row.id).then((res: Response) => {
            if (res.code === 200) {
                ElMessage.success(res.message);
                getAll();
            } else {
                ElMessage.error(res.message);
            }
        })
    }).catch(() => {
        ElMessage({
            type: "info",
            message: "取消！",
        });
    });

}
const statusChange = (val: any) => {
    jobBriefSever.updateStatus(val.id, val.status).then((res: Response) => {
        if (res.code === 200) {
            ElMessage.success(res.message);
            getAll();
        } else {
            ElMessage.error(res.message);
        }
    })
}
</script>
<style lang="scss" scoped>
.wrapper {
    width: 100%;
    height: 100%;
}

.sh3h-search-box {
    background-color: var(--sh3h-tree-background-color);
    margin: 0;
}
</style>