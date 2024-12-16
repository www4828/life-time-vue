import { SetMenu } from '@/utils'
import { BaseInterface } from './interface'
import { RouteModel } from './model/routerModel'

export interface RouteInteface extends BaseInterface<RouteModel> {
  getRouters(): Promise<RouteModel[]>
}

export class RouteService implements RouteInteface {
  getRouters = (): Promise<RouteModel[]> => {
    return SetMenu()
  }
}
