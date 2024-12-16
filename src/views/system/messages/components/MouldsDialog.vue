<template>
    <el-dialog v-model="props.dialogVisible" title="模板管理" width="50%" @close="$emit('closeDialog')">

        <div class="concat">
            <div class="tableBox">
                <el-table :data="state.tableData" style="width: 100%;" height="100%"
                    :default-sort="{ prop: 'xuhao', order: 'descending' }" :header-cell-style="{
                        'text-align': 'center',
                        background: '#f2f7ff',
                    }" :cell-style="{ 'text-align': 'center' }" @row-click="handleRowChange">
                    <el-table-column type="index" label="序号" width="60" />
                    <el-table-column prop="name" label="模板名称" />
                    <el-table-column prop="content" label="模板内容" />
                    <el-table-column prop="createUser" label="创建人员" />
                    <el-table-column label="操作">
                        <template #default="scope">
                            <el-button type="primary" class="save" @click="remove(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <el-form :model="state.form" label-width="120px" :rules="rules" ref="deptform" inline>
                <el-row>
                    <el-col :span="14">
                        <el-form-item label="模板名称" prop="name">
                            <el-input v-model="state.form.name" :disabled="state.hidden == true" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="14">
                        <el-form-item label="模板内容" prop="content">
                            <el-input v-model="state.form.content" :disabled="state.hidden == true" type="textarea"
                                :autosize="{ minRows: 4, maxRows: 6 }" maxlength="500" show-word-limit />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="10">
                        <el-button type="success" @click="add">新增</el-button>
                        <el-button type="warning" @click="state.hidden = false">修改</el-button>
                    </el-col>
                    <el-col :span="14" class="div-flex-right">
                        <el-button type="primary" @click="submitForm">保存</el-button>
                        <el-button type="info" @click="cancel(deptform)">取消</el-button>
                    </el-col>
                </el-row>
            </el-form>

        </div>
    </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormRules, FormInstance } from "element-plus";

import { SmsTemplateModel } from "@/api/model/smsTemplateModel";
import { SmsTemplateService } from "@/api/service/Sms/SmsTemplateService";
import { Session } from '@/utils/storage';
import { Response, SearchParamsModel } from "@/api/interface";


interface Props {
    dialogVisible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    dialogVisible: false,

});
const { departmentList } = Session.get('userInfo')

const state = reactive({
    tableData: [],
    form: {
        content: "",
        departmentCode: departmentList[0].departmentCode,
        name: "",
    } as SmsTemplateModel,
    hidden: true,
})
const rules = reactive<FormRules>({
    content: [{ required: true, message: "模板内容不能为空", trigger: "blur" }],
    name: [{ required: true, message: "模板名称不能为空", trigger: "blur" }],
});
const deptform = ref<FormInstance>();
const add = () => {
    state.form.content = ""
    state.form.name = ""
    state.form.id = ""
    state.hidden = false
}
const searchParamsModel = reactive(new SearchParamsModel<SmsTemplateModel>());
const smsTemplateService = new SmsTemplateService()
const getAll = () => {
    searchParamsModel.searchParams = [
        {
            key: "content",
            value: "",
            match: "like",
        },
        {
            key: "name",
            value: "",
            match: "like",
        },
        {
            key: "departmentCode",
            value: departmentList[0].departmentCode,
            match: "eq",
        },
    ]
    searchParamsModel.pageParams.pageSize = -1;
    smsTemplateService.list(searchParamsModel).then((res: Response) => {
        if (res.code === 200) {
            const { results } = res.data
            state.tableData = results
        }
    })
}
const handleRowChange = (row: any) => {
    state.hidden = true
    state.form.name = row.name
    state.form.content = row.content
    state.form.id = row.id
}
const remove = (row: any) => {
    ElMessageBox.confirm("确定要删除吗？", "删除", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        smsTemplateService.delete(row.id).then((res: Response) => {
            if (res.code == 200) {
                ElMessage.success(res.message)
                getAll()
                clean()
            } else {
                ElMessage.error(res.message)
            }
        })
    }).catch(() => {
        ElMessage({
            type: "info",
            message: "取消！",
        });
    })
}
// 保存
const submitForm = () => {
    deptform.value?.validate((valid: any) => {
        if (valid) {
            if (state.form.id == "") {
                smsTemplateService.save(state.form).then((res: Response) => {
                    if (res.code === 200) {
                        ElMessage.success(res.message)
                        getAll()
                        clean()
                    } else {
                        ElMessage.error(res.message)
                    }
                })
            } else {
                smsTemplateService.update(state.form).then((res: Response) => {
                    if (res.code === 200) {
                        ElMessage.success(res.message)
                        getAll()
                        clean()
                    } else {
                        ElMessage.error(res.message)
                    }
                })
            }

        }
    })

}

// 取消
const cancel = (formEl: FormInstance | undefined) => {
    clean()
    formEl?.clearValidate()
}
const clean = () => {
    state.hidden = true
    state.form.name = ""
    state.form.content = ""
    state.form.id = ""
}
watch(() => props.dialogVisible, (val) => {
    if (val == true) {
        getAll()
        clean()
    }
})
</script>
<style lang="scss" scoped>
.concat {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .tableBox {
        height: 300px;
        margin-bottom: 20px;
    }

    // .concatTable {
    //   width: 100%;
    //   height: 140px;
    // }
}
</style>