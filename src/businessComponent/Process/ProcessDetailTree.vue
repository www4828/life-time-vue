<template>
  <Title align="flex-start">
    <template #default>
      <span
        :class="['title_tag', isActive == 0 ? 'active' : '']"
        @click="changeTag(0)"
        >复核流程</span
      >
      <span
        :class="['title_tag', isActive == 1 ? 'active' : '']"
        @click="changeTag(1)"
        >处理流程</span
      >
      <span
        :class="['title_tag', isActive == 2 ? 'active' : '']"
        @click="changeTag(2)"
        >流程比对</span
      >
      <img
        src="@/assets/process/sortIconDown.png"
        class="sort"
        v-if="isSort"
        @click="turnOver"
        alt=""
      />
      <img
        src="@/assets/process/sortIcon.png"
        class="sort"
        v-else
        @click="turnOver"
        alt=""
      />
    </template>
    <template #content>
      <div v-if="isActive === 2">
        <div class="processTree" v-for="node in processTree" :key="node.nodeCode">
          <div class="processing">
            <el-checkbox :model-value="true" />
            <div
            :class="['dashedLine', isSort ? '' : 'dashedLineRotate']"
            ></div>
            <!-- class="dashedLine dashedLineRotate" -->
          </div>
          <div class="content-wrap">
            <div class="nodeName">{{ node.nodeName }}</div>
            <div class="content" v-for="process in node.child">
              <div class="contentWrapper">
                <div class="wrapper" @click="showDetail(process)"  :class="[process.taskId === props.taskId ? 'review' : 'ywd']" >
                  <div class="line" >操作部门: {{ process.departmentName }}</div>
                  <div class="line">操作人员: {{ process.userName }}</div>
                  <div class="line">操作时间: {{ process.time }}</div>
                </div>
                <div class="descWrapper">
                  <div class="desc">
                    <span>意见说明: {{ process.description }}</span>
                  </div>
                </div>
                <div class="files">
                  <div
                    class="pic"
                    v-if="
                      process.caseAttachmentList.filter(({ fileName }) =>
                        fileName.match(/\.(jpe?g|png|gif)/i)
                      ).length > 0
                    "
                  >
                    <span>案件图片:</span>
                    <el-image
                      style="width: 100px; height: 100px; margin-right: 10px"
                      :src="picture"
                      :zoom-rate="1.2"
                      v-for="(picture, index) in process.caseAttachmentList
                        .filter(({ fileName }) =>
                          fileName.match(/\.(jpe?g|png|gif)/i)
                        )
                        .map(({ url }) => url)"
                      :preview-src-list="
                        process.caseAttachmentList
                          .filter(({ fileName }) =>
                            fileName.match(/\.(jpe?g|png|gif)/i)
                          )
                          .map(({ url }) => url)
                      "
                      :initial-index="activeIndex"
                      @click="setIndex(index)"
                      fit="cover"
                    />
                  </div>
                  <div
                    class="pic"
                    v-if="
                      process.caseAttachmentList.filter(({ fileName }) =>
                        fileName.match(/\.(docx?|xlsx?|pptx?pdf|txt|rar|zip|7z)/i)
                      ).length > 0
                    "
                  >
                    <span>案件文件:</span>
                    <el-link
                      :href="file.url"
                      target="_blank"
                      class="margin10"
                      v-for="file in getFiles(process.caseAttachmentList)"
                      >{{ file.fileName }}</el-link
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="process" v-for="process in processList" :key="process.id">
          <div class="processing">
            <el-checkbox :model-value="true" />
            <div
              :class="['dashedLine', isSort ? '' : 'dashedLineRotate']"
            ></div>
          </div>
          <div class="content">
            <div class="contentWrapper">
              <div class="wrapper">
                <div class="status line" @click="showDetail(process)">
                  {{ process.nodeName }}
                </div>
                <div class="line">操作部门: {{ process.departmentName }}</div>
                <div class="line">操作人员: {{ process.userName }}</div>
                <div class="line">操作时间: {{ process.time }}</div>
              </div>
              <div class="descWrapper">
                <div class="desc">
                  <span>{{ process.description }}</span>
                </div>
              </div>
              <div class="files">
                <div
                  class="pic"
                  v-if="
                    process.caseAttachmentList.filter(({ fileName }) =>
                      fileName.match(/\.(jpe?g|png|gif)/i)
                    ).length > 0
                  "
                >
                  <span>案件图片:</span>
                  <el-image
                    style="width: 100px; height: 100px; margin-right: 10px"
                    :src="picture"
                    :zoom-rate="1.2"
                    v-for="(picture, index) in process.caseAttachmentList
                      .filter(({ fileName }) =>
                        fileName.match(/\.(jpe?g|png|gif)/i)
                      )
                      .map(({ url }) => url)"
                    :preview-src-list="
                      process.caseAttachmentList
                        .filter(({ fileName }) =>
                          fileName.match(/\.(jpe?g|png|gif)/i)
                        )
                        .map(({ url }) => url)
                    "
                    :initial-index="activeIndex"
                    @click="setIndex(index)"
                    fit="cover"
                  />
                </div>
                <div
                  class="pic"
                  v-if="
                    process.caseAttachmentList.filter(({ fileName }) =>
                      fileName.match(/\.(docx?|xlsx?|pptx?pdf|txt|rar|zip|7z)/i)
                    ).length > 0
                  "
                >
                  <span>案件文件:</span>
                  <el-link
                    :href="file.url"
                    target="_blank"
                    class="margin10"
                    v-for="file in getFiles(process.caseAttachmentList)"
                    >{{ file.fileName }}</el-link
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StepDetail
        :process="process"
        :dialogVisible="dialogVisible"
        @close="dialogVisible = false"
      />
    </template>
  </Title>
