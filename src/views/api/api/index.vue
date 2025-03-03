<template>
  <Layout>
    <template #tree>
      <div class="tree_container">
        <div class="header-search">
          <div class="header-left">
            <el-icon>
              <Menu />
            </el-icon>
            API分类
          </div>
          <el-button type="primary" size="small" >创建</el-button>
        </div>
        <!--这是一个完美的分割线-->
        <div class="split-line"></div>
        <div class="tree">
          <ApiGroupTree
            @handleNodeClick="handleNodeClick"
            @addHandle="addApiGroupHandle"
            @editHandle="editApiGroupHandle"
            @getTree="val => state.apiGroupList = val "
            :showSearch="false"
            :showLine="false"
            :treeJson="{ type: apiGroupSever }"
            :refresh="state.refresh"
            @setRefresh="()=>state.refresh =  false" 
            operate
          />
        </div>
      </div>
    <el-dialog
      v-model="state.groupDialogShow"
      :title="state.groupFlag === 'add' ? '创建分组' : '修改分组'"
      width="500"
    >
      <el-form ref="groupForm" :inline="true" :model="state.groupForm" class="dataForm" :rules="rules">
        <el-form-item label="分组编码:" prop="groupCode" class="long_item">
          <el-input v-model="state.groupForm.groupCode" placeholder="接口编码" :disabled="state.groupFlag === 'edit'" clearable />
        </el-form-item>
        <el-form-item label="分组名称:" prop="groupName" class="long_item">
          <el-input v-model="state.groupForm.groupName" placeholder="接口名称" clearable />
        </el-form-item>
        <el-form-item label="上级分组:" prop="parentCode" class="long_item" v-if="state.groupFlag === 'add'" >
          <el-tree-select
            v-model="state.groupForm.parentCode"
            :data="state.apiGroupList"
            :render-after-expand="false"
            node-key="code"
            clearable
            check-strictly
            :props="{ children: 'child', label: 'name', value: 'code' }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeGroupDialog">取消</el-button>
          <el-button type="primary" @click="submitGroup">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    </template>
    <template #button>
      <div class="sh3h-search-box div-flex-column">
        <el-row>
          <el-col :span="5">
            <span class="sh3h-search-lable div-flex-right">DB:</span>
            <el-select class="sh3h-search-input" v-model="apiState.apiSqlInfo.dataSourceId" placeholder="DB" @change="getSchema" >
              <el-option :label="item.dataSourceName" :value="item.id" v-for="item in apiState.dbList" />
            </el-select>
          </el-col>
          <el-col :span="5">
            <span class="sh3h-search-lable div-flex-right">Schema:</span>
            <el-select class="sh3h-search-input" v-model="apiState.apiSqlInfo.schemaName" placeholder="Schema"  @change="getTable">
              <el-option :label="item.schema" :value="item.schema" v-for="item in apiState.schemaList"  />
            </el-select>
          </el-col>
          <el-col :span="5">
            <span class="sh3h-search-lable div-flex-right">table:</span>
            <el-select class="sh3h-search-input" v-model="apiState.apiSqlInfo.tableName" placeholder="table">
              <el-option :label="item.tableName" :value="item.tableName" v-for="item in apiState.sqlTableList"  />
            </el-select>
          </el-col>
          <el-col :span="5">
            <span class="sh3h-search-lable div-flex-right">sql:</span>
            <el-select class="sh3h-search-input" v-model="apiState.apiSqlInfo.operaType" placeholder="sql" @change="changeOperaType" >
              <el-option label="Select查询" value="select" />
              <el-option label="Insert插入" value="insert" />
              <el-option label="Delete删除" value="delete" />
              <el-option label="Update修改" value="update" />
              <el-option label="Call存储过程" value="call" />
            </el-select>
          </el-col>
          <el-col :span="4" class="div-flex-right">
            <el-icon class="MagicStick" @click="sqlFormat">
              <MagicStick />
            </el-icon>
            <el-button type="primary" @click="runSQL" >运行</el-button>
          </el-col>
        </el-row>
      </div>
    </template>
    <template #content>
      <div class="code-mirror">
        <Codemirror v-model="apiState.apiSqlInfo.sqlScript" :extensions="extensions" :autofocus="true" :indent-with-tab="true"
          :tabSize="2" />
      </div>
      <div class="result-wrap">
        <el-tabs v-model="state.activeName" class="demo-tabs" @tab-click="tabChange">
          <el-tab-pane label="结果" name="first"></el-tab-pane>
          <el-tab-pane label="基本信息" name="second"></el-tab-pane>
          <el-tab-pane label="请求参数" name="third"></el-tab-pane>
          <el-tab-pane label="返回参数" name="fourth"></el-tab-pane>
        </el-tabs>
        <div class="result-content">
          <v-ace-editor
              v-if="state.activeName === 'first' && state.jsonValue"
              v-model:value="state.jsonValue"
              @init="jsonFormat"
              :lang="aceConfig.lang"
              :theme="aceConfig.theme"
              :options="aceConfig.options"
              :readonly="aceConfig.readOnly"
              class="ace-editor"
            />
          <el-empty description="暂无数据"  v-if="state.activeName === 'first' && !state.jsonValue " />
          <BaseInfo :list='state.apiGroupList' v-show="state.activeName === 'second'" ref="baseInfoRef" :formData="state.apiInfo.apiBaseInfo" />
          <ResquestInfo :showFlag="state.requestDrawer" @closeDialog="closeDialog" ref="resquestInfoRef" />
          <ResponseInfo :showFlag="state.responseDrawer" @closeDialog="closeDialog" ref="responseInfoRef" />
        </div>
      </div>
    </template>
    <template #bottom>
      <div class="btnGroup">
        <div class="btn-wrap">
          <el-button v-for="item in types.SQLSentence" @click="checkSQLSentence(item)" >{{ item.codeName }}</el-button>
        </div>
        <div class="btn-wrap">
          <el-button type="primary" @click="checkSubmit('0')" >保存</el-button>
          <el-button type="primary">测试</el-button>
          <el-button type="primary" :disabled="state.publish" @click="checkSubmit('1')" >发布</el-button>
        </div>
      </div>
    </template>
  </Layout>
  
