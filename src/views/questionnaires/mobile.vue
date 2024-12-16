<template>
  <div class="mobile-wrap">
    <div class="title">安 全 验 证</div>
    <div class="tips">您好，检测到您在12345市民服务热线登记的手机号为:</div>
    <div class="mobile">
      <PasswordInput
        :value="state.phone"
        :focused="state.show"
        @focus="state.show = true"
        :length="11"
        :mask="false"
        :error-info="state.errorInfo"
      />
    </div>
    <div class="tips">为确保您的隐私和回访表单有效，请输入手机号后四位</div>
    <el-button type="primary" round @click="submit" :disabled="state.disabled"
      >确 认</el-button
    >
    <NumberKeyboard
      v-model="state.phone"
      :show="state.show"
      @blur="state.show = false"
      :show-delete-key="state.deleteKey"
      />
  </div>
</template>
<script scoped lang="ts" setup>
import { useRoute } from 'vue-router'
import { reactive, ref, watch } from 'vue'
import { QuestionnairesService } from '@/api/service/Questionnaires/QuestionnairesService'
import { PasswordInput, NumberKeyboard } from 'vant'

import 'vant/es/number-keyboard/style'
import 'vant/es/password-input/style'

const questionnairesService = new QuestionnairesService()
const props = withDefaults(
  defineProps<{
    info: any
  }>(),
  {
    info: {},
  }
)
const emit = defineEmits(['changeComponent'])
const route = useRoute()

const state = reactive({
  phone: props.info.reportPhone,
  disabled: true,
  show: true,
  errorInfo: '',
  errorNum: props.info.errorCount,
  deleteKey: false
}) as any

const submit = () => {
  questionnairesService
    .checkMobile(String(route.query.id), state.phone.slice(7))
    .then((res) => {
      if (res.code == 200) {
        emit('changeComponent', 'Questionnaires')
        sessionStorage.setItem('checked', '1')
      }else{
        state.errorNum++
        if(state.errorNum == 5 ){
          emit('changeComponent', '')
        }else{
          state.errorInfo = '您的手机号验证不正确,请重新输入；超过5次输入错误本回访链接将会作废('+state.errorNum+'/5)'
        }
      }
    })
}
watch(()=>state.phone, (newVal) => {
  state.disabled = newVal.length < 11
  state.deleteKey = newVal.length > 7
});
</script>
<style lang="scss" scoped>
.mobile-wrap {
  width: 100%;
  // height: 100%;
  position: absolute;
  top: 20%;
  // transform: translateY(-50%);
  .title {
    font-size: 120px;
    font-family: SourceHanSansCN-Medium;
    text-align: center;
    font-weight: 600;
    margin-bottom: 100px;
    box-sizing: border-boxs;
  }
  .tips {
    color: #948e8e;
    font-family: SourceHanSansCN-Medium;
    margin: 50px;
    text-align: center;
    // font-size: 80px;
  }
}
.mobile {
  display: flex;
  align-items: center;
  ::v-deep(.el-input__inner) {
    font-size: 120px;
    height: 240px;
    margin: 0 20px;
    text-align: center;
    color: var(--el-color-primary);
    box-shadow: 0 0 0 2px var(--el-input-border-color, var(--el-border-color))
      inset;
  }
}
.el-button {
  width: 90%;
  height: 180px;
  margin-top: 50px;
  font-size: 90px;
  margin-left: 5%;
}
::v-deep(.van-key__wrapper) {
  padding: 20px;
}
::v-deep(.van-key) {
  font-size: 120px;
  height: 240px;
  border-radius: 20px;
}
::v-deep(.van-key__delete-icon) {
  width: 100px;
  height: 100px;
}
::v-deep(.van-key__collapse-icon) {
  width: 100px;
  height: 100px;
}
::v-deep(.van-password-input){
  width: 100%;
}
::v-deep(.van-password-input__security){
  height: 200px;
  li{
    font-size: 100px;
    color: var(--el-color-primary);
  }
  .van-hairline--surround:after{
    border-width: 10px;
  }
}
::v-deep(.van-hairline--surround:after){
  border-color: var(--el-border-color);
  border-width: 2px;
}
::v-deep(.van-password-input__error-info){
    font-size: 60px;
  }
</style>
