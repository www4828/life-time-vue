
import { LettersVisitService } from "@/api/service/LettersVisit/LettersVisitService";


export function getPrevious(taskId:string): Promise<any> {
  const lettersVisitServe = new LettersVisitService()
  return new Promise(resolve=>{
    lettersVisitServe.getRecordList({
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
      },
      searchParams: [
        {
          key: 'taskId',
          match: 'eq',
          value: taskId,
        },
        {
          key: 'createTime',
          match: 'orderByDesc',
          value: 'createTime',
        }
      ],
    }).then((res) => {
      resolve(res.data.results[0])
    });
  }) 
}

export function getAcceptCensorList(taskId:string): Promise<any> { // 获取审查结果
  const lettersVisitServe = new LettersVisitService()
  return new Promise(resolve=>{
    lettersVisitServe.getAcceptCensorList({
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
      },
      searchParams: [
        {
          key: 'taskId',
          match: 'eq',
          value: taskId,
        },
        {
          key: 'createTime',
          match: 'orderByDesc',
          value: 'createTime',
        },
        {
          key: 'status',
          match: 'eq',
          value: '1',
        }
      ],
    }).then((res) => {
      resolve(res.data.results[0])
    });
  }) 
}

export function getXfAcceptCheckList(taskId:string): Promise<any> { // 获取受理复核/审核结果
  const lettersVisitServe = new LettersVisitService()
  return new Promise(resolve=>{
    lettersVisitServe.getXfAcceptCheckList({
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
      },
      searchParams: [
        {
          key: 'taskId',
          match: 'eq',
          value: taskId,
        },
        {
          key: 'createTime',
          match: 'orderByDesc',
          value: 'createTime',
        },
        {
          key: 'status',
          match: 'eq',
          value: '1',
        }
      ],
    }).then((res) => {
      console.log('getXfAcceptCheckList',);
      if(res.data.results.length>0){
        console.log('getXfAcceptCheckList',res.data.results);
      }
      // resolve(res.data.results[0])
    });
  }) 
}