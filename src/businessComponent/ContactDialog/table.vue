<template>
  <el-table
    :data="data.tableData"
    style="width: 100%"
    :default-sort="{ prop: 'xuhao', order: 'descending' }"
    :header-cell-style="{
      'text-align': 'center',
      background: '#f2f7ff',
    }"
    :cell-style="{ 'text-align': 'center' }"
  >
    <el-table-column
      prop="resultName"
      label="状态"
      min-width="10%"
    />
    <el-table-column
      prop="time"
      show-overflow-tooltip
      min-width="25%"
      :label="
        props.formType === '联系市民' ? '联系时间' : props.formType + '时间'
      "
    />

    <el-table-column prop="reasonName" label="未联系原因" show-overflow-tooltip min-width="20%"/>

    <el-table-column
      prop="typeName"
      min-width="10%"
      label="方式"
    >
    </el-table-column>
    <el-table-column
      prop="description"
      show-overflow-tooltip
      min-width="25%"
      :label="
        props.formType === '联系市民' ? '联系描述' : props.formType + '描述'
      "
    />
    <el-table-column
      prop="attachment"
      min-width="10%"
      label="录音"
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
  <AudioPlayer ref="audioPlayer" />
</template>
<script lang="ts" setup>
import dayjs from 'dayjs'
import { reactive, getCurrentInstance, ref } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Phone, VideoPlay } from '@element-plus/icons-vue'
import { Response, SearchParamsModel } from '@/api/interface'
import { ContactModel } from '@/api/model/disposeModel'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'
import { DisposeService } from '@/api/service/Dispose/DisposeService'
import { debounce } from 'lodash-es'
import { useDepartment } from '@/hooks/useDepartment'
import { useTransform } from '@/hooks/useTransform'
import { useCode } from '@/hooks/useCode'
import AudioPlayer from '@/components/AudioPlayer/playerPopup.vue'
import { NODE_CODE } from '@/utils'

type FormType = '先联' | '甄别' | '联系市民'
interface Props {
  formType?: FormType
  taskId: string
}
const props = withDefaults(defineProps<Props>(), {
  taskId: ''
})

const { transformToHex } = useTransform()
const { contactReasonTypes, contactTypes, concatMethodsTypes } = useCode()
const audioPlayer = ref()
const audioButton = ref()

const data = reactive({
  tableData: [],
})
const disposeService = new DisposeService()

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
  disposeService.list(searchParamsModel).then((res: Response) => {
    if (res.code === 200) {
      const { results } = res.data
      data.tableData = results
      console.log('data.tableData', data.tableData)
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  // .concatTable {
  //   width: 100%;
  //   height: 140px;
  // }
}

.color {
  color: #000000;
}
</style>
