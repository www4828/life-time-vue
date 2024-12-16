import { UploadModel } from '@/api/model/uploadModel'
import RequestService from '@/utils/uploadRequest'
import { Response } from '@/api/interface'
export interface UploadInterface {
  upload(formData: FormData): Promise<UploadModel[] | Response>
}
export class UploadService implements UploadInterface {
  private request;
  constructor () {
      this.request = new RequestService('mediaUrl', false).service!
  }
  upload(formData: FormData): Promise<UploadModel[] | Response> {
    return this.request.post(`/resource`, formData)
  }
}