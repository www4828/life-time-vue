import RequestService from '@/utils/request'
import { Response } from '@/api/interface'

interface TaskIconInterface {
  getTaskIcon(taskId: string): Promise<Response>
}

export class TaskIconService implements TaskIconInterface {
  protected baseUlr: string = 'task-icon'
  private request
  constructor() {
    this.request = new RequestService('flowUrl').service!
  }
  getTaskIcon(taskId: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/${taskId}`)
  }
  getTaskIconXF(taskId: string): Promise<Response> {
    return this.request.get(this.baseUlr + `/xf/${taskId}`)
  }
  getTaskIconAll(T: Array<string>): Promise<Response> {
    return this.request.post(this.baseUlr + `/searchAll`,T)
  }
}
