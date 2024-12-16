import RequestService from '@/utils/request'
import { FileAttachmentModel } from '@/api/model/fileAttachmentModel'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'

export interface FileAttachmentInterface extends  BaseInterface<FileAttachmentModel>{
  
}
export class FileAttachmentService implements FileAttachmentInterface {
  protected baseUlr: string =  'caseAttachment'
  private request;
  private request2;
  constructor () {
      this.request = new RequestService('flowUrl').service!
      this.request2 = new RequestService('phoneUrl').service!
  }
  save(T: FileAttachmentModel): Promise<Response<string>> {
    return this.request.post(this.baseUlr, T);
  }
  update(T: FileAttachmentModel): Promise<Response<FileAttachmentModel>> {
    return this.request.put(this.baseUlr + '/' + T.id, T);
  }
  delete(id: string): Promise<Response> {
    return this.request.delete(this.baseUlr + '/' + id);
  }
  list(searchParams: SearchParamsModel<FileAttachmentModel>): Promise<Response> {
    return this.request.post(this.baseUlr + '/searchList', searchParams) 
  }
  find(id: string): Promise<Response<FileAttachmentModel>> {
    return this.request.get(this.baseUlr + '/' + id); 
  }
  getVideoById(id: string): Promise<Response> {
    return this.request2.get('record/' + id); 
  }
}