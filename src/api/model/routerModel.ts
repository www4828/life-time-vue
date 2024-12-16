import { BaseModel } from "./baseModel";

export class RouteModel extends BaseModel {
  menuId?:string;
  path?: string
  name?: string
  title?: string
  isLink?: string
  isHide?: string
  isKeepAlive?: string
  isAffix?: string
  isIframe?: string
  icon?: string
}
