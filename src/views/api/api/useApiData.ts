import { ApiSqlInfoModel } from '@/api/model/apiModel'
import { DataSourceModel } from '@/api/model/dataModel'
import { DataSourceService } from '@/api/service/Data/DataSourceService'
import { reactive } from 'vue'

export function useApiData() {
  const apiState = reactive({
    apiSqlInfo: {
      sqlScript: '',
      tableName: ''
    } as ApiSqlInfoModel,
    dbList: [] as DataSourceModel[],
    schemaList: [] as Array<any>,
    sqlTableList: [] as Array<any>,
  })


  const dataSourceSever = new DataSourceService()
  const getSchema = () => { 
    apiState.apiSqlInfo.dataSourceType = apiState.dbList.find(i=>apiState.apiSqlInfo.dataSourceId=== i.id)?.dataSourceType
    dataSourceSever
      .catalog(apiState.apiSqlInfo.dataSourceId)
      .then((res) => {
        apiState.schemaList = res.data
      })
  }
  const getTable = () => {
    dataSourceSever
      .table(apiState.apiSqlInfo.schemaName,apiState.apiSqlInfo.dataSourceId)
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
  getDataSource()

  return {
    apiState,
    getSchema,
    getTable
  }
}