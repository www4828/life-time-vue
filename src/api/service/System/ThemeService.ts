import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'
import { ThemeConfigModel, ThemeStyleModel } from '@/api/model/themeModel'

export interface ThemeInterface extends BaseInterface<ThemeConfigModel> {
}

export class ThemeService implements ThemeInterface {
  protected baseUrl: string = 'theme/config'
  private request
  constructor() {
    this.request = new RequestService('sysUrl').service!
  }
  getThemeConfig(): Promise<Response> {
    return this.request.get('theme/config')
  }
  updateThemeConfig(T: ThemeConfigModel): Promise<Response> {
    return this.request.put('theme/config', T)
  }
  getThemeStyle(): Promise<Response> {
    return this.request.get('theme/style')
  }
  updateThemeStyle(id:string, T: ThemeStyleModel): Promise<Response> {
    return this.request.put(`theme/style/${id}`, T)
  }
  list(searchParams: SearchParamsModel<ThemeConfigModel>): Promise<Response> {
    return this.request.post('theme/style/search', searchParams)
  }
  delete(id: any): Promise<Response> {
    return this.request.delete(`theme/style/${id}`)
  }
}
