<template>
  <el-dialog v-model="data.dialogVisible" :title="props.dialogStatus" width="40%" @close="$emit('closeDialog')" destroy-on-close :close-on-click-modal="false">
    <div class="sql_icon-wrap" v-if="!data.sqlType">
      SQL
      <div class="sql_icon-box">
        <div class="item" v-for="item in sqlList" :key="item.icon" @click="data.sqlType=item.name">
          <img :src=" getImageUrl(item.icon)" alt="">
          <span>{{ item.name }}</span>
        </div>
      </div>
      NoSQL
      <div class="sql_icon-box">
        <div class="item" v-for="item in noSqlList" :key="item.icon" @click="data.sqlType=item.name">
          <img :src=" getImageUrl(item.icon)" alt="">
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
    <el-form ref="dataForm" :inline="true" :model="props.formData" class="form" :rules="rules" v-else>
      <el-form-item label="数据源名称:" prop="clientId" class="long_item" >
        <el-input v-model="props.formData.clientId" placeholder="数据源名称" />
      </el-form-item>
      <el-form-item label="JDBC URL:" prop="scope" class="long_item"  >
        <el-input v-model="props.formData.scope" placeholder="JDBC URL" />
      </el-form-item>
     <el-form-item label="用户名:" prop="accessTokenValidity" class="long_item"  >
        <el-input v-model.number="props.formData.accessTokenValidity" placeholder="用户名" />
      </el-form-item>
      <el-form-item label="密码:" prop="clientSecret" class="long_item"  >
        <el-input
          v-model="props.formData.clientSecret"
          type="password"
          placeholder="密码"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="备注:" prop="refreshTokenValidity" class="long_item"  >
        <el-input v-model.number="props.formData.refreshTokenValidity" placeholder="备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer" v-if="data.sqlType">
        <el-button  @click="data.sqlType=''">上一步</el-button>
        <el-button >测试连接</el-button>
        <el-button type="primary">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { ElForm } from 'element-plus'
import type { FormRules } from "element-plus";
import { View, Hide, Edit } from '@element-plus/icons-vue'
import { ClientModel } from "@/api/model/clientModel";

import { useCode } from '@/hooks/useCode'
import { cloneDeep } from "lodash-es";

const emits = defineEmits(['closeDialog', 'update', 'save']);
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: {} as ClientModel
  },
  dialogStatus: {
    type: String
  }
})

const sqlList = [
  {
    name: "MySQL",
    icon: 'mysql.png',
    driver: ""
  },
  {
    name: "Oracle",
    icon: "oracle.png"
  },
  {
    name: "SQLServer",
    icon: "sqlserver.png"
  },
  {
    name: "PostgreSQL",
    icon: "postgresql.png"
  },
  {
    name: "Sybase",
    icon: "sybase.png"
  },
  {
    name: "TiDB",
    icon: "tidb.png"
  },
  {
    name: "OpenGauss",
    icon: "opengauss.png"
  },
  {
    name: "OceanBase",
    icon: "oceanbase.jpg"
  },
  {
    name: "达梦",
    icon: "dm.jpg"
  },
  {
    name: "GBase",
    icon: "gbase.png"
  },
  {
    name: "TDSql",
    icon: "tssql.png"
  },
  {
    name: "Doris",
    icon: "doris.png"
  },
  {
    name: "StarRocks",
    icon: "starrocks.png"
  }
]
const noSqlList = [
  {
    name: "ElasticSearch",
    icon: 'elasticsearch.jpg',
    driver: ""
  },
  {
    name: "MongoDB",
    icon: "mongoDB.png"
  },
  {
    name: "TDengine",
    icon: "tdengine.png"
  },
  {
    name: "Hive",
    icon: "hive.png"
  }
]

const getImageUrl = (path:string) => {
    return new URL(`../../../../assets/db/${path}`, import.meta.url).href;
} 
const data = reactive({
  dialogVisible: false,
  formData: {},
  sqlType: ''
})
const dataForm = ref(ElForm)

const rules = reactive<InstanceType<typeof FormRules>>({
  // clientId: [{ required: true, validator: checkClientId, trigger: 'blur' }],
  clientId: [{ required: true, message: "客户端编号不能为空", trigger: "blur" }],
  resourceList: [{ required: true, message: "请选择可访问资源", trigger: "blur" }],
  scope: [{ required: true, message: "授权范围不能为空", trigger: "blur" }],
  authList: [{ required: true, message: "请选择授权类型", trigger: "blur" }],
  clientSecret:  [{ required: true, message: "密码不能为空", trigger: "blur" }]
});


const createData = () => {
  const form = unref(dataForm)
  form.validate(async (valid: any) => {
    if (valid) {
      let params = cloneDeep(props.formData)
      props.dialogStatus === '修改' ? emits('update', params) : emits('save', params)
     }
  })
}


watch(props, (newValue, oldValue) => {
  data.dialogVisible = newValue.showFlag
})
</script>
<style lang="scss" scoped>
.sql_icon-wrap{
  width: 100%;
}
.sql_icon-box{
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .item{
    width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin: 10px;
    height: 120px;
    padding: 15px 10px 20px;
    box-sizing: border-box;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    &:hover{
      // box-shadow: none;
      box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
    }
    img{
      width: 50px;
      height: 50px;
      height: fit-content;
      // margin-bottom: 15px;
    }
    span{
      font-size: 16px;
    }
  }
}
.el-form{
  .long_item{
    width: 100%;
  }
}
</style>