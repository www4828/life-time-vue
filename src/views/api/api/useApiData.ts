import { ApiSqlInfoModel } from "@/api/model/apiModel";
import { DataSourceModel } from "@/api/model/dataModel";
import { DataSourceService } from "@/api/service/Data/DataSourceService";
import { ElMessage } from "element-plus";
import { reactive } from "vue";
import * as sqlFormatter from "sql-formatter";
import { format } from "sql-formatter";
import { ApiInfoService } from "@/api/service/Api/ApiService";
import { useStore } from "@/store";

export function useApiData() {
  const store = useStore();
  const aceConfig = reactive({
    lang: "json", //解析json
    theme: "chrome", //主题
    readOnly: false, //是否只读
    options: {
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      tabSize: 2,
      showPrintMargin: false,
      fontSize: 14,
    },
  });
  const apiState = reactive({
    apiSqlInfo: {
      sqlScript: "",
      tableName: "",
    } as ApiSqlInfoModel,
    dbList: [] as DataSourceModel[],
    schemaList: [] as Array<any>,
    sqlTableList: [] as Array<any>,
    jsonValue: "",
    activeName: "second",
    error: "",
    groupCode: "",
    apiGroupList: [],
  });

  const dataSourceSever = new DataSourceService();
  const apiInfoSever = new ApiInfoService();
  const getSchema = (dataSourceId?: string) => {
    apiState.apiSqlInfo.schemaName = "";
    apiState.apiSqlInfo.tableName = "";
    apiState.apiSqlInfo.operaType = "";
    changeOperaType('')
    apiState.schemaList = []
    apiState.sqlTableList = []
    console.log('dataSourceId',dataSourceId);
    
    if (apiState.apiSqlInfo.dataSourceId || dataSourceId) {
      let id = apiState.apiSqlInfo.dataSourceId || dataSourceId
      apiState.apiSqlInfo.dataSourceType = apiState.dbList.find(
        (i) => id === i.id,
      )?.dataSourceType;
      dataSourceSever.catalog(id!).then((res) => {
        apiState.schemaList = res.data;
      });
    }
  };
  const getTable = (schemaName?: string, dataSourceId?: string) => {
    apiState.apiSqlInfo.tableName = "";
    apiState.apiSqlInfo.operaType = "";
    changeOperaType('')
    apiState.sqlTableList = []
    if (apiState.apiSqlInfo.schemaName || schemaName) {
      let schema = apiState.apiSqlInfo.schemaName || schemaName
      dataSourceSever
        .table(schema!, apiState.apiSqlInfo.dataSourceId || dataSourceId!)
        .then((res) => {
          apiState.sqlTableList = res.data;
        });
    }
  };
  const changeTable = ()=>{
    apiState.apiSqlInfo.operaType = ''
    changeOperaType('')
  }
  const getDataSource = () => {
    dataSourceSever
      .list({ pageParams: { pageIndex: 0, pageSize: -1 }, searchParams: [] })
      .then((res) => {
        apiState.dbList = res.data.results;
      });
  };

  // JSON格式化
  const jsonFormat = () => {
    try {
      apiState.error = "";
      apiState.jsonValue =
        apiState.jsonValue &&
        JSON.stringify(JSON.parse(apiState.jsonValue), null, 2);
    } catch (e) {
      apiState.error = "格式化失败，请检查是否JSON格式错误";
    }
  };
  const sqlFormat = () => {
    // sql语句格式化
    // apiStat?
    apiState.apiSqlInfo.sqlScript = format(apiState.apiSqlInfo.sqlScript, {
      language: "mysql",
    });
  };
  const checkSQLSentence = (item: any) => {
    // 选择动态语句
    let param = item.firstParam.replaceAll("${n}", "\n");
    apiState.apiSqlInfo.sqlScript += "\n" + param;
  };
  const checkRunSQL = () => {
    if (
      !apiState.apiSqlInfo.dataSourceId ||
      !apiState.apiSqlInfo.schemaName ||
      !apiState.apiSqlInfo.tableName
    ) {
      ElMessage.warning("请选择数据源");
      return false;
    }
    if (!apiState.apiSqlInfo.sqlScript) {
      ElMessage.warning("请输入SQL查询语句");
      return false;
    }
    return true;
  };
  const changeOperaType = (val: string) => {
    
    // 切换sql
    switch (val) {
      case "select":
        apiState.apiSqlInfo.sqlScript = `select * from ${apiState.apiSqlInfo.tableName}`;
        store.dispatch('apiInfo/setApiMethod', 'GET')
        break;
      case "insert":
        apiState.apiSqlInfo.sqlScript = `insert into ${apiState.apiSqlInfo.tableName} values`;
        store.dispatch('apiInfo/setApiMethod', 'POST')
        break;
      case "update":
        apiState.apiSqlInfo.sqlScript = `update`;
        store.dispatch('apiInfo/setApiMethod', 'PUT')
        break;
      case "delete":
        apiState.apiSqlInfo.sqlScript = `delete from ${apiState.apiSqlInfo.tableName} where id=#{id}`;
        store.dispatch('apiInfo/setApiMethod', 'DELETE')
        break;
      case "call":
        apiState.apiSqlInfo.sqlScript = `call`;
        store.dispatch('apiInfo/setApiMethod', 'GET')
        break;
      default: 
        apiState.apiSqlInfo.sqlScript = ''
        store.dispatch('apiInfo/setApiMethod', '')
    }
  };

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
          apiState.jsonValue = JSON.stringify(res);
          jsonFormat();
          apiState.activeName = "first";
        });
    }
  };

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
    getDataSource,
    changeTable
  };
}
