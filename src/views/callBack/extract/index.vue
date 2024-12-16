<template>
    <div class="visitContent">
        <div class="search-box div-flex-column">
            <el-row>
                <el-col :span="7">
                    <el-select class="search-lable" v-model="form.timeType" placeholder="请选择 " clearable>
                        <el-option label="到站时间" value="reportTime" />
                        <el-option label="接报时间" value="reportTime" />
                    </el-select>
                    <div class="search-input div-flex-row">
                        <el-date-picker class="div-flex-left" v-model="form.startTime" type="date" format="YYYY-MM-DD"
                            @change="changeData(true)" value-format="YYYY-MM-DD" clearable />
                        <div class="concatIcon">—</div>
                        <el-date-picker v-model="form.endTime" type="date" format="YYYY-MM-DD" @change="changeData(false)"
                            value-format="YYYY-MM-DD" clearable />
                    </div>

                </el-col>

                <el-col :span="7">
                    <span class="search-lable div-flex-right">工单编号</span>
                    <el-input class="search-input" placeholder v-model.trim="form.taskId" />
                </el-col>
                <el-col :span="7">
                    <span class="search-lable div-flex-right">事件来源</span>
                    <el-select class="search-input" v-model="form.eventSourceCode" placeholder="请选择" clearable>
                        <el-option v-for="type in fromTypes" :label="type.codeName" :value="type.codeValue" />
                    </el-select>
                </el-col>
                <el-col :span="2" class="div-flex-right">
                    <el-button type="primary" @click="search">查询</el-button>
                </el-col>
            </el-row>

            <el-row>

                <el-col :span="7">
                    <span class="search-lable div-flex-right">反映区名</span>
                    <el-select class="search-input" v-model="form.district" placeholder="请选择" clearable>
                        <el-option v-for="type in districtTypes" :label="type.codeName" :value="type.codeValue" />
                    </el-select>
                </el-col>
                <el-col :span="7">
                    <span class="search-lable div-flex-right">承办单位</span>
                    <DepartTreeSelect class="search-input" is-immediate :is-multiple="false" :params="{
                        childNode: false,
                        currentNode: false,
                        optionList: [],
                        removeList: [],
                    }" ref="executeDepartment" @getDepartCode="executeDepartCode" />
                </el-col>
                <el-col :span="7">
                    <span class="search-lable div-flex-right">行业单位</span>
                    <ClassSelect class="search-input" ref="classSelect" :departmentCode="departmentCode"
                        :departmentLevel="currentDepartmentLevel" @getCheckedValue="getCheckedValue" />
                </el-col>

                <el-col :span="2" class="div-flex-right">
                    <el-button type="primary" @click="cancel">取消</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="7">
                    <span class="search-lable div-flex-right">联系电话</span>
                    <el-input class="search-input" placeholder v-model.trim="form.reportPhone" />
                </el-col>
                <el-col :span="7">
                    <span class="search-lable div-flex-right">回访次数</span>
                    <el-select class="search-input" v-model="form.district" placeholder="请选择 " clearable>
                        <el-option label="0次" value="0" />
                        <el-option label="1次" value="1" />
                        <el-option label="2次" value="2" />
                        <el-option label="3次" value="3" />
                        <el-option label="4次" value="4" />
                        <el-option label="5次" value="5" />
                        <el-option label="6次" value="6" />
                        <el-option label="7次及以上" value="7" />
                    </el-select>
                </el-col>
                <el-col :span="7">
                    <span class="search-lable div-flex-right">抽取数量</span>
                    <el-input class="search-input" placeholder v-model.trim="form.pagesize"
                        oninput="value=value.replace(/[^0-9]/g,'')" @input="pgSizeInput" />
                    <!--<el-select class="search-input" v-model="form.pagesize" placeholder="请选择">
                        <el-option label="50" value=50 />
                         <el-option label="100" value=100 />
                         <el-option label="150" value=150 />
                         <el-option label="200" value=200 />

                         </el-select>-->
                </el-col>

                <el-col :span="2" class="div-flex-right">
                    <el-button type="primary" @click="dispatch">锁定</el-button>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="14">
                    <span class="search-lable div-flex-right">问题描述</span>
                    <el-input class="search-input" placeholder v-model.trim="form.description" />
                </el-col>
                <el-col :span="7"></el-col>
                <el-col :span="2" class="div-flex-right">
                    <el-button type="primary" @click="cancelDispatch">释放</el-button>
                </el-col>
            </el-row>
        </div>
        <div class="tableTitle">回访任务抽取查询结果</div>
        <el-table ref="multipleTableRef" :data="state.tableData" style="width: 100%" class="tableContent"
            @current-change="handleCurrentChange" :header-cell-style="{
                'text-align': 'center', background: '#f2f7ff'
            }" :cell-style="{ 'text-align': 'center' }">
            <el-table-column label="案件状态" prop="">
            </el-table-column>
            <el-table-column label="回访次数" prop="fhCount">
            </el-table-column>
            <el-table-column label="12319编号" prop="taskId">
            </el-table-column>
            <el-table-column label="12345编号" prop="externalNumber">
            </el-table-column>
            <el-table-column label="接报时间" prop="reportTime">
            </el-table-column>
            <el-table-column label="行业单位" prop="reflectIndustryCode">
            </el-table-column>
            <el-table-column label="一级分类" prop="">
            </el-table-column>
            <el-table-column label="二级分类" prop="">
            </el-table-column>
            <el-table-column label="发生地址" prop="address">
            </el-table-column>
            <el-table-column label="问题描述" prop="description" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="承办单位" prop="reportDepartmentCode">
            </el-table-column>
            <el-table-column label="派单时间" prop="dispatchTime">
            </el-table-column>
            <el-table-column label="截止时间" prop="deadline">
            </el-table-column>
            <el-table-column label="处理结果" prop="">
            </el-table-column>
            <el-table-column label="到站时间" prop="">
            </el-table-column>
            <el-table-column label="处理描述" prop="">
            </el-table-column>
        </el-table>

    </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import { ElMessage, FormRules } from "element-plus";

