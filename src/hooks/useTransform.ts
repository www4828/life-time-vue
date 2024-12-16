import { ref, reactive } from 'vue'
import { SearchParamsModel } from '@/api/interface'
import { SearchModel } from "@/api/model/baseModel";
import { DisposeFormModel } from '@/api/model/disposeModel'
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import { TransformToService } from "@/api/service/TransformString/TransformStringService";

export function useTransform() {
  const transformToService = new TransformToService()
  const disposeService = new DisposeService()
  const transformToHex = (str: string) => {
    return transformToService.transformTo(str).then(res => {
      if (res.code === 200) {
        return res.data
      }
    })
  }
  const getDisposeList = (taskId: string, deptCode: string): Promise<any> => {
    const searchModel = ref<SearchModel<DisposeFormModel>[]>([
      {
        key: "taskId",
        value: taskId,
        match: "eq",
      },
      {
        key: "disposeDepartmentCode",
        value: deptCode,
        match: "eq",
      },
      {
        key: "",
        value: "createTime",
        match: "orderByDesc"
      }
    ]);
    const searchParamsModel = reactive(new SearchParamsModel<DisposeFormModel>());
    searchParamsModel.searchParams = searchModel.value;
    return disposeService.getDispatchList(searchParamsModel).then(res => {
      if (res.code === 200 && res.data.results.length > 0) {
        const { tdjzTime, yqjzTime } = res.data.results[0]
        return { tdjzTime, yqjzTime }
      }
    })
  }
  return {
    transformToHex,
    getDisposeList
  }
}