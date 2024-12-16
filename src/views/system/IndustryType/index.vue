<template>
    <Layout class="layout">
        <template #search>
            <div class="header-search">
                <el-input placeholder="请输入内容" :prefix-icon="Search" v-model="keywords">
                </el-input>
            </div>
            <!--这是一个完美的分割线-->
            <div class="split-line"></div>
        </template>
        <template #tree>
            <el-tree ref="treeRefs" :props="treeProps" :data="data.treeData" class="treeRef" highlight-current node-key="id"
                :filter-node-method="filterNodes" @node-click="nodeClick" />

            <!-- default-expand-all -->
        </template>
        <template #button>
            <el-button type="primary" @click="add" :disabled="data.addHidden">新增</el-button>
            <el-button type="warning" :disabled="data.editHidden" @click="edit">修改</el-button>
            <el-button type="danger" @click="remove">删除</el-button>
        </template>
        <template #content>
            <el-form ref="authForm" :model="form" label-width="120px" inline>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="上级名称" v-if="data.parentNameHidden">
                            <el-input v-model="form.parentCodeName" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="名称">
                            <el-input v-model="form.name" :disabled="data.editFlag"></el-input>
                        </el-form-item>
                        <el-form-item label="承办部门" v-if="data.departmentShow">
                            <el-input v-model="form.departmentName" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="承办部门" v-if="data.departmentHidden">
                            <el-tree-select v-model="data.paramsValue" :empty-text="data.emptyText" :data="data.list"
                                :props="defaultProps" multiple collapse-tags filterable node-key="id" ref="treeRef"
                                highlight-current :check-strictly="true" :filter-node-method="filterNode"
                                default-expand-all></el-tree-select>
                        </el-form-item>
                        <el-form-item label="处置时限" v-if="data.timeShow">
                            <el-input v-model="form.disposeLimitName" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="处置时限" v-if="data.timeHidden">
                            <el-select v-model="data.timeParamsValue" multiple>
                                <el-option v-for="timeLimit in timeLimitTypes" :label="timeLimit.codeName"
                                    :value="timeLimit.codeValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>


            </el-form>

        </template>
        <template #bottom>
            <div class="btnGroup">
                <el-button type="success" @click="save" class="save" :disabled="data.saveFlag">保存</el-button>

            </div>
        </template>

    </Layout>
</template>
<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { ElMessage, ElTree, ElMessageBox, ElForm } from "element-plus";
import Layout from "@/components/Layout/Layout.vue";
import { Search } from "@element-plus/icons-vue";
import { ClassService } from '@/api/service/WorkTicket/ClassService'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { Response } from "@/api/interface";
import { CodeModel, CodeTreeModel } from "@/api/model/codeModel";
import { ReflectDeptModel } from "@/api/model/classModel";
import { DepartmentModel } from '@/api/model/departmentModel'
import { DepartmentService } from '@/api/service/System/DepartmentService'
import { useCode } from "@/hooks/useCode";
import { Session } from '@/utils/storage'

const classService = new ClassService()
const departmentServer = new DepartmentService()
interface Tree extends DepartmentModel {
    childs?: Tree[];
}
const data = reactive({
    treeData: [] as any,
    list: [] as any,
    filterText: '',
    checkedNode: [] as Array<DepartmentModel>,
    emptyText: '加载中...',
    node: {} as any,
    loading: false,
    changeTabs: "",
    paramsValue: [],
    checkParamsValue: [],
    timeParamsValue: [],
    checkTimeValue: [],
    parentNameHidden: false,
    departmentHidden: false,
    timeHidden: false,
    saveFlag: true,
    editFlag: true,
    departmentShow: false,
    timeShow: false,
    addHidden: false,
    editHidden: false,
})

