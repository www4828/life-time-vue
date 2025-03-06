import { BaseModel } from '@/api/model/baseModel'

export class ApiBaseInfoModel extends BaseModel {
  'apiCode': string
  'apiMethod': string
  'apiName': string
  'apiType': string
  'apiUrl': string
  'authType': string
  'createUserName': string
  'dataType': string
  'description': string
  'groupCode': string
  'groupName': string
  'isPage': string
  'isPublish': string
  'modifierUser': string
  'modifierUserName': string
  'permissionLevel': string
  'remark': string
  'versionNumber': string
}
export class ApiSqlInfoModel extends BaseModel {
  'dataSourceId': string
  'operaType': string
  'remark': string
  'schemaName': string
  'sqlScript': string
  'tableName': string
  'dataSourceType'?: any
}
export class RequestInfoModel extends BaseModel {
  'apiCode': string
  'columnName': string
  'createUserName': string
  'dataType': string
  'defaultValue': string
  'example': string
  'paramModel': string
  'paramName': string
  'paramType': string
  'privacy': string
  'remark': string
  'required': string
}
export class ApiModel {
  'apiBaseInfo': ApiBaseInfoModel
  'apiSqlInfo': ApiSqlInfoModel
  'requestParams': RequestInfoModel[]
  'responseParams': RequestInfoModel[]
}
export class ApiGroupModel extends BaseModel  {
  'groupCode': string
  'groupName': string
  'parentCode': string
  'remark': string
}
export class AppModel extends BaseModel  {
  'apiCodes': string
  'appCode': string
  'appDes': string
  'appId': string
  'appKey': string
  'appName': string
  'appSecret': string
  'ips': string
  'strategy': string
}

