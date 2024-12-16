<template>
    <el-dialog :model-value="props.dialogVisible" title="添加" width="30%" @close="handleClose" custom-class="card-mark">
        <el-form ref="deptform" :model="state.form" label-width="120px" :rules="formRules" label-position="right"
            :inline="true">
            <el-form-item :label="props.addTitle" prop="name">
                <el-input v-model.trim="state.form.name" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="发布时间:" prop="noticeTime" v-if="props.dateHidden">
                <el-date-picker v-model="state.form.noticeTime" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                    placeholder="请选择" />
            </el-form-item>
            <el-form-item label="简报类型:" prop="type" v-if="props.typeHidden">
                <el-select v-model="state.form.type">
                    <el-option label="日报" value="日报"></el-option>
                    <el-option label="周报" value="周报"></el-option>
                    <el-option label="通报" value="通报"></el-option>
                    <el-option label="专报" value="专报"></el-option>

                </el-select>
            </el-form-item>
            <el-form-item label="链接地址:" prop="url" v-if="props.isLink">
                <el-input v-model.trim="state.form.url" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="上传文件:" prop="url" v-if="!props.isLink">
                <div class="uploadBox">
                    <el-input v-model.trim="state.form.url" placeholder="请上传文件" disabled></el-input>
                    <FileUpload class="div-flex-right" @uploadFile="uploadFile" />
                </div>
            </el-form-item>
            <el-form-item label="备注:">
                <el-input v-model.trim="state.form.remark" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" autofocus
                    axlength="500" show-word-limit></el-input>
            </el-form-item>

        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" @click="save"> 确定 </el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import type { FormRules } from "element-plus";
import FileUpload from "@/businessComponent/FileUpload/FileUpload.vue";
import { UploadModel } from "@/api/model/uploadModel";
import { PortalModel } from "@/api/model/portalModel";
import { getFullPath } from "@/utils";


interface Props {
    dialogVisible?: boolean;
    addTitle: string
    typeHidden?: boolean
    dateHidden?: boolean
    isLink?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    dialogVisible: false,
    addTitle: "",
    typeHidden: false,
    dateHidden: true,
    isLink: false,

});
const emit = defineEmits(['save', 'close'])
const deptform = ref();
const handleClose = () => {
    emit("close", false);
}
const state = reactive({
    form: {
        name: "",
        noticeTime: "",
        url: "",
        type: "",
        remark: "",
        fileName:"",
        fileSize:0,
    }
})
const formRules = reactive<FormRules>({
    name: [{ required: true, message: "文件名称为必填", trigger: "blur" }],
    noticeTime: [{ required: true, message: "发布时间为必填", trigger: "change" }],
    url: [{ required: true, message: "请上传文件", trigger: "blur" }],
    type: [{ required: true, message: "简报类型为必填", trigger: "change" }],
})
const uploadFile = (file: UploadModel) => {
    state.form.url = getFullPath(file.id);
    state.form.fileName=file.name
    state.form.fileSize=file.size as number
}
const save = () => {
    deptform.value?.validate((valid: any) => {
        if (valid) {
            console.log('1')
            emit('save', state.form)
        }
    })
}
</script>
<style lang="scss" scoped>
.uploadBox {
    width: 100%;
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
}

::v-deep(.el-date-editor) {
    width: 100% !important;

}
</style>