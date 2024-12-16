
import { TransformToService } from "@/api/service/TransformString/TransformStringService";
import { useCode } from '@/hooks/useCode'

export function getLimitTime(time:string, code:string): Promise<string> {
  const transformToService = new TransformToService()
  return new Promise(resolve=>{
    transformToService.getLimitTime(Number(time), code).then((res) => {
      resolve(res.data)
    });
  }) 
}
export function getDalayLimit(code:string,time:string) {
  const transformToService = new TransformToService()
  const { applyDaysTypes } = useCode();

  let { firstParam, secondParam }  = applyDaysTypes.value.find(item=>item.codeValue == code)!
  return new Promise(resolve=>{
    transformToService.getDeadlineWithTime(Number(firstParam), secondParam, time).then((res) => {
      resolve(res.data)
    });
  }) 
}
export function getDealLineFn(taskId:string,time:string, code:string): Promise<string> {
  const transformToService = new TransformToService()
  return new Promise(resolve=>{
    transformToService.getDeadline(taskId, time, code).then((res) => {
      resolve(res.data)
    });
  }) 
}