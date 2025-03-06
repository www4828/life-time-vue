<template>
  <div class="sql-create">
    <div class="sh3h-search-box div-flex-column sql-create_button">
      <el-row>
        <el-col :span="5">
          <span class="sh3h-search-lable div-flex-right">DB:</span>
          <el-select
            class="sh3h-search-input"
            v-model="apiState.apiSqlInfo.dataSourceId"
            placeholder="DB"
            @change="getSchema"
            clearable
          >
            <el-option
              :label="item.dataSourceName"
              :value="item.id"
              v-for="item in apiState.dbList"
            />
          </el-select>
        </el-col>
        <el-col :span="5">
          <span class="sh3h-search-lable div-flex-right">Schema:</span>
          <el-select
            class="sh3h-search-input"
            v-model="apiState.apiSqlInfo.schemaName"
            placeholder="Schema"
            @change="getTable"
            clearable
          >
            <el-option
              :label="item.schema"
              :value="item.schema"
              v-for="item in apiState.schemaList"
            />
          </el-select>
        </el-col>
        <el-col :span="5">
          <span class="sh3h-search-lable div-flex-right">table:</span>
          <el-select
            class="sh3h-search-input"
            v-model="apiState.apiSqlInfo.tableName"
            placeholder="table"
            clearable
          >
            <el-option
              :label="item.tableName"
              :value="item.tableName"
              v-for="item in apiState.sqlTableList"
            />
          </el-select>
        </el-col>
        <el-col :span="5">
          <span class="sh3h-search-lable div-flex-right">sql:</span>
          <el-select
            class="sh3h-search-input"
            v-model="apiState.apiSqlInfo.operaType"
            placeholder="sql"
            @change="changeOperaType"
            clearable
          >
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
          <el-button type="primary" @click="runSQL">运行</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="sql-create_content">
      <div class="code-mirror">
        <Codemirror
          v-model="apiState.apiSqlInfo.sqlScript"
          :extensions="extensions"
          :autofocus="true"
          :indent-with-tab="true"
          :tabSize="2"
        />
      </div>
      <div class="result-wrap">
        <el-tabs
          v-model="apiState.activeName"
          class="demo-tabs"
          @tab-click="tabChange"
        >
          <el-tab-pane label="结果" name="first"></el-tab-pane>
          <el-tab-pane label="基本信息" name="second"></el-tab-pane>
          <el-tab-pane label="请求参数" name="third"></el-tab-pane>
          <el-tab-pane label="返回参数" name="fourth"></el-tab-pane>
        </el-tabs>
        <div class="result-content">
          <v-ace-editor
            v-if="apiState.activeName === 'first' && apiState.jsonValue"
            v-model:value="apiState.jsonValue"
            @init="jsonFormat"
            :lang="aceConfig.lang"
            :theme="aceConfig.theme"
            :options="aceConfig.options"
            :readonly="aceConfig.readOnly"
            class="ace-editor"
          />
          <el-empty
            description="暂无数据"
            v-if="apiState.activeName === 'first' && !apiState.jsonValue"
          />
          <BaseInfo
            :list="props.list"
            :groupCode="props.groupCode"
            v-show="apiState.activeName === 'second'"
            ref="baseInfoRef"
            :formData="props.apiInfo?.apiBaseInfo"
          />
          <ResquestInfo
            :showFlag="state.requestDrawer"
            @closeDialog="closeDialog"
            ref="resquestInfoRef"
            :formData="props.apiInfo?.requestParams"
          />
          <ResponseInfo
            :showFlag="state.responseDrawer"
            @closeDialog="closeDialog"
            ref="responseInfoRef"
            :list="props.apiInfo?.responseParams"
          />
        </div>
      </div>
    </div>
    <div class="sql-create_bottom">
      <div class="btn-wrap">
        <el-button
          v-for="item in types.SQLSentence"
          @click="checkSQLSentence(item)"
          >{{ item.codeName }}</el-button
        >
      </div>
      <div class="btn-wrap">
        <el-button type="primary" @click="checkSubmit('0')">保存</el-button>
        <el-button type="primary" @click="runSQL">测试</el-button>
        <el-button type="primary" @click="checkSubmit('1')">发布</el-button>
        <el-button  @click="emits('back')">返回</el-button>
      </div>
    </div>
  </div>
