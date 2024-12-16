import { BaseModel } from '@/api/model/baseModel'

export class ClientModel extends BaseModel {
  "accessTokenValidity": number
  "additionalInformation": string
  "authorizedGrantTypes": string
  "autoApprove": string
  "clientId": string
  "clientSecret": string
  "refreshTokenValidity": number
  "resourceIds": string
  "scope": string
  "uris": string
  resourceList?:any
  authList? :any
}