const defaultProps = {
    children: 'childs',
    label: 'departmentName',
    value: 'departmentCode',
}
const form = reactive<CodeModel>({
    parentCode: "",
    firstParam: "",
    secondParam: "",
    thirdParam: "",
    fourthParam: "",
    code: "",
    nextCode: "",
    name: "",
    parentCodeName: "",
    id: "",
    typeCode: "",
    typeLevel: 0,
    dictionaryType: "",
    departmentName: "",
    disposeLimitName: "",
})
const checkForm = reactive<CodeModel>({
    parentCode: "",
    firstParam: "",
    secondParam: "",
    thirdParam: "",
    fourthParam: "",
    code: "",
    nextCode: "",
    name: "",
    parentCodeName: "",
    id: "",
    typeCode: "",
    typeLevel: 0,
    dictionaryType: "",
    departmentName: "",
    disposeLimitName: "",
})
const { timeLimitTypes } = useCode();
const treeRefs = ref<InstanceType<typeof ElTree>>();
const treeRef = ref<InstanceType<typeof ElTree>>();
const keywords = ref("");
const customNodeClass = (data: any, node: Node) => {
    if (node.level === 1) {
        return "first";
    }
    return "";
};
const treeProps = {
    label: "name",
    children: "childs",
    class: customNodeClass,
};
const deepAddDisabled = function (data: Tree[]) {
    const result: Tree[] = []
    data.forEach(tree => {
        if (tree.childs && tree.childs.length > 0) {
            tree.disabled = true;
            result.push(tree)
        } else {
            const childs = deepAddDisabled(tree.childs!)
            if (childs!) {
                return childs
            }
        }
    })
    return result
}

const { departmentList } = Session.get("userInfo");
const deptLevel = departmentList[0].departmentLevel
// 读取全部
const loadData = () => {
    // let { departmentList } = Session.get("userInfo");
    data.list = []
    departmentServer.tree(departmentList[0].departmentCode).then((res) => {
        data.list = [{
            departmentCode: departmentList[0].departmentCode,
            departmentName: departmentList[0].departmentName,
            childs: res.data
        }]
    }).catch(() => data.emptyText = '暂无数据')
}
loadData()
const getFirst = () => {
    classService.getFirstClass(departmentList[0].departmentCode, departmentList[0].departmentLevel, departmentList[0].departmentParentCode).then((res: Response) => {
        if (res.code === 200) {
            console.log('res.data', res.data)
            data.treeData = [res.data]
        }
    })
}
getFirst()

const nodeClick = (dataValue: any) => {
    data.editFlag = true
    data.saveFlag = true
    form.id = dataValue.id
    form.code = dataValue.code
    form.name = dataValue.name
    form.nextCode = dataValue.nextCode
    form.typeCode = dataValue.typeCode
    form.typeLevel = dataValue.typeLevel
    form.parentCode = dataValue.parentCode
    form.parentCodeName = dataValue.parentCodeName
    // form.firstParam = dataValue.firstParam
    // data.paramsValue = dataValue.firstParam ? dataValue.firstParam.split(',') : ""
    form.firstParam = dataValue.deptCodes
    data.paramsValue = dataValue.deptCodes ? dataValue.deptCodes.split(',') : ""
    data.timeParamsValue = dataValue.secondParam ? dataValue.secondParam.split(',') : ""
    form.secondParam = dataValue.secondParam
    form.thirdParam = dataValue.thirdParam
    form.fourthParam = dataValue.fourthParam
    form.dictionaryType = dataValue.dictionaryType
    form.departmentName = dataValue.departmentName
    form.disposeLimitName = dataValue.disposeLimitName

    checkForm.id = dataValue.id
    checkForm.code = dataValue.code
    checkForm.name = dataValue.name
    checkForm.nextCode = dataValue.nextCode
    checkForm.typeCode = dataValue.typeCode
    checkForm.typeLevel = dataValue.typeLevel
    checkForm.parentCode = dataValue.parentCode
    checkForm.parentCodeName = dataValue.parentCodeName
    // checkForm.firstParam = dataValue.firstParam
    // data.checkParamsValue = dataValue.firstParam ? dataValue.firstParam.split(',') : ""
    checkForm.firstParam = dataValue.deptCodes
    data.checkParamsValue = dataValue.deptCodes ? dataValue.deptCodes.split(',') : ""
    data.checkTimeValue = dataValue.secondParam ? dataValue.secondParam.split(',') : ""

    checkForm.secondParam = dataValue.secondParam
    checkForm.thirdParam = dataValue.thirdParam
    checkForm.fourthParam = dataValue.fourthParam
    checkForm.dictionaryType = dataValue.dictionaryType
    checkForm.departmentName = dataValue.departmentName
    checkForm.disposeLimitName = dataValue.disposeLimitName


    if (form.typeLevel == 0) {
        data.departmentHidden = false
        data.parentNameHidden = false
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = false
        // data.addHidden = false

    } else if (form.typeLevel == 1) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = false
        data.departmentShow = true
        data.timeShow = false
    } else if (form.typeLevel == 2) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = true
    } else if (form.typeLevel == 3) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = true
    } else if (form.typeLevel == 4) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = true
        data.addHidden = true
    }
    if (deptLevel == "1") {
        if (form.typeLevel == 0) {
            data.addHidden = false
            data.editHidden = false
        } else if (form.typeLevel == 1) {
            data.addHidden = false
            data.editHidden = false
        } else if (form.typeLevel == 2) {
            data.addHidden = false
            data.editHidden = false
        } else if (form.typeLevel == 3) {
            data.addHidden = true
            data.editHidden = false
        }
    } else if (deptLevel == "2") {
        if (form.typeLevel == 0) {
            data.addHidden = true
            data.editHidden = true
        } else if (form.typeLevel == 1) {
            data.addHidden = true
            data.editHidden = true
        } else if (form.typeLevel == 2) {
            data.addHidden = true
            data.editHidden = true
        } else if (form.typeLevel == 3) {
            data.addHidden = false
            data.editHidden = false
        } else if (form.typeLevel == 4) {
            data.addHidden = true
            data.editHidden = false
        }
    } else if (Number(deptLevel) > 2) {
        data.addHidden = true
        data.editHidden = true
    }
    
    console.log('dataValue', form.typeLevel, deptLevel)
};
const clean = () => {
    form.id = ""
    form.code = ""
    form.name = ""
    form.nextCode = ""
    form.typeCode = ""
    form.typeLevel = 0
    form.parentCode = ""
    form.parentCodeName = ""
    form.firstParam = ""
    data.paramsValue = []
    form.secondParam = ""
    form.thirdParam = ""
    form.fourthParam = ""
    form.dictionaryType = ""
}
const checkClean = () => {
    checkForm.id = ""
    checkForm.code = ""
    checkForm.name = ""
    checkForm.nextCode = ""
    checkForm.typeCode = ""
    checkForm.typeLevel = 0
    checkForm.parentCode = ""
    checkForm.parentCodeName = ""
    checkForm.firstParam = ""
    data.checkParamsValue = []
    checkForm.secondParam = ""
    checkForm.thirdParam = ""
    checkForm.fourthParam = ""
    checkForm.dictionaryType = ""
}

