import { BaseModel } from "@/api/model/baseModel";
export interface Icon extends BaseModel{
  name: any;
  note: string;
  icon: string;
  taskId?: string;
  remark: string;
}

export type MarkType = 'round' | 'rect'
export type ClassName = 'blue' | 'green' | 'red'
export interface MarkIcon {
  className: ClassName;
  name: string;
  note: string;
  type: MarkType;
}

export interface WaterMarkInfo {
  icons: Icon[]
  caseMark: MarkIcon[]
}