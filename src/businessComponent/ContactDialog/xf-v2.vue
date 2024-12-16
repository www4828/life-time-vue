<template>
  <div class="concat">
    <el-form :model="form" :rules="formRules" ref="ruleFormRef">
      <el-row>
        <el-col :span="7">
          <el-form-item label="联系人：" prop="person">
            <el-input v-model="form.person" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item
            label="先联电话"
            prop="phone"
          >
            <el-input v-model="form.phone" />
          </el-form-item>
        </el-col>
        <el-col :span="1" style="display: flex; align-items: center">
          <el-link
            type="primary"
            :icon="Phone"
            style="font-size: 20px; margin-left: 15px; margin-bottom: 20px"
            @click="phone"
          />
        </el-col>
        <el-col :span="7">
          <el-form-item
            label="先联方式"
            prop="type"
          >
            <el-select v-model="form.type" placeholder="请选择">
              <el-option
                v-for="item in concatMethodsTypes"
                :label="item.codeName"
                :value="item.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="7">
          <el-form-item
            label="先联结果"
            prop="result"
          >
            <el-select
              v-model="form.result"
              placeholder="请选择"
              @change="resultChange"
            >
              <el-option
                v-for="item in contactTypes"
                :label="item.codeName"
                :value="item.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="未联系原因" prop="reason">
            <el-select v-model="form.reason" placeholder="请选择" clearable>
              <el-option
                v-for="item in contactReasonTypes"
                :label="item.codeName"
                :value="item.codeValue"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item
            label="先联时间"
            prop="time"
          >
            <el-date-picker
              v-model="form.time"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              :editable="false"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="23">
          <el-form-item
            label="先联描述"
            prop="description"
          >
            <el-input
              v-model="form.description"
              :rows="3"
              type="textarea"
              maxlength="500"
              show-word-limit
              resize="none"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
          <el-col :span="12">
            <el-form-item label="公司名称" prop="deadline" >
              <SelectCompanyConcat @changeSelect="(val:any)=>company=val" :taskId="props.taskId" />
            </el-form-item>
          </el-col>
        <el-col :span="12" class="div-flex-right">
          <el-button type="primary" @click="save">确定</el-button>
          <el-popover :visible="data.visible" placement="bottom" width="200px">
            <p>
              未“确定”保存的情况下，直接关闭会导致通话录音丢失，是否还要关闭？
            </p>
            <div style="text-align: right; margin: 0; display: flex">
              <el-button size="small" text @click="data.visible = false"
                >取消</el-button
              >
              <el-button size="small" type="primary" @click="cancel"
                >确认关闭</el-button
              >
            </div>
            <template #reference>
              <el-button type="info" @click="cancelHandle">关闭</el-button>
            </template>
          </el-popover>
        </el-col>
      </el-row>
    </el-form>

    <Title title="先联情况" />

    <el-table
      :data="data.tableData"
      style="width: 100%"
      height="100%"
      :default-sort="{ prop: 'xuhao', order: 'descending' }"
      :header-cell-style="{
        'text-align': 'center',
        background: '#f2f7ff',
      }"
      :cell-style="{ 'text-align': 'center' }"
    >
      <el-table-column
        prop="resultName"
        label="先联状态"
      />
      <el-table-column
        prop="time"
        label="先联时间"
      />

      <el-table-column prop="reasonName" label="未联系原因" />

      <el-table-column
        prop="typeName"
        label="先联方式"
      >
      </el-table-column>
      <el-table-column
        prop="description"
        label="先联描述"
      />
      <el-table-column
        prop="attachment"
        label="先联录音"
      >
        <template #default="scope">
          <el-link
            v-if="scope.row.attachment"
            type="primary"
            :icon="VideoPlay"
            :style="{ fontSize: '20px' }"
            @click="audioPlay($event, scope.row)"
            ref="audioButton"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
  <AudioPlayer ref="audioPlayer" />
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { reactive, getCurrentInstance, ref } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import Title from '@/components/Title/Title.vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Phone, VideoPlay } from '@element-plus/icons-vue'
import { Response, SearchParamsModel } from '@/api/interface'
import { ContactModel } from '@/api/model/disposeModel'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'
import { LettersVisitService } from '@/api/service/LettersVisit/LettersVisitService'
import { debounce } from 'lodash-es'
import { useDepartment } from '@/hooks/useDepartment'
import { useTransform } from '@/hooks/useTransform'
import { useCode } from '@/hooks/useCode'
import AudioPlayer from '@/components/AudioPlayer/playerPopup.vue'
import { NODE_CODE } from '@/utils'
import SelectCompanyConcat from '@/businessComponent/SelectCompany/SelectCompanyConcat.vue'

