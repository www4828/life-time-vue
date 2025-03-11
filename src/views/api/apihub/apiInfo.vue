<template>
  <div class="api-info-wrap">
    <div class="api-base-info api-info-box">
      基础信息
      <el-row>
        <el-col :span="4">
          <span class="label">接口编号：</span>
          <span class="value">{{ props.formData.apiBaseInfo.apiCode }}</span>
        </el-col>
        <el-col :span="4">
          <span class="label">接口名称：</span>
          <span class="value">{{ props.formData.apiBaseInfo.apiName }}</span>
        </el-col>
        <el-col :span="4">
          <span class="label">认证方式：</span>
          <span class="value">{{ props.formData.apiBaseInfo.authType }}</span>
        </el-col>
        <el-col :span="4">
          <span class="label">接口类型：</span>
          <span class="value">{{ props.formData.apiBaseInfo.apiType }}</span>
        </el-col>
        <el-col :span="4">
          <span class="label">接口版本：</span>
          <span class="value">{{
            props.formData.apiBaseInfo.versionNumber
          }}</span>
        </el-col>
        <el-col :span="2"></el-col>
        <el-col :span="2">
          <el-button type="primary" :icon="Promotion">申请</el-button>
        </el-col>
        <el-col :span="8">
          <span class="label">上线时间：</span>
          <span class="value">{{
            dayjs(props.formData.apiBaseInfo.createTime).format(
              'YYYY-MM-DD HH:mm:ss'
            )
          }}</span>
        </el-col>
        <el-col :span="8">
          <span class="label">接口地址：</span>
          <span class="value">{{
            props.formData.apiBaseInfo.apiMethod +
            ' &nbsp;&nbsp;' +
            props.formData.apiBaseInfo.apiUrl
          }}</span>
        </el-col>
        <el-col :span="6"> </el-col>
        <el-col :span="2">
          <el-button type="primary" :icon="ArrowLeftBold" @click="emits('showInfo', {})">返回</el-button>
        </el-col>
        <el-col :span="20">
          <span class="label">接口描述：</span>
          <span class="value">{{
            props.formData.apiBaseInfo.description
          }}</span>
        </el-col>
      </el-row>
    </div>
    <div class="api-use-info api-info-box">
      使用情况
      <div class="use-info-content">
        <div>
          <Title title="请求参数" />
          <el-table :data="props.formData.requestParams" header-cell-class-name="tableHeader">
            <el-table-column prop="paramName" label="参数名称" align="center" />
            <el-table-column prop="columnName" label="映射字段" align="center" />
            <el-table-column prop="paramType" label="参数类型" align="center" />
            <el-table-column prop="example" label="示例值" align="center" />
            <el-table-column prop="remark" label="备注" align="center" />
            <el-table-column prop="required" label="必填" align="center">
              <template #default="scope">
                {{ scope.row.required === '1' ? '是' : '否' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div>
          <Title title="返回结果" />
          <el-table :data="props.formData.responseParams" header-cell-class-name="tableHeader">
            <el-table-column prop="paramName" label="参数名称" align="center" />
            <el-table-column prop="columnName" label="映射字段" align="center" />
            <el-table-column prop="paramType" label="参数类型" align="center" />
            <el-table-column prop="example" label="示例值" align="center" />
            <el-table-column prop="remark" label="备注" align="center" />
            <el-table-column prop="required" label="必填" align="center">
              <template #default="scope">
                {{ scope.row.required === '1' ? '是' : '否' }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="result-example">
          <Title title="结果样例" >
            <template #content>
              <v-ace-editor 
                v-model:value="state.jsonValue" 
                @init="jsonFormat" 
                :lang="aceConfig.lang"
                :theme="aceConfig.theme" 
                :options="aceConfig.options" 
                :readonly="aceConfig.readOnly" 
                class="ace-editor" />
            </template>
          </Title>
        </div>
      </div>
    </div>
  </div>
</template>
<script scoped lang="ts" setup>
import {
  Promotion,
  ArrowLeftBold,
  Search,
  Share,
  Upload,
} from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { ApiModel } from '@/api/model/apiModel'
import dayjs from 'dayjs'
import Title from '@/components/Title/Title.vue'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-dracula'
import 'ace-builds/src-noconflict/ext-language_tools'

const emits = defineEmits(['showInfo'])
const props = defineProps({
  formData: {
    type: ApiModel,
    required: true,
  },
})
const aceConfig = reactive({
  lang: 'json', //解析json
  theme: 'dracula', //主题
  readOnly: true, //是否只读
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
  error: '',
  jsonValue: ''
})

const jsonFormat = () => {
  try {
    state.error = ''
    state.jsonValue =
    state.jsonValue &&
      JSON.stringify(JSON.parse(state.jsonValue), null, 2)
  } catch (e) {
    state.error = '格式化失败，请检查是否JSON格式错误'
  }
}
</script>
<style lang="scss" scoped>
.api-info-wrap {
  width: 100%;
  height: 100%;
  font-size: 16px;

  .api-info-box {
    width: 100%;
    background-color: var(--lt-head-font-color);
    padding: 10px;
    box-sizing: border-box;
    font-weight: 500;

    &.api-base-info {
      height: 200px;
      margin-bottom: 10px;
      font-weight: 500;

      .el-row {
        padding: 20px;
        width: 100%;
        box-sizing: border-box;
        font-weight: 400;
        font-size: 14px;

        .el-col {
          font-family: Arial, Helvetica, sans-serif;
          margin-bottom: 10px;
        }
      }

      .label {
        width: 120px;
        text-align: right;
        display: inline-block;
        margin-right: 10px;
        color: var(--el-color-info);
      }

      .value {
        width: calc(100% - 120px);
        color: var(--el-color-info);
        font-family: SourceHanSansCN-Bold;
      }
    }

    &.api-use-info {
      width: 100%;
      height: calc(100% - 210px);
      

      ::v-deep(.title) {
        font-size: 16px;
        font-weight: 500;
      }

      .use-info-content {
        width: 100%;
        padding: 0 70px;
        box-sizing: border-box;
        overflow-y: auto;
        height: calc(100% - 30px);

        >div {
          margin: 10px 0 20px;
        }
        .result-example{
          height: 300px;
        }
        .ace-editor{
          height: 100%;
        }
      }
    }
  }
}
</style>
