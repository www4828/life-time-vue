import { Session } from '@/utils/storage'
import { ElMessage } from 'element-plus'

export const hasPer = (value:any)=>{
  let {permissions} = Session.get('userInfo')
  let flag =  permissions.some((item:any)=> item.permissionId === value)
  return flag
}
/**
 * 点击按钮权限全局函数
 * @params methods:点击后需要执行的函数
 * @params param: {
 *  id: 按钮id，
 *  row: 其他信息
 * }
 * */
export function onPerClick (methods:any, param:any) {
  let {permissions} = Session.get('userInfo')
  let flag =  permissions.some((item:any)=> item.permissionId === param.id)
  if(flag){
    methods(param.row)
  }else{
    ElMessage.warning('没有权限访问')
  }
}
// export const hasRole = {  
//   install: (app:any) => {    
//     app.directive('hasRole', {     
//        mounted(el:any, binding:any) {        
//         let {permissions} = Session.get('userInfo')
//         let flag =  permissions.some((item:any)=> item.permissionId === binding.value)    
//         if(flag){
//           el.disabled = false;
//         }else{
//           el.disabled = true;
//         }
//         el.addEventListener('click',()=>{
//           console.log(el.disabled)
//           if(el.disabled){
//             ElMessage.warning('没有权限访问')
//           }
//         })
//       },    
//     })  
//   },
// }