import { useCode } from "@/hooks/useCode";
import DepartTreeSelect from "@/businessComponent/DepartTreeSelect/DepartTreeSelect.vue";
import ClassSelect from "@/businessComponent/ClassSelect/ClassSelect.vue";
import { Response, SearchParamsModel } from "@/api/interface";
import { CodeService } from "@/api/service/System/CodeService";
import { useDepartment } from "@/hooks/useDepartment";
import { EmitProps } from "@/businessComponent/ClassSelect/type";
import { CallBackModel } from '@/api/model/callBackModel'
import { CallBackService } from '@/api/service/CaseCallBack/CallBackService'
import { Session } from '@/utils/storage'

interface DepartmentCodeInfo {
    id: string;
    val: string | string[];
}
const callBackService = new CallBackService()

const state = reactive({
    tableData: [],
    checkTableData: [] as any,
})
const form = reactive<CallBackModel>({
    timeType: "",
    taskId: "",
    eventSourceCode: "",
    district: "",
    startTime: "",
    // reportDepartmentCode:"",
    reflectIndustryCode: "",
    reportPhone: "",
    endTime: "",
    repeatCount: "",
    description: "",
    pagesize: 10
})
const {
    districtTypes,
    fromTypes,
} = useCode();
const executeDepartment = ref();
const classSelect = ref();
const { departmentList, currentDepartmentCode, currentDepartmentLevel } = useDepartment();
const departmentCode = ref(currentDepartmentCode);
const executeDepartCode = ({ val, id }: DepartmentCodeInfo) => {
    departmentCode.value = val as string;
};

const getCheckedValue = ({ checkedValue, secondParams }: EmitProps) => {
    const [firstClass] = checkedValue;
    form.reflectIndustryCode = firstClass

};
const changeTime = (time: string) => {
    let str = time.replace(/\-|\>|\/|\?]/g, '')
    return Number(str)

}
const changeData = (flag: boolean) => {
    if (flag) {
        if (form.endTime) {
            if (changeTime(form.startTime as string) > changeTime(form.endTime as string)) {
                form.startTime = "";
                ElMessage.error("开始时间不能大于结束时间！");
            }
        }
    } else {
        if (form.startTime) {
            if (changeTime(form.startTime as string) > changeTime(form.endTime as string)) {
                form.endTime = "";
                ElMessage.error("结束时间不能小于开始时间！");
            }
        }
    }
}
const cleanForm = () => {
    form.timeType = ""
    form.taskId = ""
    form.eventSourceCode = ""
    form.district = ""
    form.startTime = ""
    form.reportDepartmentCode = ""
    form.reflectIndustryCode = ""
    form.reportPhone = ""
    form.endTime = ""
    form.repeatCount = ""
    form.callbackStatus = "0"
    form.description = ""
}
const listSearch = reactive(new SearchParamsModel<CallBackModel>())

