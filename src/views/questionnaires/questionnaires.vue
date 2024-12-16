<template>
  <div class="questionnaires">
    <div class="title ">
      不满意工单检查回访
    </div>
    <div class="content-wrap" >
      <div>{{ props.info.reportPerson }}:</div>
      <p>您于{{ dayjs(props.info.dispatchTime).format("YYYY-MM-DD HH:mm") }}向12345市民服务热线反映:</p>
      <p>{{ props.info.description }}</p>
      <p>该工单登记的诉求地址为：{{ props.info.address }}。</p>
      <p>上述工单的办理结果为：{{ props.info.disposeResultName }}</p>
      <p>答复要点为：{{ props.info.disposeReplayPoint }}</p>
      <span>我们希望向您了解:</span>
    </div>
    <!-- <div class="split"></div> -->
    <div class="content-wrap">
      <div class="question"><span>* </span>{{ state.question1 }}</div>
      <el-radio-group v-model="state.answer1">
        <el-radio label="认可" border :disabled="submitFlag">认可</el-radio>
        <el-radio label="基本认可" border :disabled="submitFlag">基本认可</el-radio>
        <el-radio label="不认可" border :disabled="submitFlag">不认可</el-radio>
      </el-radio-group>
    </div>
    <div class="split"></div>
    <div class="content-wrap">
      <div class="question"><span>* </span>{{ state.question2 }}</div>
      <el-radio-group v-model="state.answer2">
        <el-radio label="对办理态度不满意" @click="submitFlag || (show=false)" border :disabled="submitFlag">对办理态度不满意</el-radio>
        <el-radio label="对办理效率不满意" @click="submitFlag || (show=false)" border :disabled="submitFlag">对办理效率不满意</el-radio>
        <el-radio label="对办理结果不满意" @click="submitFlag || (show=false)" border :disabled="submitFlag">对办理结果不满意</el-radio>
        <el-radio label="其他不满意的原因" @click="submitFlag || (show=true )" border :disabled="submitFlag">其他不满意的原因</el-radio>
      </el-radio-group>
    </div>
    <div class="content-wrap" v-if="show">
      <div class="question"><span>* </span>请输入原因</div>
      <el-input
        v-model="state.answer3"
        type="textarea"
        autosize
        placeholder="其他导致您不满意的原因"
        maxlength="200"
        show-word-limit
        :readonly="submitFlag"
      />
    </div>
    <el-button type="primary" round @click="submit" v-if="!submitFlag" >提 交</el-button>
  </div>

</template>
<script scoped lang="ts" setup>
import { useRoute } from "vue-router";
import { useDepartment } from "@/hooks/useDepartment";
import { computed, reactive, ref } from "vue";
import { QuestionnairesService } from '@/api/service/Questionnaires/QuestionnairesService'
import dayjs from "dayjs";
import { cloneDeep } from "lodash-es";
import { ElMessage } from "element-plus";
import { showSuccessToast, showFailToast, Loading  } from 'vant';
import 'vant/es/toast/style'
// import 'vant/es/overlay/style'



const questionnairesService = new QuestionnairesService()
const route = useRoute();
const props = withDefaults(
  defineProps<{
    info: any
  }>(),
  {
    info: {},
  }
)
const state = reactive({
  question1: `您对" ${ props.info.disposeFactFindingName } "的事实认定结果是否认可?`,
  question2:'您对工单办理情况不满意的最主要原因是什么?',
  question3:'其他不满意的原因',
  answer1:'',
  answer2: '',
  answer3: '',
  replyTime: '',
  replyUser: props.info.reportPerson,
  taskId: props.info.taskId,
  id: props.info.id
})
const show = ref(false)
const loading = ref(false)
const text = ref('正在提交，请稍后...')
const submitFlag:any = ref(true)

const init = () => {
  questionnairesService.postbackForm({
      pageParams: {
        pageIndex: 0,
        pageSize: -1,
      },
      searchParams: [
        {
          key: 'taskId',
          match: 'eq',
          value: props.info.taskId,
        },
        {
          key: 'id',
          match: 'eq',
          value: props.info.id,
        }
      ],
    }).then(res=>{
      if(res.code == 200 && res.data.results?.length>0){
        submitFlag.value = true
        state.answer1 =  res.data.results[0].answer1
        state.answer2 =  res.data.results[0].answer2
        show.value = state.answer2 === '其他不满意的原因' ? true : false
        state.answer3 =  res.data.results[0].answer3
      }else{
        submitFlag.value = false
      }
    })
}
init()

const submit = ()=>{
  state.replyTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  let form = cloneDeep(state)
  loading.value = true
  
  questionnairesService.postForm(form).then(res=>{
    loading.value = false
    init()
    if(res.code == 200){
      showSuccessToast(res.message || '提交成功');
    }else{
      showFailToast(res.message || '提交失败');
    }
  }).catch(()=>loading.value = false)
}
</script>
<style lang="scss" scoped>
.questionnaires {
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow-y: auto;
  box-sizing: border-box;
  padding-bottom: 100px;
  
  .title{
    width: 100%;
    padding: 80px 0;
    font-size: 100px;
    font-family: SourceHanSansCN-Bold;
    font-weight: 600;
    letter-spacing: 5px;
    box-sizing: border-box;
    text-align: center;
    color: #4C9EF8;
  }
  .split{
    width: 100%;
    height: 50px;
  }
  .content-wrap{
    background-color: white;
    font-size: 80px;
    padding: 50px;
    color: #73747B;
    letter-spacing: 3px;
    font-family:  SourceHanSansCN-Medium;
    box-sizing: border-box;
    width: 100%;
    line-height: 120px;
    .question{
      // color: var(--el-color-primary);
      color: #000;
      margin-bottom: 50px;
      font-family: SourceHanSansCN-Regular;
      font-weight: 600;
      span{
        color: var(--el-color-danger);
      }
    }
    .info{
      font-size: 60px;
      color: var(--el-color-danger);
    }
    .el-radio-group{
      margin: 20px 0;
      width: 100%;
      justify-content: center;
      // display: flex;
      // flex-direction: column;
      // align-items: flex-start;
      .el-radio{
        width: 100%;
        height: 220px;
        margin-right: 60px;
        margin-bottom: 50px;
        border-radius: 30px;
        background-color: #F7F8F7;
        // font-size: 70px;
      }

      ::v-deep(.el-radio__inner){
        width: 80px;
        height: 80px;
        margin: 0 50px;
        // background-color: #efefef;
      }
      ::v-deep(.el-radio__label){
        font-size: 80px;
      }
      ::v-deep(.el-radio-button__inner){
        font-size: 80px;
        padding: 20px;
      }
    }
    .el-textarea{
      font-size: 80px;
      margin-top: 30px;
      ::v-deep(.el-input__count){
        font-size: 80px;
        bottom: 50px;
      }
    }
    ::v-deep(.el-textarea__inner){
      min-height: 800px !important;
    }
  }
  .el-button{
    width: 90%;
    height: 180px;
    margin-top: 50px;
    font-size: 90px;
    margin-left: 5%;
  }
  ::v-deep(.el-loading-spinner ){
    .circular{
      width: 200px;
      height: 200px;
    }
    .el-loading-text{
      font-size: 100px;
    }
  }
  ::v-deep(.el-radio__input.is-disabled.is-checked .el-radio__inner){
    border-color: var(--el-color-primary);
    background: var(--el-color-primary);
  }


}

</style>
