
import RequestService from '@/utils/request' 
import { Session } from "@/utils/storage";
import { BaseInterface, Response, Params } from '@/api/interface' 
import { LoginModel } from '@/api/model/loginModel'

export type LoginType = 'password' | 'sms_code'
export interface LoginInterface {
  signIn(params: LoginModel, loginType: LoginType): Promise<Response> 
  getSmsCode(phone: string): Promise<Response>
} 

export class LoginService implements LoginInterface  {   
  private request;
  constructor () {
    this.request = new RequestService('sysUrl').service!
  } 
  signIn(data: LoginModel, loginType: LoginType): Promise<Response> { 
    return this.request.post(`/user/login/${loginType}`, data)
  }
  getSmsCode(phone: string): Promise<Response> {        
    return this.request.post(`/user/sendCode/${phone}`)
  }
  loginEncrypt(data: LoginModel, loginType: LoginType) {
    return this.request.post(`/user/loginEncrypt/${loginType}`, data)
  }
  setUserActiveDept(userCode: string,deptCode: string): Promise<Response> {
    return this.request.get(`/user/active-dept/${userCode}/${deptCode}`)
  }
  signOut = ()=>{ 
    return new Promise((resolve)=>{
      resolve({});
    });
  }
}