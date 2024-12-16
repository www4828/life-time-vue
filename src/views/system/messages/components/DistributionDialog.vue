<template>
    <el-dialog v-model="props.dialogVisible" title="通讯录管理" width="60%" @close="$emit('closeDialog')">
        <Layout>
            <template #search>
                <div class="header-search">
                    <el-input placeholder="请输入内容" :prefix-icon="Search" v-model="keywords">
                    </el-input>
                </div>
                <!--这是一个完美的分割线-->
                <div class="split-line"></div>
            </template>
            <template #tree>
                <el-tree ref="treeRef" :props="treeProps" :data="state.treeData" class="treeRef" highlight-current
                    node-key="id" :filter-node-method="filterNode" @node-click="nodeClick" />
            </template>
            <template #button>
                <el-button type="primary" @click="addperson"
                    :disabled="state.checkRow.parentCode == '0' || state.isAddGroup">新增联系人</el-button>
                <el-button type="primary" @click="addGroup" :disabled="state.isAddGroup">新增组</el-button>
                <el-button type="warning" @click="edit" :disabled="state.checkRow.parentCode == '0'">修改</el-button>
                <el-button type="danger" @click="remove" :disabled="state.checkRow.parentCode == '0'">删除</el-button>
            </template>
            <template #content>
                <el-form class="formBox" ref="groupForms" :model="state.groupForm" label-position="right"
                    label-width="140px" :rules="rules" inline v-if="state.isGroup == true">
                    <el-form-item label="分组名称" prop="groupName">
                        <el-input v-model="state.groupForm.groupName" :disabled="state.groupHidden"> </el-input>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="state.groupForm.remark" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }"
                            maxlength="500" show-word-limit :disabled="state.groupHidden"> </el-input>
                    </el-form-item>
                </el-form>
                <el-form class="formBox" ref="userForms" :model="state.userForm" label-position="right" label-width="140px"
                    :rules="userRules" inline v-if="state.isGroup == false">
                    <el-form-item label="姓名" prop="name">
                        <el-input v-model="state.userForm.name" :disabled="state.userHidden"> </el-input>
                    </el-form-item>
                    <el-form-item label="电话" prop="mobile">
                        <el-input v-model="state.userForm.mobile" :disabled="state.userHidden"> </el-input>
                    </el-form-item>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="state.userForm.remark" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }"
                            maxlength="500" show-word-limit :disabled="state.userHidden"> </el-input>
                    </el-form-item>
                </el-form>
            </template>
            <template #bottom>
                <div class="btnGroup">
                    <el-button type="success" @click="submitForm" class="save">保存</el-button>
                    <el-button @click="cancel" class="cancel">取消</el-button>
                </div>
            </template>
        </Layout>
    </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { Search } from "@element-plus/icons-vue";
