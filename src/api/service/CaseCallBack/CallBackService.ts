import RequestService from '@/utils/request'
import { BaseInterface, Response, SearchParamsModel } from '@/api/interface'

import { CallBackModel, AllocationModel, CallBackCaseModel } from '@/api/model/callBackModel'

export interface CallBackInterface {
    list(callbackStatus: string, T: SearchParamsModel<CallBackModel>): Promise<Response>
    getOperateList(T: SearchParamsModel<CallBackModel>): Promise<Response>
    save(T: any): Promise<Response>
    cancel(T: any): Promise<Response>
    release(): Promise<Response>
    getExtractList(T: SearchParamsModel<CallBackModel>): Promise<Response>
    saveCallBackCase(T: CallBackCaseModel): Promise<Response>
}

export class CallBackService implements CallBackInterface {
    protected baseUlr: string = 'caseCallback'
    protected url: string = 'caseCallbackRecord'
    private request
    constructor() {
        this.request = new RequestService('flowUrl').service!
    }
    list(callbackStatus: string, T: SearchParamsModel<CallBackModel>): Promise<Response> {
        return this.request.post(this.baseUlr + `/getAllocation/${callbackStatus}`, T)
    }//查询分派
    getOperateList(T: SearchParamsModel<CallBackModel>): Promise<Response> {
        return this.request.post(this.baseUlr + `/getCallbackByUsercode`, T)
    }//查询安检回访列表
    save(T: any): Promise<Response> {
        return this.request.post(this.baseUlr + `/saveAllocation`, T)
    }//分派分配 抽取锁定
    cancel(T: any): Promise<Response> {
        return this.request.post(this.baseUlr + `/cancel`, T)
    }//分派撤销  
    release(): Promise<Response> {
        return this.request.post(this.baseUlr + `/release`)
    }//抽取释放
    getExtractList(T: SearchParamsModel<CallBackModel>): Promise<Response> {
        return this.request.post(this.baseUlr + `/extract`, T)
    }//查询抽取
    saveCallBackCase(T: CallBackCaseModel): Promise<Response> {
        return this.request.post(this.url, T)
    }//保存案件回访
}