const save = () => {
    console.log('form', form)
    console.log('checkForm', checkForm)
    console.log('data.paramsValue', data.paramsValue)
    if (checkForm.id == "") {
        ElMessage.info("请选择节点后操作")
    } else {
        if (form.id === "") {
            if (form.name == "") {
                ElMessage.error("名称不可为空")
            } else {
                var postData = {
                    code: "",
                    dictionaryType: checkForm.dictionaryType,
                    // firstParam: data.paramsValue.join(','),
                    firstParam: "",
                    fourthParam: "",
                    name: form.name,
                    parentCode: checkForm.code,
                    secondParam: data.timeParamsValue ? data.timeParamsValue.join(',') : "",
                    sort: 1,
                    status: 1,
                    thirdParam: "",
                    typeCode: checkForm.typeCode,
                    typeLevel: Number(checkForm.typeLevel) + 1
                }
                classService.save(postData).then((res: Response) => {
                    if (res.code == 200) {
                        if (res.data.deptCodes) {
                            var bmArr = []
                            bmArr = res.data.deptCodes ? res.data.deptCodes.split(',') : []
                            var deptArr: any = []
                            bmArr.forEach((item: any) => {
                                var obj = {
                                    code: res.data.code,
                                    deptCode: item,
                                    codeType: res.data.typeCode
                                }
                                deptArr.push(obj)
                            })
                            console.log('deptArr', deptArr)
                            var postData: ReflectDeptModel = {
                                incrementFlag: true,
                                mreflectDeptList: deptArr
                            }
                            classService.saveReflectDept(postData).then((response: Response) => {
                                if (response.code == 200) {
                                    ElMessage.success(res.message)
                                    getFirst()
                                    clean()
                                    checkClean()
                                    data.saveFlag = true
                                    data.editFlag = true
                                } else {
                                    ElMessage.error(res.message)
                                }

                            })
                        } else {
                            ElMessage.success(res.message)
                            getFirst()
                            clean()
                            checkClean()
                            data.saveFlag = true
                            data.editFlag = true
                        }


                    } else {
                        ElMessage.error(res.message)
                    }
                })
            }
        } else {
            if (form.name == "") {
                ElMessage.error("名称不可为空")
            } else {
                var postDatas = {
                    code: form.code,
                    dictionaryType: form.dictionaryType,
                    // firstParam: data.paramsValue ? data.paramsValue.join(',') : "",
                    firstParam: "",
                    fourthParam: "",
                    name: form.name,
                    parentCode: form.parentCode,
                    secondParam: data.timeParamsValue ? data.timeParamsValue.join(',') : "",
                    sort: 1,
                    status: 1,
                    thirdParam: "",
                    typeCode: form.typeCode,
                    typeLevel: form.typeLevel,
                    id: form.id,
                }
                classService.update(postDatas).then((res: Response) => {
                    if (res.code == 200) {
                        if (data.paramsValue.length > 0) {
                            var deptArr: any = []
                            data.paramsValue.forEach((item: any) => {
                                var obj = {
                                    code: form.code,
                                    deptCode: item,
                                    codeType: form.typeCode
                                }
                                deptArr.push(obj)
                            })
                            console.log('deptArr', deptArr)
                            var postData: ReflectDeptModel = {
                                incrementFlag: true,
                                mreflectDeptList: deptArr
                            }
                            classService.saveReflectDept(postData).then((response: Response) => {
                                if (response.code == 200) {
                                    ElMessage.success(res.message)
                                    getFirst()
                                    clean()
                                    checkClean()
                                    data.saveFlag = true
                                    data.editFlag = true
                                    data.timeHidden = false
                                    data.departmentHidden = false
                                } else {
                                    ElMessage.error(res.message)
                                }

                            })
                        } else {
                            ElMessage.success(res.message)
                            getFirst()
                            clean()
                            checkClean()
                            data.saveFlag = true
                            data.editFlag = true
                            data.timeHidden = false
                            data.departmentHidden = false
                        }


                    } else {
                        ElMessage.error(res.message)
                    }
                })
            }
        }
    }
};
const add = () => {
    data.editFlag = false
    data.saveFlag = false
    if (form.typeLevel == 0) {
        data.departmentHidden = true
        data.parentNameHidden = false
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = false
        clean()
    } else if (form.typeLevel == 1) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = true
        data.departmentShow = false
        data.timeShow = false
        clean()
        form.parentCodeName = checkForm.name
    } else if (form.typeLevel == 2) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = false
        clean()
        form.parentCodeName = checkForm.name
    } else if (form.typeLevel == 3) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = true
        data.departmentShow = false
        data.timeShow = false
        clean()
        form.parentCodeName = checkForm.name
    } else if (form.typeLevel == 4) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = false
        clean()
        form.parentCodeName = checkForm.name
    }

}
const edit = () => {
    data.editFlag = false
    data.saveFlag = false
    if (form.typeLevel == 0) {
        data.departmentHidden = false
        data.parentNameHidden = false
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = false
    } else if (form.typeLevel == 1) {
        data.departmentHidden = true
        data.parentNameHidden = true
        data.timeHidden = false
        data.departmentShow = false
        data.timeShow = false
    } else if (form.typeLevel == 2) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = true
        data.departmentShow = false
        data.timeShow = false
    } else if (form.typeLevel == 3) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = true
        data.departmentShow = false
        data.timeShow = false
    } else if (form.typeLevel == 4) {
        data.departmentHidden = false
        data.parentNameHidden = true
        data.timeHidden = true
        data.departmentShow = false
        data.timeShow = false
    }
}
const remove = () => {
    if (form.id == "") {
        ElMessage.error('请选择节点后再操作')
    } else {
        ElMessageBox.confirm("确定要删除吗", "删除", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        }).then(() => {
            classService.delete(form.id as string).then((res: Response) => {
                ElMessage({
                    message: res.message,
                    type: res.code == 200 ? "success" : "error",
                });
                getFirst()
                clean()
            })
        }).catch(() => {
            ElMessage({
                type: "info",
                message: "取消删除",
            });
        });

    }
}
const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.departmentName.includes(value)
}
const filterNodes = (value: string, data: any) => {
    if (!value) return true
    return data.name.includes(value)
}

watch(
    () => keywords.value,
    (keywords) => {
        treeRefs.value!.filter(keywords);
    },
);
watch(data.paramsValue, (val) => {
    treeRef.value!.filter(val)
})

</script>
<style lang="scss" scoped>
// .layout {
//     height: calc(100% - 50px) !important;
// }

.btnGroup {
    display: flex;
    justify-content: flex-end;
}
</style>