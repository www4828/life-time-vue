import { ClassModel, ChildClassModel } from '@/api/model/classModel'
import { ClassService } from '@/api/service/WorkTicket/ClassService'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { CaseFormModel } from '@/api/model/caseModel'
import { cloneDeep } from 'lodash-es'
import { ref, watch } from 'vue'

export function useClassSelect(form: CaseFormModel) {
  const loading = ref(false)
  const contentLoading = ref(false)
  const second = ref('')
  const third = ref('')
  const isSubDone = ref(false)
  const isChildDone = ref(false)
  const isDetail = ref(false)
  const classService = new ClassService()
  const largeCategories = ref<ClassModel[]>([])
  const subClass = ref<ChildClassModel[]>([])
  const subSourceData = ref<ChildClassModel[]>([])
  const childClass = ref<ChildClassModel[]>([])
  const getAllClass = () => {
    classService.getAllClass().then((res) => {
      if (res.code === 200) {
        largeCategories.value = res.data
      }
    })
  }
  const getInfoById = (sourceData: ChildClassModel[], codeValue: number) => {
    for(let i = 0; i < sourceData.length; i++) {
      const source = sourceData[i]
      if (source.code === codeValue) {
        return source
      } else {
        if (source.childs) {
          const child:ChildClassModel = getInfoById(source.childs, codeValue)!
          if (child!) {
            return child
          }
        }
      }
    }
  }
  const getSubClass = (code: number) => {
    loading.value = true
    classService
      .getClassByCode({ parentCode: code })
      .then((res) => {
        if (res.code === 200) {
          subClass.value = res.data
          subSourceData.value = cloneDeep(res.data)
          isSubDone.value = true
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
  const getChildClass = (params: Partial<ChildClassModel>) => {
    contentLoading.value = true
    classService
      .getClassByCode(params)
      .then((res) => {
        if (res.code === 200) {
          childClass.value = res.data
          isChildDone.value = true
        }
      })
      .finally(() => {
        contentLoading.value = false
      })
  }
  const nodeClick = (tree: ChildClassModel, node: Node) => {
    if (!tree.childs) {
      third.value = ''
      form.reflectClassCode = tree.code!
      form.reflectClass = tree.name
      const { nextCode } = tree
      if (nextCode) {
        const params: Partial<ChildClassModel> = {
          parentCode: nextCode,
          typeCode: 7,
        }
        getChildClass(params)
      }
    }
  }
  const childNodeClick = (tree: ChildClassModel, node: Node) => {
    form.reflectContentCode = tree.code!
    form.reflectContent = tree.name
  }

  const codeValChange = (value: number) => {
    second.value = third.value = ''
    const { name } = largeCategories.value.find(
      (large) => large.code === value
    )!
    form.reflectIndustry = name
    getSubClass(value)
  }
  const setSubValue = () => {
    if (isSubDone.value) {
      const { id } = getInfoById(
        subSourceData.value,
        form.reflectClassCode as number
      )!
      second.value = id
    } else {
      getSubClass(form.reflectIndustryCode as number)
    }
  }
  const setChildValue = () => {
    if(isChildDone.value) {
      const { id } = getInfoById(childClass.value, form.reflectContentCode as number)!;
          third.value = id;
    } else {
      const { nextCode } = getInfoById(subSourceData.value, form.reflectClassCode as number)!;
      getChildClass({ parentCode: nextCode , typeCode: 7})
    }
    
  }
  getAllClass()
  watch(
    [() => isSubDone.value, () => isChildDone.value, () => isDetail.value],
    ([subDone, childDone, isDetail]) => {
      if(isDetail) {
        setSubValue()
        if(subDone) {
          setChildValue()
        }
      }
    }
  )
  return {
    loading,
    contentLoading,
    second,
    third,
    largeCategories,
    subClass,
    childClass,
    nodeClick,
    childNodeClick,
    codeValChange,
    isDetail
  }
}
