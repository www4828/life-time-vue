<template>
  <iframe id="iframeId" :src="src" frameborder="0" class="myIframe" scrolling="auto"></iframe>
</template>
<script scoped lang="ts" setup>
import { useRoute } from "vue-router";
import { ref } from 'vue'
import { cloneDeep } from "lodash-es";
import { UserService } from '@/api/service/System/UserService'
import { Session } from "@/utils/storage";
import { encrypt } from "@/utils";

const userService = new UserService()
const route = useRoute();
let src:any = ref('')


// const init = ()=>{
//   let query = cloneDeep(route.query),
//   baseUrl = route.query.src,
//   type = baseUrl?.indexOf('webroot/webbi')! > -1 ? '1' : '2';

//   userService.getSsoToken(type).then(res=>{
//     Object.keys(query).forEach(item=>{
//       if(item !== 'src'){
//         baseUrl = baseUrl?.indexOf('?')! > -1 ? `${baseUrl}&${item}=${query[item]}` : `${baseUrl}?${item}=${query[item]}`
//       }
//     })
//   })
// }


const init = () => {
  let { nodeReportUrl,taskReportUrl,gbReportUrl, checkUrl } = Session.get("appConfig").urls,
    url = '',
    token = sessionStorage.getItem("token"),
    taskId = route.query.taskId as string,
    index = route.query.index as string
    ;

  userService.getSsoToken(2).then((ssoToken)=>{
    if (index === '2') {
      url = nodeReportUrl + encrypt(taskId) + "&token=" + token
    } else if (index === '3') {
      url = taskReportUrl + encrypt(taskId)
    } else if (index === '4') {
      url = checkUrl + encrypt(taskId)
    }else if (index === '5') {
      url = gbReportUrl + encrypt(taskId)
    }
    src.value = url + '&ssoToken=' + ssoToken.data
  })
};
init()
</script>
<style lang="scss" scoped>
.myIframe {
  width: 100%;
  height: 100%;
  float: left;
}
</style>
