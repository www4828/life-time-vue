<template>
    <el-dialog v-model="props.dialogVisible" title="消息详情" width="40%" @close="$emit('closeDialog')">
        <el-form ref="dataForm" :inline="true" :model="props.formData">
            <el-form-item label="消息标题:" v-if="props.formData.type!='2'">
                <span>{{ props.formData.title }}</span>
            </el-form-item>

            <el-form-item label="消息内容:">
                <span>{{ props.formData.content }}</span>
            </el-form-item>
            <el-form-item label="跳转链接:" v-if="props.formData.type!='2'">
                <span>{{ props.formData.homeUrl }}</span>
            </el-form-item>
            <el-form-item label="接收者:">
                <span>{{ props.formData.receiver }}</span>
            </el-form-item>
            <el-form-item label="发送时间:">
                <span>{{ props.formData.createTime }}</span>
            </el-form-item>

        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="$emit('closeDialog')">取消</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { ElForm } from 'element-plus'
import { SmsSendModel } from "@/api/model/smsSendModel";

const emits = defineEmits(['closeDialog']);
const props = defineProps({
    formData: {
        type: Object,
        default: {} as SmsSendModel
    },
    dialogVisible: {
        type: Boolean,
        default:false,
    }
})


</script>