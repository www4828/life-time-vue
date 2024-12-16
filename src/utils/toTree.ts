/**
 * 递归树形化处理
 * @params list:Array
 * @params parentId: string 父节点字段名
 * @params id: string 数据id字段名
 * @params rootId:string 根节点的值
 * */
export function ToTree(
  list: Array<any>,
  parentId: string,
  id: string,
  root: string
) {
  const dataToTree = (parents: Array<any>, children: Array<any>) => {
    parents.map((p: any) => {
      children.map((c, index) => {
        // 判断当前循环的子节点是否是当前循环父节点的子级
        if (c[parentId] === p[id]) {
          let newChildren = JSON.parse(JSON.stringify(children))
          newChildren.splice(index, 1)

          dataToTree([c], newChildren)
          /*
              如果是当前循环父节点的子级,那就看父节点有没有children属性,
              如果有就push到children属性的数组,
              如果没有就给父节点一个children属性并把当前循环的子级放进去
          */
          if (p.children) {
            p.children.push(c)
          } else {
            p.children = [c]
          }
        }
      })
    })
  }
  const parents: Array<any> = list.filter((item) => item[parentId] == root)
  const children: Array<any> = list.filter((item) => item[parentId] != root)

  dataToTree(parents, children)
  return parents
}
/**
 * 树形化处理
 * @params list:Array
 * @params parentId: string 父节点字段名
 * @params id: string 数据id字段名
 * @params rootId:string 根节点的值
 * */
export function tranListTotreeList(list: any,parentId:string,id:string) {
  // 映射一个map对象,遍历list ,给map赋值 键为id 值为对应对象
  const map: any = {}
  list.forEach((item: any) => {
    item.children = []
    map[item[id]] = item
  })
  // console.log('改之后');
  // map[3].name = '改后的名称'
  // console.log(map)
  // console.log(list)
  // 遍历对象 判断是否有父节点
  const treeList: any = []
  list.forEach((item: any) => {
    if (item[parentId] !== '0') {
      // 有父节点,不是根节点
      // 找到父节点, 把子节点赋值给父节点的children属性
      const parent = map[item[parentId]]
      if (parent) {
        parent.children.push(item)
      } else {
        treeList.push(item)
      }
    } else {
      // 是根节点
      treeList.push(item)
    }
  })
  return treeList
}

// 返回两数组不同元素
export const getArrDifference = (arr1: Array<any>, arr2: Array<any>) => {
  return arr1.concat(arr2).filter(function (v, i, arr) {
    return arr.indexOf(v) === arr.lastIndexOf(v)
  })
}
//返回两数组相同元素
export const getArrEqual = (arr1: Array<any>, arr2: Array<any>) => {
  let newArr = []
  for (let i = 0; i < arr2.length; i++) {
    for (let j = 0; j < arr1.length; j++) {
      if (arr1[j] === arr2[i]) {
        newArr.push(arr1[j])
      }
    }
  }
  return newArr
}