</template>
<script scoped lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { MagicStick } from '@element-plus/icons-vue'
import { sql } from '@codemirror/lang-sql'

import BaseInfo from './baseInfo.vue'
import ResquestInfo from './resquestInfo.vue'
import ResponseInfo from './responseInfo.vue'
import { ApiInfoService } from '@/api/service/Api/ApiService'
import { ApiGroupModel, ApiModel, ApiSqlInfoModel } from '@/api/model/apiModel'
import { ElMessage } from 'element-plus'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/ext-language_tools'
import { useCode } from '@/hooks/useCode'
import { useApiData } from '../useApiData'
import { cloneDeep } from 'lodash-es'

const emits = defineEmits(['back'])
const props = defineProps({
  apiInfo: {
    type: ApiModel
  },
  groupCode: {
    type: String
  },
  list: {}
})

const extensions = [sql()]
const apiInfoSever = new ApiInfoService()
const baseInfoRef = ref()
const resquestInfoRef = ref()
const responseInfoRef = ref()
const { types } = useCode()
const {
  apiState,
  getSchema,
  getTable,
  aceConfig,
  checkSQLSentence,
  checkRunSQL,
  sqlFormat,
  runSQL,
  jsonFormat,
  changeOperaType,
  getDataSource
} = useApiData()
getDataSource()

const state = reactive({
  list: [],
  sql: '',
  requestDrawer: false,
  responseDrawer: false,
  apiInfo: {} as ApiModel,
  apiGroupList: [],
  refresh: false,
  publish: true,
})

const closeDialog = () => {
  state.requestDrawer = false
  state.responseDrawer = false
}

const tabChange = (val: any) => {
  switch (val.props.name) {
    case 'third':
      state.requestDrawer = true
      break
    case 'fourth':
      state.responseDrawer = true
      break
  }
}

const checkSubmit = (isPublish: string) => {
  if (checkRunSQL()) {
    baseInfoRef.value.checkForm().then((valid: boolean) => {
      if (valid) {
        submit(isPublish)
      } else {
        apiState.activeName = 'second'
      }
    })
  }
}

const submit = (isPublish: string) => {
  let params: ApiModel = {
    apiBaseInfo: {
      ...baseInfoRef.value.getformData(),
      isPage: resquestInfoRef.value.getformData().isPage,
      isPublish,
    },
    apiSqlInfo: apiState.apiSqlInfo,
    requestParams: resquestInfoRef.value.getformData().params,
    responseParams: responseInfoRef.value.getformData().params,
  }
  console.log(params);
  

  // apiInfoSever.save(params).then((res) => {
  //   ElMessage({
  //     type: res.code == 200 ? 'success' : 'danger',
  //     message: res.message,
  //   })
  //   if (res.code === 200) {
  //     state.refresh = true
  //     state.publish = false
  //   }
  // })
}

watch(
  () => props.apiInfo,
  (newValue, oldValue) => {
    if(props.apiInfo?.apiSqlInfo){
      apiState.apiSqlInfo = cloneDeep(props.apiInfo.apiSqlInfo)
      getSchema()
      getTable()
    }else{
      apiState.apiSqlInfo = {
        sqlScript: '',
        tableName: ''
      } as ApiSqlInfoModel
    }
    
  },
  {
    deep: true,
    immediate: true
  }
)

</script>
<style lang="scss" scoped>
$margin: 20px;
$padding: 22px;
$padding10: 10px;
$leftWidth: 350px;
 .sql-create {
    border: 1px solid var(--lt-tree-border-color);
    background-color: var(--lt-tree-background-color);
    height: 100%;
    display: flex;
    flex-direction: column;
    .sql-create_button {
      display: flex;
      height: 50px;
      padding: $padding10;
      box-sizing: border-box;
    }
    .sql-create_content {
      padding: $padding10 $margin;
      box-sizing: border-box;
      height: calc(100% - 100px);
    }
    .sql-create_bottom {
      width: 100%;
      display: flex;
      height: 50px;
      padding: $padding10;
      box-sizing: border-box;
      justify-content: space-between;
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

  ::v-deep(.ͼ1.cm-focused) {
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
.btn-wrap {
  display: flex;
}

.el-table {
  width: 100%;
  flex: 1;

  ::v-deep(.cell) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.ace-editor {
  width: 100%;
  height: 100%;
}
</style>
