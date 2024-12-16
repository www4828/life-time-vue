<template>
  <component v-if="state.info.id" :is="currentComponents" :info="state.info" @changeComponent="changeComponent" ></component>
  <span v-if="!currentComponents" style="font-size: 16px;">本链接已失效</span>
</template>
<script scoped lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { ref, markRaw, Raw, reactive } from "vue";
import { cloneDeep, isEmpty } from "lodash-es";
import Questionnaires from "./questionnaires.vue";
import Mobile from "./mobile.vue";
import { QuestionnairesService } from '@/api/service/Questionnaires/QuestionnairesService'

const questionnairesService = new QuestionnairesService()
interface ComponentMap {
  Mobile: unknown;
  Questionnaires: unknown;
}
type ComponentKey = keyof ComponentMap;
type ComponentValue<T extends ComponentKey> = keyof ComponentMap[T];
type Attrs<T extends ComponentKey> = {
  [K in ComponentValue<T>]: ComponentMap[T][K];
};

const router = useRouter();
const route = useRoute();
const currentComponents = ref<Raw<Attrs<"Mobile" | "Questionnaires">>>(markRaw(Mobile));
const state = reactive({
  info: {} as any
}) 

const getInfo = ()=>{
  questionnairesService.getInfo(route.query.id).then(res=>{
    state.info = res.data
    if( res.data.errorCount > 5 ){
      currentComponents.value = ''
    }else{
      currentComponents.value = sessionStorage.getItem('checked') === '1' ? Questionnaires : Mobile;
    }
  })
}

const init = () => {
  questionnairesService.checkSignature(
    String(route.query.id),
    String(route.query.phone),
    String(route.query.signature)
  ).then(res=>{
    if(res.code == 200){
      sessionStorage.setItem('token',String(res.data))
      getInfo()
    }else{
      currentComponents.value = ''
    }
  })
}
init()

const changeComponent = (curr:string)=>{
  if(curr){
    currentComponents.value = curr === 'Mobile' ? Mobile : Questionnaires
  }else{
    currentComponents.value = ''
  }
}

</script>
<style lang="scss" scoped>
.mobile-wrap{
  width: 100%;
  // height: 100%;
  position: absolute;
  top: 20%;
  // transform: translateY(-50%);
  .title{
    font-size: 120px;
    font-family:  SourceHanSansCN-Medium;
    text-align: center;
    font-weight: 600;
    margin-bottom: 100px;
    box-sizing: border-boxs;
  }
  .tips{
    color: #948e8e;
    font-family:  SourceHanSansCN-Medium;
    margin: 50px;
    text-align: center;
    // font-size: 80px;
  }
}
.mobile {
  
  display: flex;
  align-items: center;
  ::v-deep(.el-input__inner){
    font-size: 120px;
    height: 240px;
    margin: 0 20px;
    text-align: center;
    color: var(--el-color-primary);
    box-shadow: 0 0 0 3px var(--el-input-border-color,var(--el-border-color)) inset;
  }
}
.el-button{
  width: 90%;
  height: 180px;
  margin-top: 50px;
  font-size: 90px;
  margin-left: 5%;
}
</style>
