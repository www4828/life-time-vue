import { ApiSqlInfoModel } from '@/api/model/apiModel'
import { DataSourceModel } from '@/api/model/dataModel'
import { DataSourceService } from '@/api/service/Data/DataSourceService'
import { ElMessage } from 'element-plus'
import { reactive } from 'vue'
import * as sqlFormatter from 'sql-formatter'
import { ApiInfoService } from '@/api/service/Api/ApiService'

export function useApiData() {
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
  const apiState = reactive({
    apiSqlInfo: {
      sqlScript: '',
      tableName: '',
    } as ApiSqlInfoModel,
    dbList: [] as DataSourceModel[],
    schemaList: [] as Array<any>,
    sqlTableList: [] as Array<any>,
    jsonValue: '',
    activeName: 'second',
    error: '',
    groupCode: '',
    apiGroupList: [],
  })

  const dataSourceSever = new DataSourceService()
  const apiInfoSever = new ApiInfoService()
  const getSchema = () => {
    apiState.apiSqlInfo.dataSourceType = apiState.dbList.find(
      (i) => apiState.apiSqlInfo.dataSourceId === i.id
    )?.dataSourceType
    dataSourceSever.catalog(apiState.apiSqlInfo.dataSourceId).then((res) => {
      apiState.schemaList = res.data
    })
  }
  const getTable = () => {
    dataSourceSever
      .table(apiState.apiSqlInfo.schemaName, apiState.apiSqlInfo.dataSourceId)
      .then((res) => {
        apiState.sqlTableList = res.data
      })
  }
  const getDataSource = () => {
    dataSourceSever
      .list({ pageParams: { pageIndex: 0, pageSize: -1 }, searchParams: [] })
      .then((res) => {
        apiState.dbList = res.data.results
      })
  }

  // JSON格式化
  const jsonFormat = () => {
    try {
      apiState.error = ''
      apiState.jsonValue =
        apiState.jsonValue &&
        JSON.stringify(JSON.parse(apiState.jsonValue), null, 2)
    } catch (e) {
      apiState.error = '格式化失败，请检查是否JSON格式错误'
    }
  }
  const sqlFormat = () => {
    // sql语句格式化
    apiState.apiSqlInfo.sqlScript = sqlFormatter.format(
      apiState.apiSqlInfo.sqlScript
    )
  }
  const checkSQLSentence = (item: any) => {
    // 选择动态语句
    let param = item.firstParam.replaceAll('${n}', '\n')
    apiState.apiSqlInfo.sqlScript += '\n' + param
  }
  const checkRunSQL = () => {
    if (
      !apiState.apiSqlInfo.dataSourceId ||
      !apiState.apiSqlInfo.schemaName ||
      !apiState.apiSqlInfo.tableName
    ) {
      ElMessage.warning('请选择数据源')
      return false
    }
    if (!apiState.apiSqlInfo.sqlScript) {
      ElMessage.warning('请输入SQL查询语句')
      return false
    }
    return true
  }
  const changeOperaType = (val: string) => {
    // 切换sql
    switch (val) {
      case 'select':
        apiState.apiSqlInfo.sqlScript += `\n select * from ${apiState.apiSqlInfo.tableName}`
        break
      case 'insert':
        apiState.apiSqlInfo.sqlScript += `\n insert into ${apiState.apiSqlInfo.tableName} values`
        break
      case 'update':
        apiState.apiSqlInfo.sqlScript += `\n update`
        break
      case 'delete':
        apiState.apiSqlInfo.sqlScript += `\n delete from ${apiState.apiSqlInfo.tableName} where id=#{id}`
        break
      case 'call':
        apiState.apiSqlInfo.sqlScript += `\n call`
        break
    }
  }

  const runSQL = () => {
    if (checkRunSQL()) {
      apiInfoSever
        .execute(apiState.apiSqlInfo.dataSourceId, {
          datasourceType: apiState.apiSqlInfo.dataSourceType,
          operateType: apiState.apiSqlInfo.operaType,
          params: {},
          schema: apiState.apiSqlInfo.schemaName,
          sql: apiState.apiSqlInfo.sqlScript,
        })
        .then((res) => {
          apiState.jsonValue = JSON.stringify(res)
          jsonFormat()
          apiState.activeName = 'first'
        })
    }
  }

  return {
    apiState,
    aceConfig,
    getSchema,
    getTable,
    checkSQLSentence,
    checkRunSQL,
    sqlFormat,
    runSQL,
    jsonFormat,
    changeOperaType,
    getDataSource
  }
}
