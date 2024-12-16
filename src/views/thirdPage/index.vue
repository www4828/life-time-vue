<template>
  <iframe id="iframeId" :src="baseUrl" frameborder="0" class="myIframe" scrolling="auto"></iframe>
</template>
<script scoped lang="ts" setup>
import { useRoute } from "vue-router";
import { useDepartment } from "@/hooks/useDepartment";
import { computed, ref } from "vue";
import { cloneDeep, isEmpty } from "lodash-es";
import { loadAppConfig } from "@/utils/loadJson";
import { UserService } from '@/api/service/System/UserService'

const userService = new UserService()
const route = useRoute();
const url = computed(() => {
  const urlStr = route.query.url as string;
  if (urlStr.startsWith("$")) {
    return "";
  }
  return decodeURIComponent(urlStr);
});
let baseUrl = ref('');
const departmentInfo = useDepartment();
type Value = keyof typeof departmentInfo;

let params = null;

const init = () => {
  
  let str = url.value,
   type = str.indexOf('webroot/webbi') > -1 ? '1' : '2';
  userService.getSsoToken(type).then(ssoToken => {
    if (url.value === "") {
      // 如果是占位符url
      params = cloneDeep(route.query);
      let specialUrl = params.url as string;
      delete params.url;
      if (!isEmpty(params)) {
        Object.entries(params!).forEach((value) => {
          const [key, val] = value as string[];
          if (val?.indexOf("$")! > -1) {
            const valueReg = /\w+/;
            const currentValue = val.match(valueReg)![0] as Value;
            str += `&${key}=${departmentInfo[currentValue]}`;
          }
        });
      }
      loadAppConfig().then((res) => {
        const replacedUrl = specialUrl.replace(/\${(.*?)}/g, function (match, p1) {
          let result = res.data.thirdUrls[p1] || match;
          while (result !== match) {
            match = result;
            result = res.data.thirdUrls[p1] || match;
          }
          return result;
        });

        const hasQuery = replacedUrl.indexOf("?") > 0;
        str =
          replacedUrl +
          (hasQuery
            ? baseUrl.value
            : baseUrl.value.slice(0, 1).replace("&", "?") + baseUrl.value.slice(1));
      });

    } else {
      Object.entries(route.query).forEach((value) => {
        const [key, val] = value as string[];
        if (val?.indexOf("$")! > -1) {
          const valueReg = /\w+/;
          const currentValue = val.match(valueReg)![0] as Value;
          str += `&${key}=${departmentInfo[currentValue]}`;
        }
      });
    }
    baseUrl.value = str + `${str.includes('?') ? '&' : '?'}ssoToken=${ssoToken.data}${type === '1' ? '&entryType=5' : ''}`
  })
}
init()
</script>
<style lang="scss" scoped>
.myIframe {
  width: 100%;
  height: 100%;
  float: left;
}
</style>