interface Props {
  dialogVisible?: boolean
  nodeCode?: string
  taskId: string
  lineForm: any
}
const props = withDefaults(defineProps<Props>(), {
  dialogVisible: false,
  nodeCode: '',
  taskId: '',
  lineForm: {},
})
const {
  departmentList,
  currentDepartmentCode,
  currentDepartmentCodeName,
  username,
  name,
} = useDepartment()
const { transformToHex } = useTransform()
const { contactReasonTypes, contactTypes, concatMethodsTypes } = useCode()
const audioPlayer = ref()
const audioButton = ref()
const form = reactive<ContactModel>({
  attachment: '',
  departmentCode: departmentList[0].departmentCode,
  description: '',
  nodeCode: props.nodeCode,
  person: name,
  phone: props.lineForm.contactPhone || props.lineForm.reportPhone,
  reason: '',
  result: '',
  taskId: props.taskId,
  time: dayjs().format('YYYY-MM-DD HH:mm'),
  type: concatMethodsTypes.value[0].codeValue,
})
const attachmentDto = reactive({
  departmentCode: departmentList[0].departmentCode,
  fileId: '',
  fileName: '先联录音',
  nodeCode: props.nodeCode,
  taskId: props.taskId,
  type: form.type,
  url: '',
})
const ruleFormRef = ref<FormInstance>()
const formRules = reactive<FormRules>({
  person: [{ required: true, message: '不能为空', trigger: 'blur' }],
  phone: [{ required: true, message: '不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '不能为空', trigger: 'change' }],
  result: [{ required: true, message: '不能为空', trigger: 'change' }],
  time: [{ required: true, message: '', trigger: 'change' }],
  description: [{ required: true, message: '不能为空', trigger: 'blur' }],
})
const data = reactive({
  tableData: [],
  visible: false,
  phone: false,
  saveFlag: false,
})
const company = ref([])
const lettersVisitService = new LettersVisitService()

const emit = defineEmits(['close', 'save'])
const { proxy } = <any>getCurrentInstance()
const phone = () => {
  data.phone = true
  proxy.mittBus.emit('phoneCallMake', {
    outPhoneNo: form.phone,
    callback: function (res: string) {
      //res 录音号
      console.log('res', res)
      getAttchMentID(res)
    },
  })
}
const getAttchMentID = async (res: string) => {
  form.attachment = (await transformToHex(res)) as string
  console.log('res', res, form.attachment)
}
const save = debounce(() => {
  if (form.attachment != '') {
    attachmentDto.fileId = form.attachment
    form.attachmentDto = attachmentDto
  }
  // console.log(attachmentDto);
  // console.log("form", form);
  ruleFormRef.value!.validate((valid) => {
    if (valid) {
      lettersVisitService.saveCompany({
        caseRelation: form,
        companies:company.value
      }).then((res: Response) => {
        if (res.code === 200) {
          data.saveFlag = true
          ElMessage.success(res.message)
          getTableData()
          form.type = concatMethodsTypes.value[0].codeValue
          form.reason = ''
          form.time = ''
          form.attachment = ''
          form.result = ''
          form.description = ''
          formRules.reason = [
            { required: false, message: '', trigger: 'change' },
          ]
          setTimeout(() => {
            ruleFormRef.value!.clearValidate()
          }, 30)

          if (form.hasOwnProperty('attachmentDto')) {
            delete form.attachmentDto
          }
          if (form.attachment !== '') {
            emit('save', {
              type: 'voice',
              url: '',
              departmentCode: currentDepartmentCode,
              departmentName: currentDepartmentCodeName,
              fileId: form.attachment,
              fileName: '先联录音',
              nodeCode: props.nodeCode,
              userName: username,
              nodeCodeName: NODE_CODE[props.nodeCode as NodeCodeKey],
            })
          }
        } else {
          ElMessage.info(res.message)
        }
      })
    }
  })
}, 500)
const cancelHandle = () => {
  if (data.phone && form.attachment && !data.saveFlag) {
    data.visible = true
  } else {
    cancel()
  }
}
const cancel = () => {
  data.visible = false
  emit('close')
}
const resultChange = () => {
  if (form.result == '0') {
    formRules.reason = [
      { required: true, message: '不能为空', trigger: 'change' },
    ]
  } else {
    formRules.reason = [{ required: false, message: '', trigger: 'change' }]
  }
}
const searchParamsModel = reactive(new SearchParamsModel<ContactModel>())
const getTableData = () => {
  searchParamsModel.pageParams.pageSize = -1
  searchParamsModel.searchParams = [
    {
      key: 'taskId',
      value: props.taskId,
      match: 'eq',
    },
  ]
  lettersVisitService.list(searchParamsModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data
      data.tableData = results
    }
  })
}
getTableData()

const audioPlay = (e: any, info: any) => {
  audioPlayer.value.handlePlayVideo(e, info)
}
</script>
<style lang="scss" scoped>
.concat {
  width: 1000px;
  height: 500px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: relative;

  .title-box {
    height: 50px;
  }

  // .concatTable {
  //   width: 100%;
  //   height: 140px;
  // }
}

.color {
  color: #000000;
}
</style>
