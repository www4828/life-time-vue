import { BaseModel } from '@/api/model/baseModel'

export class AIModelModel extends BaseModel {
  'modelName': string
  'modelType': string
  'apiKey': string
  'url': string
  'baseModel': string
  'embedModel': string
  'modelVersion': string
  'status': string
  'temperature': string
}
