<template>
  <div class="selectCompany">
    <el-input v-model="state.company" placeholder="点击右侧按钮编辑" readonly>
      <template #append><el-button @click="companyClickHandle" :icon="Edit" /></template>
    </el-input>
    <el-dialog v-model="state.dialogShow" width="40%" destroy-on-close title="公司列表" @close="state.dialogShow = false"
      draggable>
      <div class="search">
        <SelectCompanyConcat @changeSelect="(val: any) => state.companyList = val" :task-id="props.taskId"
          ref="selectCompanyConcat" />
        <el-button @click="saveHandle">添加</el-button>
        <el-popover :visible="state.visible" placement="bottom" :width="300">
          <el-input v-model="state.input" style="width: 100%" placeholder="请输入公司名称" />
          <div style="text-align: right; margin-top: 10px">
            <el-button size="small" text @click="state.visible = false">取消</el-button>
            <el-button size="small" type="primary" @click="saveHandle2">
              确认
            </el-button>
          </div>
          <template #reference>
            <el-button @click="showPopup" v-if="company" style="margin-right: 5px">手动添加</el-button>
          </template>
        </el-popover>
      </div>
      <el-table :data="state.tableData" style="width: 100%" height="500px" :header-cell-style="{
        'text-align': 'center',
        background: '#f2f7ff',
      }" :cell-style="{ 'text-align': 'center' }" ref="companyTable">
        <el-table-column prop="company" label="公司名称" min-width="60%" />
        <el-table-column prop="department" label="审批部门" min-width="20%" />
        <el-table-column fixed="right" label="操作" min-width="20%">
          <template #default="scope">
            <el-button link type="danger" :loading="scope.row.loading" size="small"
              @click="removeHandle(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogSave">关闭</el-button>
          <el-button type="primary" @click="dialogSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, reactive, computed } from 'vue'
import { ElMessage, ElTable } from 'element-plus'
import { Edit, Search } from '@element-plus/icons-vue'
import SelectCompanyConcat from './SelectCompanyConcat.vue'
import { cloneDeep } from 'lodash-es'
import { CompanyModel } from '@/api/model/disposeModel'
import { CompanyService } from '@/api/service/Dispose/CompanyService'
import { Session } from '@/utils/storage'

const rules = reactive<any>({
  department: [
    { required: false, message: '手动添加时部门为必填', trigger: 'blur' },
  ],
})
const props = withDefaults(
  defineProps<{
    taskId?: string
  }>(),
  {
    taskId: '',
  }
)
const emit = defineEmits(['getCompany', 'changeLoading', 'done'])
const ruleFormRef = ref()
const companyService = new CompanyService()
const companyTable = ref()
const selectCompanyConcat = ref()
const state = reactive({
  dialogShow: false,
  tableData: [] as Array<CompanyModel>,
  searchText: '',
  company: '',
  companyList: [] as Array<CompanyModel>,
  oldData: [] as Array<CompanyModel>,
  visible: false,
  input: '',
  form: { department: '' },
})
const company = computed(()=>{
  return Session.get('appConfig').company
})
const showPopup = () => {
  state.visible = true
  // rules.department[0] = {
  //   required: true,
  //   message: '手动添加时所属区域为必填',
  //   trigger: 'blur',
  // }
  // ruleFormRef.value.validate((valid: boolean) => {
  //   if (valid) {
  //     state.visible = true
  //   } else {
  //     ElMessage.warning('手动添加时所属区域为必填')
  //   }
  // })
}
const companyClickHandle = () => {
  state.dialogShow = true
  init()
}
const dialogSave = () => {
  state.dialogShow = false
  state.company =
    state.tableData.length > 0
      ? state.tableData.map((i: any) => i.company).join(',')
      : ''
  emit('getCompany', state.tableData)
}
const removeHandle = (row: any) => {
  state.tableData.forEach((item) => {
    if (item.id === row.id) {
      item.loading = true
    }
  })
  companyService
    .delete(row.id)
    .then((res) => {
      ElMessage({
        type: res.code == 200 ? 'success' : 'error',
        message: res.message,
      })
      init()
    })
    .catch(() => init())
}

const saveHandle = async () => {
  let list = cloneDeep(state.tableData)
  list = list.concat(state.companyList)
  const obj: { [key: string]: boolean } = {}
  let tableData = list.reduce<CompanyModel[]>((item, next) => {
    if (!obj[next.company]) {
      item.push(next)
      obj[next.company] = true
    }
    return item
  }, [])

  tableData.forEach((item) => {
    if (!state.oldData.some((i) => i.company === item.company)) {
      companyService.save(item).then((res) => {
        init()
        if (res.code != 200) {
          ElMessage({
            type: 'error',
            message: res.message,
          })
        }
      })
    }
  })
  state.companyList = []
  selectCompanyConcat.value.clear()
}
const saveHandle2 = () => {
  if (state.input) {
    companyService
      .save({
        company: state.input,
        taskId: props.taskId,
        department: "上海",
      })
      .then((res) => {
        if (res.code == 200) {
          state.visible = false
          state.input = ''
          init()
        } else {
          ElMessage({
            type: 'error',
            message: res.message,
          })
        }
      })
  }
}
const init = () => {
  // ruleFormRef.value?.resetFields()
  companyService.postFindByTaskId(props.taskId).then((res) => {
    state.tableData = state.oldData = res.data
    if (res.data.length > 0) {
      state.company = res.data.map((i: CompanyModel) => i.company).join(',')
    }
  })
}
init()
// watch(
//   () => props.submit,
//   (val) => {

//   },
//   { deep: true }
// );
</script>
<style lang="scss" scoped>
.selectCompany {
  width: 100%;
}

.search {
  display: flex;
  align-items: center;
  height: 30px;
  margin-bottom: 20px;

  .el-button {
    height: 30px;

    &:nth-of-type(1) {
      border-left: 0;
    }
  }

  .el-form {
    height: 100%;
  }
}

// ::v-deep(.el-form-item__error) {
//   z-index: 100;
// }</style>