const search = () => {
    listSearch.searchParams = [
        {
            key: form.timeType as keyof CallBackModel,
            value: form.startTime,
            match: "gt",
        },
        {
            key: form.timeType as keyof CallBackModel,
            value: form.endTime,
            match: "lt",
        },
        {
            key: "taskId",
            value: form.taskId,
            match: "eq",
        },
        {
            key: "eventSourceCode",
            value: form.eventSourceCode,
            match: "eq",
        },
        {
            key: "district",
            value: form.district,
            match: "eq",
        },
        {
            key: "reportDepartmentCode",
            value: departmentCode.value,
            match: "eq",
        },
        {
            key: "reflectIndustryCode",
            value: form.reflectIndustryCode,
            match: "eq",
        },
        {
            key: "reportPhone",
            value: form.reportPhone,
            match: "eq",
        },
        {
            key: "repeatCount",
            value: form.repeatCount,
            match: "eq",
        },
        {
            key: "description",
            value: form.description,
            match: "like",
        },
    ]
    listSearch.pageParams.pageSize = form.pagesize as number;
    callBackService.getExtractList(listSearch).then((res: Response) => {
        if (res.code == 200) {
            const { results } = res.data;
            state.tableData = results
        }
    })
}
const { username } = Session.get('userInfo')
const cancel = () => {
    cleanForm()
}
const dispatch = () => {
    // var postData = []
    // postData = state.tableData.map((item: any) => {
    //     var obj = {
    //         callbackSource: "2",//分配：1  抽取：2
    //         callbackStatus: "1",//分配：1  抽取：1
    //         taskId: item.taskId,
    //         userCode: username
    //     }
    //     return obj
    // })
    // console.log('1', callBackService)
    // callBackService.save(postData).then((res: Response) => {
    //     if (res.code == 200) {
    //         cleanForm()
    //         search()
    //     }
    // })

}
const cancelDispatch = () => {
    callBackService.cancel(state.checkTableData).then((res: Response) => {
        if (res.code == 200) {
            cleanForm();
            search();
        }
    });
    // callBackService.release().then((res: Response) => {
    //     if (res.code == 200) {
    //         cleanForm()
    //         search()
    //     }
    // })
}
const handleCurrentChange = (row: any) => {
    console.log("selection", row);
    state.checkTableData = [row]

};
const pgSizeInput = (value: string) => {
    if (value == "") {
        form.pagesize = 10
    }
}

</script>
<style lang="scss" scoped>
.visitContent {
    width: 100%;
    height: calc(100% - 50px);
    display: flex;
    flex-direction: column;

    .search-box {
        width: 100%;
        height: auto;
        float: left;
        padding: 10px 0;
        margin-bottom: 5px;
        box-sizing: border-box;
        background-color: transparent;

        .search-lable {
            width: 100px;
            height: 100%;
            line-height: 200%;
            font-size: var(--el-font-size-base);
            font-family: var(--sh3h-font-family-normal);
            font-weight: 500;
            float: left;
        }

        .itemLable {
            height: 100%;
            line-height: 200%;
            font-size: var(--el-font-size-base);
            font-family: var(--sh3h-font-family-normal);
            font-weight: 500;
            float: left;
        }

        .marginLeft40 {
            margin-left: 40px;
        }

        .itemSelect {
            height: 100%;
            float: left;
            margin: 0 10px;
        }

        .search-input {
            width: calc(100% - 110px);
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

        ::v-deep(.el-cascader) {
            width: calc(100% - 110px);
            height: 100%;
            float: left;
            margin: 0 0 0 10px;
        }

        .el-row {
            width: 100%;
            height: 30px;
            margin: 5px 0px 5px 0px;
            flex-wrap: wrap;
            position: relative;
            box-sizing: border-box;
        }

        .el-row:last-child {
            margin-bottom: 0;
        }

        .el-col {
            border-radius: 4px;
            height: 100%;
        }

        .concatIcon {
            font-size: $font-size-14;
            font-weight: 500;
            margin: 0 5px;
        }
    }

    .tableTitle {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: $font-size-18;
        font-weight: bold;
    }

    .tableContent {
        flex: 1
    }

}
</style>