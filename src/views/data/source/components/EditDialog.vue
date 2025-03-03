<template>
  <el-dialog
    v-model="data.dialogVisible"
    :title="props.dialogStatus"
    width="41%"
    @close="$emit('closeDialog')"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="sql_icon-wrap" v-if="!data.formData.dataSourceType">
      SQL
      <div class="sql_icon-box">
        <div
          class="item"
          v-for="item in types.SQLTypes"
          :key="item.firstParam"
          @click="clickHandle(item)"
        >
          <img :src="getImageUrl(item.firstParam)" alt="" />
          <span>{{ item.codeName }}</span>
        </div>
      </div>
      NoSQL
      <div class="sql_icon-box">
        <div
          class="item"
          v-for="item in types.NoSQLTypes"
          :key="item.firstParam"
          @click="clickHandle(item)"
        >
          <img :src="getImageUrl(item.firstParam)" alt="" />
          <span>{{ item.codeName }}</span>
        </div>
      </div>
    </div>
    <el-form
      ref="dataForm"
      :inline="true"
      :model="data.formData"
      class="form"
      :rules="rules"
      v-else
    >
      <el-form-item label="数据源名称:" prop="dataSourceName" class="long_item">
        <el-input v-model="data.formData.dataSourceName" placeholder="数据源名称" />
      </el-form-item>
      <el-form-item label="数据源类型:" prop="dataSourceType" class="long_item">
        <el-input v-model="data.formData.dataSourceType" placeholder="数据源类型" disabled />
      </el-form-item>
      <el-form-item label="驱动:" prop="driver" class="long_item">
        <el-input v-model="data.formData.driver" placeholder="驱动" disabled />
      </el-form-item>
      <el-form-item label="JDBC URL:" prop="dataSourceUrl" class="long_item">
        <el-input v-model="data.formData.dataSourceUrl" placeholder="JDBC URL" />
      </el-form-item>
      <el-form-item
        label="用户名:"
        prop="userName"
        class="long_item"
      >
        <el-input
          v-model.number="data.formData.userName"
          placeholder="用户名"
        />
      </el-form-item>
      <el-form-item label="口令:" prop="passWord" class="long_item">
        <el-input
          v-model="data.formData.passWord"
          type="password"
          placeholder="密码"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="备注:" prop="remark" class="long_item">
        <el-input
          v-model.number="data.formData.remark"
          placeholder="备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer" v-if="data.formData.dataSourceType">
        <el-button @click="reset">上一步</el-button>
        <el-button @click="connect" :loading="data.loading" >测试连接</el-button>
        <el-button type="primary" @click="createData" >确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from 'vue'
import { ElForm } from 'element-plus'
import type { FormRules } from 'element-plus'
import { View, Hide, Edit } from '@element-plus/icons-vue'

import { useCode } from '@/hooks/useCode'
import { cloneDeep } from 'lodash-es'
import { CodeModel } from '@/api/model/codeModel'
import { DataSourceModel } from '@/api/model/dataModel'
import { DataSourceService } from '@/api/service/Data/DataSourceService'
import { ElMessage } from 'element-plus'

const { types } = useCode()
const dataSourceSever = new DataSourceService();
const emits = defineEmits(['closeDialog', 'update', 'save'])
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: DataSourceModel,
    default: {} as DataSourceModel,
  },
  dialogStatus: {
    type: String,
  },
})


const getImageUrl = (path: string) => {
  return new URL(`../../../../assets/db/${path}`, import.meta.url).href
}
const data = reactive({
  dialogVisible: false,
  formData: {} as DataSourceModel,
  loading: false
})
const dataForm = ref(ElForm)

const rules = reactive<InstanceType<typeof FormRules>>({
  dataSourceName: [
    { required: true, message: '不能为空', trigger: 'blur' },
  ],
  dataSourceType: [
    { required: true, message: '不能为空', trigger: 'blur' },
  ],
  driver: [{ required: true, message: '不能为空', trigger: 'blur' }],
  dataSourceUrl: [{ required: true, message: '不能为空', trigger: 'blur' }]
})

const clickHandle = (item: CodeModel)=>{
  data.formData.dataSourceType = item.codeName
  data.formData.driver = item.secondParam!
}
const reset = ()=>{
  data.formData = {} as DataSourceModel
}
const connect = ()=>{
  data.loading = true
  dataSourceSever.connect(data.formData).then(res=>{
    data.loading = false
    ElMessage({
      type: res.code == 200 ? 'success' : 'error',
      message: res.code == 200 ? '连接成功' : '连接失败'
    })
  })
}

const createData = () => {
  const form = unref(dataForm)
  form.validate(async (valid: any) => {
    if (valid) {
      let params = cloneDeep(data.formData)
      props.dialogStatus === '修改'
        ? emits('update', params)
        : emits('save', params)
    }
  })
}

watch(()=>props.showFlag, (newValue, oldValue) => {
  data.dialogVisible = props.showFlag
})
watch(()=>props.formData, (newValue, oldValue) => {
  data.formData = cloneDeep(props.formData)
},{
  deep: true
})
</script>
<style lang="scss" scoped>
.sql_icon-wrap {
  width: 100%;
}
.sql_icon-box {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .item {
    cursor: pointer;
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin: 10px;
    height: 100px;
    padding: 15px 10px 20px;
    box-sizing: border-box;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    &:hover {
      // box-shadow: none;
      box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
        rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
    }
    img {
      width: 30px;
      height: 30px;
      height: fit-content;
      // margin-bottom: 15px;
    }
    span {
      font-size: 16px;
    }
  }
}
.el-form {
  .long_item {
    width: 100%;
  }
}
</style>