</template>
<script lang="ts" setup>
import { ref, watchEffect, computed } from 'vue'
import Title from '@/components/Title/Title.vue'
import { CaseRecodeService } from '@/api/service/WorkTicket/CaseRecodeService'
import {
  FileAttachmentModel,
  NodeCodeKey,
} from '@/api/model/fileAttachmentModel'
import { Response } from '@/api/interface'
import dayjs from 'dayjs'
import StepDetail from './StepDetail.vue'
import { cloneDeep } from 'lodash-es'
import { reactive } from 'vue'

const process = ref<any>({})
const dialogVisible = ref(false)
const isSort = ref(false)
const isActive = ref(0)
const caseRecodeService = new CaseRecodeService()
const props = withDefaults(
  defineProps<{ taskId: string; reviewTaskId: string }>(),
  {
    taskId: '',
    reviewTaskId: '',
  }
)
interface Process {
  nodeName: string
  time: string
  departmentName: string
  userName: string
  description: string
  caseAttachmentList: FileAttachmentModel[]
  id: string
  taskId: string
}
interface ProcessTree {
  nodeName: string
  nodeCode: string
  flag: string
  child: Process[]
}
const activeIndex = ref<number>(1)
const setIndex = (index: number) => {
  activeIndex.value = index
}
const getFiles = (fileAttachments: FileAttachmentModel[]) => {
  return fileAttachments
    .filter(({ fileName }) =>
      fileName.match(/\.(docx?|xlsx?|pptx?pdf|txt|rar|zip|7z)/i)
    )
    .map(({ url, fileName }) => {
      return {
        url,
        fileName,
      }
    })
}
const processList = ref<Process[]>([])
const processTree = ref<ProcessTree[]>([])
const list: any = reactive({})
const getProcessFlow = () => {
  caseRecodeService.find(props.taskId).then((res: Response) => {
    res.data.forEach((item: any) => {
      item.time = dayjs(item.createTime).format('YYYY-MM-DD HH:mm')
    })
    list[0] = cloneDeep(res.data)
    changeTag(0)
  })
}
const getReviewProcessFlow = () => {
  caseRecodeService.find(props.reviewTaskId).then((res: Response) => {
    res.data.forEach((item: any) => {
      item.time = dayjs(item.createTime).format('YYYY-MM-DD HH:mm')
    })
    list[1] = res.data
  })
}
const getCompareRecord = () => {
  caseRecodeService.getCompareRecord({reviewTaskId:props.taskId,taskId:props.reviewTaskId}).then((res: Response) => {
    res.data.forEach((item: any) => {
      item.child.forEach((ele:any)=>{
        ele.time = dayjs(ele.createTime).format('YYYY-MM-DD HH:mm')
      })
    })
    processTree.value = res.data
  })
}
const changeTag = (val: number) => {
  isActive.value = val
  processList.value = isSort.value ? list[val].reverse() : list[val]
}
const showDetail = (pro: any) => {
  process.value = pro
  dialogVisible.value = true
}
const turnOver = () => {
  isSort.value = !isSort.value
  processList.value = processList.value?.reverse()
  processTree.value = processTree.value?.reverse()
}
defineExpose({
  turnOver,
})
watchEffect(() => {
  if (props.taskId !== '') {
    getProcessFlow()
  }
})
watchEffect(() => {
  if (props.reviewTaskId) {
    getCompareRecord()
    getReviewProcessFlow()
  }

})
</script>

