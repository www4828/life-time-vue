<template>
  <div class="home-container">
    <Scrollbar v-if="!deptHomeUrl"> </Scrollbar>
    <iframe :src="deptHomeUrl" v-else class="iframe" frameborder="0"></iframe>
  </div>
</template>

<script lang="ts" setup>
import qs from 'qs'
import { ref } from 'vue'
import { useDepartment } from '@/hooks/useDepartment'
import Scrollbar from '@/components/scrollbar/index.vue'
import { UserService } from '@/api/service/System/UserService'

const userService = new UserService()
const deptHomeUrl = ref('')
const departmentInfo = useDepartment()
type Value = keyof typeof departmentInfo

const init = () => {
  let str = '',
    type = departmentInfo.homeUrl.indexOf('webroot/webbi') > -1 ? '1' : '2'
  userService.getSsoToken(type).then((ssoToken) => {
    if (!departmentInfo.homeUrl.includes(`$`)) {
      // 说明是个正常的url不需要填充逻辑
      str = departmentInfo.homeUrl
    } else {
      // 说明需要填充
      let [baseUlr, params] = departmentInfo.homeUrl.split('?')
      const dealParams = qs.parse(params)
      Object.entries(dealParams).forEach((value) => {
        const [key, val] = value as string[]
        if (val?.indexOf('$')! > -1) {
          const valueReg = /\w+/
          const currentValue = val.match(valueReg)![0] as Value
          baseUlr += `&${key}=${departmentInfo[currentValue]}`
        } else {
          baseUlr += `&${key}=${val}`
        }
      })
      str = baseUlr.replace('&', '?')
    }
    deptHomeUrl.value = str + `${str.includes('?') ? '&' : '?'}ssoToken=${ssoToken.data}${type === '1' ? '&entryType=5' : ''}`
  })
}
if(departmentInfo.homeUrl){
  init()
}
</script>
<style lang="scss">
.home-container {
  width: calc(100% - 10px);
  height: calc(100% - 10px);
  margin: 5px 10px 5px 5px;
  .iframe {
    width: 100%;
    height: 100%;
  }
}
.el-skeleton {
  float: left;
  margin: 20px 20px;
}
</style>