</template>
<script scoped lang="ts" setup>
import { reactive, ref } from 'vue'
import { Menu } from '@element-plus/icons-vue'
import Layout from '@/components/Layout/Layout.vue'
import { Codemirror } from 'vue-codemirror'
import { MagicStick } from '@element-plus/icons-vue'
import { sql } from '@codemirror/lang-sql'
import * as sqlFormatter from 'sql-formatter'
import BaseInfo from './components/baseInfo.vue'
import ResquestInfo from './components/resquestInfo.vue'
import ResponseInfo from './components/responseInfo.vue'
import { DataSourceModel } from '@/api/model/dataModel'
import { DataSourceService } from '@/api/service/Data/DataSourceService'
import { ApiInfoService, ApiGroupService } from '@/api/service/Api/ApiService'
import { ApiGroupModel, ApiModel, ApiSqlInfoModel } from '@/api/model/apiModel'
import { ElMessage } from 'element-plus'
import ApiGroupTree from '@/businessComponent/tree/index.vue'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/ext-language_tools'
import type { FormRules } from 'element-plus'
import { useCode } from '@/hooks/useCode'
import { useApiData } from './useApiData'

const extensions = [sql()]
const apiInfoSever = new ApiInfoService()
const apiGroupSever = new ApiGroupService()
const baseInfoRef = ref()
const resquestInfoRef = ref()
const responseInfoRef = ref()
const groupForm = ref()
const { types } = useCode()
const { apiState, getSchema, getTable } = useApiData()

const rules = reactive<InstanceType<typeof FormRules>>({
  apiCode: [{ required: true, message: '不能为空', trigger: 'blur' }],
  apiName: [{ required: true, message: '不能为空', trigger: 'blur' }]
})

const aceConfig = reactive({
  lang: 'json', //解析json
  theme: 'chrome', //主题
  readOnly: false, //是否只读
  options: {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    tabSize: 2,
    showPrintMargin: false,
    fontSize: 14,
  },
})
const state = reactive({
  list: [
    {
      label: '分组',
      children: [
        { label: '12319' },
        { label: '12345' },
        { label: '网格' },
        { label: '信访' },
      ],
    },
  ],
  sql: '',
  activeName: '',
  requestDrawer: false,
  responseDrawer: false,
  groupDialogShow: false,
  apiInfo: {} as ApiModel,
  jsonValue: "",
  error: "",
  apiGroupList: [],
  groupForm: {} as ApiGroupModel,
  groupFlag: '',
  refresh: false,
  publish: true
})

// JSON格式化
const jsonFormat = () => {
    try {
      state.error = ''
      state.jsonValue = state.jsonValue && JSON.stringify(JSON.parse(state.jsonValue), null, 2)
    } catch (e) {
      state.error = '格式化失败，请检查是否JSON格式错误'
    }
};
const sqlFormat = () => { // sql语句格式化
  state.sql = sqlFormatter.format(state.sql)
}
const closeDialog = ()=>{ // 关闭请求/返回抽屉
  state.requestDrawer = false
  state.responseDrawer = false
}
const closeGroupDialog = ()=>{ // 关闭分组弹窗
  state.groupDialogShow = false
  state.groupForm = {} as ApiGroupModel
}
const changeOperaType = (val:string)=>{ // 切换sql
  switch(val){
    case 'select':
    apiState.apiSqlInfo.sqlScript += `\n select * from ${apiState.apiSqlInfo.tableName}`;
      break;
    case 'insert':
      break;
  }
}
const tabChange = (val: any) => {
  switch(val.props.name){
    case 'third':
      state.requestDrawer = true;
      break;
    case 'fourth':
      state.responseDrawer = true
      break;
  }
}
const handleNodeClick = (node: any) => {
  
}
const checkSQLSentence = (item: any)=>{ // 选择动态语句
  let param = item.firstParam.replaceAll('${n}', '\n')
  apiState.apiSqlInfo.sqlScript += '\n' + param;
}

