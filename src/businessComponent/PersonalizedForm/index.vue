<template>
  <el-dialog v-model="dialogVisible" title="个性化表单" width="70%" :modal="false" :close-on-click-modal="false">
    <component :is="currentComponents" :formData="formData" ref="formComponent" :disabled="disabled" />
    <template #footer>
      <span class="dialog-footer">
        <!-- <el-popconfirm title="是否确定保存?" hide-icon @confirm="save">
          <template #reference>
          </template>
        </el-popconfirm> -->
        <el-button type="primary" v-if="!disabled" @click="save"> 保存 </el-button>
        <el-button @click="cancel" v-if="!disabled" >关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { markRaw, getCurrentInstance, ref, watch } from 'vue'
import { DisposeService } from "@/api/service/Dispose/DisposeService";
import engineering from '@/businessComponent/PersonalizedForm/form/engineering.vue'
import houseQuality from '@/businessComponent/PersonalizedForm/form/houseQuality.vue'
import protectRight from '@/businessComponent/PersonalizedForm/form/protectRight.vue'
import { cloneDeep } from 'lodash-es';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Session } from '@/utils/storage';

const emit = defineEmits(['showForm','changeSubmitFormFlag'])
const props = withDefaults(defineProps<{
  reflectCode: string
  departmentCode?: string
  taskId?: string
  disabled?: boolean
}>(), {
  departmentCode: '',
  reflectCode: '',
  disabled: false
});

const formComponent = ref()
const disposeService = new DisposeService()
const componentList: any = {
  engineering: markRaw(engineering),
  houseQuality: markRaw(houseQuality),
  protectRight: markRaw(protectRight)
}
const currentComponents = ref()
const dialogVisible = ref(false)
const formData: any = ref({})
const reset: any = ref(true)

const getFromConfig = () => {
  disposeService.getFromConfig(
    // props.departmentCode || departmentList[0].departmentCode, 
    '78',
    props.reflectCode
  ).then(res => {
      if (res.code == 200 && res.data) {
        let com = res.data.indexOf(',') > -1 ? res.data.split(',')[0] : res.data
        currentComponents.value = componentList[com]
        emit('showForm', true)
        props.taskId && getFromInfo()
      } else {
        emit('showForm', false)
      }
    })
}
const init = () => {
  let flag = props.reflectCode && props.reflectCode != ',' &&
    props.reflectCode.indexOf('undefined') == -1 &&
    props.reflectCode.indexOf('null') == -1
  flag && getFromConfig()
}
const setDialogVisible = (flag: boolean) => {
  flag && init()
  dialogVisible.value = flag
}

const getFromInfo = () => {
  disposeService.getFromInfo({
    pageParams: { pageIndex: 0, pageSize: -1 },
    searchParams: [{
      key: 'taskId',
      value: props.taskId,
      match: 'eq'
    },
    {
      key: 'createTime',
      match: 'orderByDesc',
      value: 'createTime',
    }]
  }).then(res => {
    formData.value = res.data?.results![0]
    formData.value?.bjbh && emit('changeSubmitFormFlag', true )
  })
}
const { proxy } = <any>getCurrentInstance();
proxy.mittBus.on('submitForm', (taskid: string) => {
  if (taskid) {
    formData.value.taskId = taskid
    formData.value?.bjbh && disposeService.saveForm(formData.value).then(res => {
      formComponent.value.resetFields()
      if (res.code != 200) {
        ElMessage.error(res.message)
      }
    }).catch(err => {
      formComponent.value.resetFields()
      ElMessage.error(err)
    })
  } else {
    ElMessage.warning('没有获取到工单编号(taskId)')
  }
})

const cancel = () => {
  if (!props.taskId && reset.value) {
    formData.value = {}
    formComponent.value.resetFields()
  }
  dialogVisible.value = false
}
const submit = () => {
  formData.value = cloneDeep(formComponent.value.form)
  dialogVisible.value = false
  if (props.taskId) {
    formData.value.taskId = props.taskId
    if(formData.value.id){
      disposeService.updateForm(formData.value, formData.value.id).then(res => {
        ElMessage({
          type: res.code == 200 ? 'success' : 'error',
          message: res.message
        })
        emit('changeSubmitFormFlag', res.code == 200 ? true : false )
      }).catch(err => {
        ElMessage.error(err)
        emit('changeSubmitFormFlag', false )
      })
    }else{
      formData.value?.bjbh && disposeService.saveForm(formData.value).then(res => {
        ElMessage({
          type: res.code == 200 ? 'success' : 'error',
          message: res.message
        })
        emit('changeSubmitFormFlag', res.code == 200 ? true : false )
      }).catch(err => {
        ElMessage.error(err)
        emit('changeSubmitFormFlag', false )
      })
    }
  }else{
    reset.value = false
  }
}
const save = ()=>{
  formComponent.value.submitForm().then((res:boolean)=>{
    res && submit()
  })
}
watch(() => props.reflectCode, (val) => {
  val && init()
})

defineExpose({
  setDialogVisible
});
</script>
<style lang="scss" scoped>
.PersonalizedForm {
  .footer-button {
    display: flex;
    justify-content: end;
  }
}

.el-form {
  // width: 100%;
  display: flex;
  flex-wrap: wrap;

  >.el-form-item {
    width: 33%;

    .el-select {
      width: 100%;
    }

    .el-form-item__label {
      width: 120px;
    }
  }

}
</style>
