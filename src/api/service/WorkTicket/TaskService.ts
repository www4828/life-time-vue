import RequestService from '@/utils/request'

export interface TaskInterface {
  getTaskId(): Promise<number>
  getTaskIdByDepartment(departMentCode: string): Promise<number>
}

export class TaskService implements TaskInterface {
  protected baseUlr: string =  'taskId'
  private request
  constructor() {
    this.request = new RequestService('taskUrl', false).service!
  }
  getTaskIdByDepartment(departMentCode: string): Promise<number> {
    return this.request.get(this.baseUlr + `/${departMentCode}`)
  }
  getTaskId(): Promise<number> {
    return this.request.get(this.baseUlr)  
  }
  getSupervisionTaskId(): Promise<number> {
    return this.request.get(this.baseUlr + '/supervision')
  }
}