<style lang="scss" scoped>
.sort {
  width: 20px;
  margin-right: 15px;
  cursor: pointer;
}

.title_tag {
  color: var(--sh3h-label-form-color);
  margin-right: 10px;
  cursor: pointer;

  &.active {
    color: var(--sh3h-theme-color);
  }
}


.process {
  display: flex;

  .processing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: stretch;
    margin-right: 20px;

    .dashedLine {
      position: relative;
      height: calc(100% - 20px);
      border-left: 2px dashed var(--sh3h-tags-active-font-color);

      &::before {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-60%, -50%);
        content: '';
        width: 0;
        height: 0;
        border-bottom: 10px solid var(--sh3h-tags-active-font-color);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
      }
    }

    .dashedLineRotate {
      transform: rotateZ(180deg);
    }
  }

  .content {
    flex: 1;
    margin-bottom: 10px;
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-16,
      var(--el-color-info)
    );
    font-weight: bold;

    .contentWrapper {
      .wrapper {
        display: flex;
        width: 100%;
        padding: 10px;
        background-color: var(--sh3h-head-font-color);

        & > div {
          flex: 1;
        }

        .status {
          color: var(--sh3h-tags-active-font-color);
          font-size: $font-size-16;
          cursor: pointer;
        }
      }

      .descWrapper {
        padding: 10px 0;
        margin-bottom: 10px;

        .desc {
          span {
            display: inline-block;
            margin-right: 10px;
            word-break: break-all;
          }
        }
      }

      .pic {
        span {
          display: inline-block;
          margin-right: 10px;
          vertical-align: top;
        }
      }
    }
  }

  &:last-of-type {
    .dashedLine {
      border-left-width: 0;

      &::before {
        border-bottom-width: 0;
      }
    }
  }

  .margin10 {
    margin-right: 10px;
  }
}

.processTree{
  display: flex;
  .processing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: stretch;
    margin-right: 20px;

    .dashedLine {
      position: relative;
      height: calc(100% - 20px);
      border-left: 2px dashed var(--sh3h-tags-active-font-color);

      &::before {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-60%, -50%);
        content: '';
        width: 0;
        height: 0;
        border-bottom: 10px solid var(--sh3h-tags-active-font-color);
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
      }
    }

    .dashedLineRotate {
      transform: rotateZ(180deg);
    }
  }
  .nodeName{
    display: flex;
    align-items: center;
    width: 100%;
    padding: 5px;
    // background-color: var(--sh3h-head-font-color);
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-16,
      var(--sh3h-value-color)
      // var(--sh3h-tags-active-font-color)
    );
    font-weight: bold;
  }
  .leftline{
      position: absolute;
      left: 5px;
      background-color: var(--el-color-primary);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      top: 12px;
      &.ywd{
        background-color: var(--sh3h-value-color);
      }
    }
    .content-wrap{
      width: 100%;
    }
  .content {
    flex: 1;
    // margin-bottom: 10px;
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-16,
      var(--el-color-info)
      
    );
    font-weight: bold;
    padding-left: 10px;
    position: relative;
    
    .contentWrapper {
      padding: 5px 10px 0;
      margin-top: 5px;
      box-sizing: border-box;
      
      .wrapper{
        display: flex;
        width: 100%;
        background-color: var(--sh3h-head-font-color);
        padding: 5px 10px;
        cursor: pointer;
        & > div {
          flex: 1;
        }
        &.review{
          // color: var(--sh3h-tags-active-font-color);
          color: var(--el-color-primary);
          // color: var(--sh3h-value-color);
        }
      }

      .descWrapper {
        padding: 10px;
        margin-bottom: 10px;
        color: var(--sh3h-label-form-color);
        .desc {
          span {
            display: inline-block;
            margin-right: 10px;
            word-break: break-all;
          }
        }
      }

      .pic {
        span {
          display: inline-block;
          margin-right: 10px;
          vertical-align: top;
        }
      }
    }
  }
  &:last-of-type {
    .dashedLine {
      border-left-width: 0;

      &::before {
        border-bottom-width: 0;
      }
    }
  }
}
</style>