import Layout from "@/components/Layout/Layout.vue";
import type { FormRules, FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";

import { Response, SearchParamsModel } from "@/api/interface";
import { Session } from '@/utils/storage';
import { DistributionUserModel } from "@/api/model/distributionUserModel";
import { DistributionGroupModel } from "@/api/model/distributionGroupModel";
import { DistributionUserService } from "@/api/service/Sms/DistributionUserService";
import { DistributionGroupService } from "@/api/service/Sms/DistributionGroupService";


interface Props {
    dialogVisible?: boolean;

}
const props = withDefaults(defineProps<Props>(), {
    dialogVisible: false,

});
const emits = defineEmits(['closeDialog']);
const treeRef: any = ref(null)
const { departmentList } = Session.get('userInfo')
const distributionUserService = new DistributionUserService()
const distributionGroupService = new DistributionGroupService()

const state = reactive({
    treeData: [],
    groupForm: {
        departmentCode: departmentList[0].departmentCode,
        groupName: "",
        parentCode: "",
        remark: "",
        sort: 1,
    } as DistributionGroupModel,
    userForm: {
        departmentCode: departmentList[0].departmentCode,
        groupId: "",
        mobile: "",
        name: "",
        remark: "",
    } as DistributionUserModel,
    checkRow: {
        departmentCode: "",
        groupName: "",
        id: "",
        mobile: "",
        parentCode: "",
        remark: "",
        userName: "",
    },
    isGroup: false,
    groupHidden: true,
    userHidden: true,
    isAddGroup: false,
})
const keywords = ref("");
const customNodeClass = (data: any) => {
    if (data.groupName == "") {
        return "person"
    } else {
        return ''
    }
};
const treeLabel = (data: any) => {
    if (data.groupName == "") {
        return data.userName
    } else {
        return data.groupName
    }
}
const treeProps = {
    label: treeLabel,
    children: "childs",
    class: customNodeClass,
};
const filterNode = (value: string, data: any): boolean => {
    if (!value) return true;
    return data.userName.includes(value) || data.groupName.includes(value);
};
const groupForms = ref<FormInstance>();
const userForms = ref<FormInstance>();


const nodeClick = (data: any) => {
    state.checkRow.departmentCode = data.departmentCode
    state.checkRow.groupName = data.groupName
    state.checkRow.id = data.id
    state.checkRow.mobile = data.mobile
    state.checkRow.parentCode = data.parentCode
    state.checkRow.remark = data.remark
    state.checkRow.userName = data.userName

    if (data.groupName == "") {
        state.isGroup = false
        state.isAddGroup = true
        state.userHidden = true
        state.userForm.name = data.userName
        state.userForm.mobile = data.mobile
        state.userForm.remark = data.remark
        state.userForm.groupId = data.parentCode
        state.userForm.id = data.id
    } else {
        state.isGroup = true
        state.isAddGroup = false
        state.groupHidden = true
        state.groupForm.groupName = data.groupName
        state.groupForm.remark = data.remark
        state.groupForm.parentCode = data.parentCode
        state.groupForm.id = data.id
    }
};
const rules = reactive<FormRules>({
    groupName: [{ required: true, message: "分组名称不能为空", trigger: "blur" }],
});
const userRules = reactive<FormRules>({
    name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
    mobile: [{ required: true, message: "电话不能为空", trigger: "blur" }],
});
// 获取通讯录树
const getTreeAll = () => {
    distributionGroupService.getTreeList(departmentList[0].departmentCode).then((res: Response) => {
        if (res.code === 200) {
            state.treeData = res.data
        }
    })
}
// 新增联系人
const addperson = () => {
    state.isGroup = false
    state.userForm.name = ""
    state.userForm.mobile = ""
    state.userForm.remark = ""
    state.userForm.groupId = ""
    state.userForm.id = ""
    state.userHidden = false
}
// 新增分组
const addGroup = () => {
    state.isGroup = true
    state.groupForm.groupName = ""
    state.groupForm.remark = ""
    state.groupForm.parentCode = ""
    state.groupForm.id = ""
    state.groupHidden = false

}
// 修改
const edit = () => {
    state.groupHidden = false
    state.userHidden = false

}
// 删除
const remove = () => {
    ElMessageBox.confirm("确定要删除吗？", "删除", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        if (state.isGroup) {
            distributionGroupService.delete(state.groupForm.id as string).then((res: Response) => {
                if (res.code == 200) {
                    ElMessage.success(res.message)
                    getTreeAll()
                    state.groupForm.groupName = ""
                    state.groupForm.remark = ""
                    state.groupForm.parentCode = ""
                    state.groupForm.id = ""
                    state.groupHidden = true
                } else {
                    ElMessage.error(res.message)
                }
            })
        } else {
            distributionUserService.delete(state.userForm.id as string).then((res: Response) => {
                if (res.code == 200) {
                    ElMessage.success(res.message)
                    getTreeAll()
                    state.userForm.name = ""
                    state.userForm.mobile = ""
                    state.userForm.remark = ""
                    state.userForm.groupId = ""
                    state.userForm.id = ""
                    state.userHidden = true
                } else {
                    ElMessage.error(res.message)
                }
            })
        }

    }).catch(() => {
        ElMessage({
            type: "info",
            message: "取消！",
        });
    })
}
// 保存
const submitForm = () => {
    if (state.isGroup) {
        groupForms.value?.validate((valid: any) => {
            if (valid) {
                if (state.groupForm.id == "") {
                    state.groupForm.parentCode = state.checkRow.id
                    distributionGroupService.save(state.groupForm).then((res: Response) => {
                        if (res.code === 200) {
                            ElMessage.success(res.message)
                            getTreeAll()
                            state.groupForm.groupName = ""
                            state.groupForm.remark = ""
                            state.groupForm.parentCode = ""
                            state.groupForm.id = ""
                            state.groupHidden = true
                        }
                    })
                } else {
                    distributionGroupService.update(state.groupForm).then((res: Response) => {
                        if (res.code === 200) {
                            ElMessage.success(res.message)
                            getTreeAll()
                            state.groupForm.groupName = ""
                            state.groupForm.remark = ""
                            state.groupForm.parentCode = ""
                            state.groupForm.id = ""
                            state.groupHidden = true
                        }
                    })
                }

            }
        })
    } else {
        userForms.value?.validate((valid: any) => {
            if (valid) {
                if (state.userForm.id == "") {
                    state.userForm.groupId = state.checkRow.id
                    distributionUserService.save(state.userForm).then((res: Response) => {
                        if (res.code === 200) {
                            ElMessage.success(res.message)
                            getTreeAll()
                            state.userForm.name = ""
                            state.userForm.mobile = ""
                            state.userForm.remark = ""
                            state.userForm.groupId = ""
                            state.userForm.id = ""
                            state.userHidden = true
                        }
                    })
                } else {
                    distributionUserService.update(state.userForm).then((res: Response) => {
                        if (res.code === 200) {
                            ElMessage.success(res.message)
                            getTreeAll()
                            state.userForm.name = ""
                            state.userForm.mobile = ""
                            state.userForm.remark = ""
                            state.userForm.groupId = ""
                            state.userForm.id = ""
                            state.userHidden = true
                        }
                    })
                }

            }
        })
    }
}

// 取消
const cancel = () => {
    state.userForm.name = ""
    state.userForm.mobile = ""
    state.userForm.remark = ""
    state.userForm.groupId = ""
    state.userForm.id = ""
    state.groupForm.groupName = ""
    state.groupForm.remark = ""
    state.groupForm.parentCode = ""
    state.groupForm.id = ""
    state.groupHidden = true
    state.userHidden = true
}

watch(
    () => keywords.value,
    (keywords) => {
        treeRef.value!.filter(keywords);
    }
);
watch(() => props.dialogVisible, (val) => {
    if (val == true) {
        getTreeAll()
        cancel()
    }
})

</script>
<style lang="scss" scoped>
.btnGroup {
    display: flex;
    justify-content: flex-end;
}

.formBox {
    height: 500px;
}
</style>