const runSQL = ()=>{
  if(checkRunSQL()){
    apiInfoSever.execute(apiState.apiSqlInfo.dataSourceId,{
      "datasourceType": apiState.apiSqlInfo.dataSourceType,
      "operateType":  apiState.apiSqlInfo.operaType,
      "params": {},
      "schema": apiState.apiSqlInfo.schemaName,
      "sql": apiState.apiSqlInfo.sqlScript
    }).then(res=>{
      state.jsonValue = JSON.stringify(res)
      state.activeName = 'first'
    })
  }
}

const checkRunSQL = ()=>{
  if(!apiState.apiSqlInfo.dataSourceId || !apiState.apiSqlInfo.schemaName || !apiState.apiSqlInfo.tableName){
    ElMessage.warning('请选择数据源')
    return false
  }
  if(!apiState.apiSqlInfo.sqlScript){
    ElMessage.warning('请输入SQL查询语句')
    return false
  }
  return true
}
const checkSubmit = (isPublish: string)=>{
  if(checkRunSQL()){
    baseInfoRef.value.checkForm().then((valid:boolean)=>{
      if(valid){
        submit(isPublish)
      }else{
        state.activeName = 'second'
      }
    })
  }
}


const submitGroup = ()=>{
  groupForm.value.validate((valid:boolean) => {
    if (valid) {
      if(state.groupFlag === 'add'){
        apiGroupSever.save(state.groupForm).then(res=>{
          ElMessage({
            type: res.code == 200 ? 'success' : 'danger',
            message:res.message
          })
          if(res.code === 200){
            state.groupDialogShow = false
            state.refresh = true
          }
        })  
      }else{
        apiGroupSever.update(state.groupForm.id!,state.groupForm).then(res=>{
          ElMessage({
            type: res.code == 200 ? 'success' : 'danger',
            message:res.message
          })
          if(res.code === 200){
            state.groupDialogShow = false
            state.refresh = true
          }
        }) 
      }
    }
  });
  
}

const addApiGroupHandle = (row: any)=>{
  state.groupForm.parentCode = row.code
  state.groupFlag = 'add' 
  state.groupDialogShow = true 
}
const editApiGroupHandle = (row: any)=>{
  state.groupFlag = 'edit' 
  state.groupForm.groupCode = row.code
  state.groupForm.id = row.id
  state.groupForm.groupName = row.name
  state.groupDialogShow = true 
}


const submit = (isPublish: string)=>{
  let params: ApiModel = {
    apiBaseInfo: {
      ...baseInfoRef.value.getformData(),
      isPage: resquestInfoRef.value.getformData().isPage,
      isPublish
    },
    apiSqlInfo: apiState.apiSqlInfo,
    requestParams: resquestInfoRef.value.getformData().params,
    responseParams:responseInfoRef.value.getformData().params
  }
  
  apiInfoSever.save(params).then(res=>{
    ElMessage({
      type: res.code == 200 ? 'success' : 'danger',
      message:res.message
    })
    if(res.code === 200){
      state.refresh = true
      state.publish = false
    }
  })
}
</script>
<style lang="scss" scoped>
.tree_container {
  height: 100%;

  .tree {
    height: calc(100% - 70px);
  }

  .header-search {
    padding: 10px 20px 0;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;

    .header-left {
      color: var(--lt-historyCase-value-color);
      font-size: 14px;
      display: flex;
      align-items: center;

      .el-icon {
        color: var(--el-color-primary);
        margin: 2px 5px 0 0;
      }
    }
  }

  .split-line {
    margin-top: 10px;
  }
}

.sh3h-search-box {
  background-color: transparent;

  .MagicStick {
    font-size: 20px;
    color: var(--el-color-primary);
    margin-right: 10px;
  }
}

.code-mirror {
  height: calc(50% - 10px);
  background-color: white;
  font-size: 14px;
  overflow-y: auto;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  font-family: var(--lt-font-family-medium);
  color: var(--lt-historyCase-value-color);
  ::v-deep(.ͼ1.cm-focused){
    outline: none;
  }
}

.result-wrap {
  height: 50%;

  // border-bottom: 1px solid var(--lt-tree-border-color);
  .result-content {
    height: calc(100% - 50px);
    overflow-y: auto;

    ::v-deep(.el-empty) {
      padding: 0;
    }
  }
}

.btnGroup {
  width: 100%;
  display: flex;
  justify-content: space-between;
  .btn-wrap{
    display: flex;
  }
}
.el-table{
  width: 100%;
  flex: 1;
  ::v-deep(.cell ){
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    }
}
.ace-editor{
  width: 100%;
  height: 100%;
}
</style>
