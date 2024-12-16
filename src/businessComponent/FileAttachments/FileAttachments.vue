<template>
  <div class="fileAttachments">
    <Title title="附件" :is-default-show="props.isListShow">
      <FileUpload @uploadFile="uploadFile" v-show="props.isShow" />
      <template #content>
        <div class="attachments" v-show="files.attachmentsInfo.length > 0">
          <ul class="header">
            <div  class="checkbox">
              <el-checkbox
                v-if="props.isChoice && !props.isDetail "
                v-model="checked"
                :disabled="files.attachmentsInfo.length > 3"
                @change="valChange"
              />
              <div v-if="props.isDetail" class="check-isDetail" />
            </div>
            <li>附件名称</li>
            <li>文件名称</li>
            <li>附件大小</li>
            <li>环节</li>
            <li>部门</li>
            <li>操作人员</li>
            <li>上传时间</li>
            <li>操作</li>
          </ul>
          <template v-for="(info, index) in files.attachmentsInfo" :key="info.id">
            <div class="content">
              <el-checkbox
                v-if="props.isChoice && !props.isDetail"
                v-model="info.checked"
                @change="itemChange($event, index)"
                class="checkbox"
              />
              <el-icon class="checkButton" size="20px" v-if='props.isDetail && info.checked'><CircleCheckFilled /></el-icon>
              <span class="checkButton" v-if='props.isDetail && !info.checked' />
              <el-tooltip
                class="item"
                effect="dark"
                :content="info.fileShowName"
                placement="top-start"
              >
                <a class="list-text" @click="fileNameClickHandle($event, info)">
                  <el-icon class="icon">
                    <Link />
                  </el-icon>
                  {{ info.fileShowName }}
                </a>
              </el-tooltip>
              <el-tooltip class="left" :content="info.fileName" placement="top">
                <a class="list-text">{{ info.fileName }}</a>
              </el-tooltip>
              <el-tooltip class="left" :content="info.fileSize + 'KB'" placement="top">
                <a class="list-text">{{ info.fileSize + "KB" }}</a>
              </el-tooltip>
              <el-tooltip class="left" :content="info.nodeCodeName" placement="top">
                <a class="list-text">{{ info.nodeCodeName }}</a>
              </el-tooltip>
              <el-tooltip class="left" :content="info.departmentName" placement="top">
                <a class="list-text">{{ info.departmentName }}</a>
              </el-tooltip>
              <el-tooltip class="left" :content="info.userName" placement="top">
                <a class="list-text">{{ info.userName }}</a>
              </el-tooltip>
              <el-tooltip class="left" :content="getTime(info.time!)" placement="top">
                <a class="list-text">{{ getTime(info.time!) }}</a>
              </el-tooltip>
              <a class="list-text">
                <el-icon
                  @click="zoomIn(info.url)"
                  v-if="imgType.indexOf(info.type) > -1"
                  :style="{ marginRight: '10px' }"
                  title="预览"
                >
                  <ZoomIn />
                </el-icon>
                <el-icon
                  @click="handlePlayVideo($event, info)"
                  v-if="
                    audioType.indexOf(info.type) > -1 &&
                    info.fileId !== '' &&
                    info.type !== '未接通'
                  "
                  :style="{ marginRight: '10px' }"
                  ref="myRefs"
                  title="语音播放"
                >
                  <VideoPlay />
                </el-icon>
                <el-icon
                  @click="handleDownload(info)"
                  :style="{ marginRight: '10px' }"
                  title="下载"
                >
                  <Download />
                </el-icon>
                <el-icon
                  @click="handleRemove(info, index)"
                  v-if="canRemove(info)"
                  title="删除"
                >
                  <Delete />
                </el-icon>
              </a>
            </div>
          </template>
        </div>
      </template>
    </Title>
  </div>
  <el-popover
    ref="popoverRef"
    :virtual-ref="audioButtonRef"
    trigger="click"
    virtual-triggering
    @hide="hideHandle"
    width="400"
    :popper-style="{ height: '110px' }"
    :visible="state.showPopover"
  >
    <el-icon class="closeIcon" @click="state.showPopover = false">
      <Close />
    </el-icon>
    <AudioPlayer
      :audioSrc="audio.url || audio.recordName"
      v-if="audio?.url || audio?.recordName"
    />
  </el-popover>
  <el-image-viewer
    v-if="state.previewImageShow"
    :url-list="files.srcList"
    :initial-index="state.initial"
    @close="state.previewImageShow = false"
  />
</template>
<script lang="ts" setup>
import dayjs from "dayjs";
import { NODE_CODE } from "@/utils";
import { getFullPath } from "@/utils";
import { cloneDeep, last } from "lodash-es";
import { SearchModel } from "@/api/model/baseModel";
import { SearchParamsModel } from "@/api/interface";
import { UploadModel } from "@/api/model/uploadModel";
import { useDepartment } from "@/hooks/useDepartment";
import { ElMessageBox, ElMessage } from "element-plus";
import { ref, reactive, watchEffect, watch } from "vue";
import Title from "@/components/Title/TitleCollapse.vue";
import { CaseType } from "@/api/model/fileAttachmentModel";
import AudioPlayer from "@/components/AudioPlayer/player.vue";
import FileUpload from "@/businessComponent/FileUpload/FileUpload.vue";
import {
  Download,
  Delete,
  Link,
  VideoPlay,
  Close,
  ZoomIn,
  CircleCheckFilled
} from "@element-plus/icons-vue";
import { FileAttachmentModel, NodeCodeKey } from "@/api/model/fileAttachmentModel";
import { FileAttachmentService } from "@/api/service/WorkTicket/FileAttachmentService";

const props = withDefaults(
  defineProps<{
    isShow?: boolean;
    taskId?: number | string;
    nodeCode?: NodeCodeKey;
    caseType?: CaseType;
    isChoice?: boolean;
    defaultValue?: FileAttachmentModel[];
    isListShow?: boolean;
    disabled?: boolean;
    isDetail?: boolean
  }>(),
  {
    isShow: true,
    taskId: -1,
    caseType: "doc",
    isListShow: true,
  }
);
const audioType = ["wav", "mp3", "mp4", "ogg", "acc", "webm", "amr", "voice"];
const imgType = ["jpg", "jpeg", "png", "gif"];
const popoverRef = ref();
const myRefs = ref();
const audioButtonRef = ref();
const state = reactive({
  showPopover: false, // 语音弹窗
  previewImageShow: false, // 图片预览
  initial: 0, // 图片预览index
});
const searchModel = ref<SearchModel<FileAttachmentModel>[]>([
  {
    key: "taskId",
    value: "",
    match: "eq",
  },
  {
    key: "status",
    value: "1,2",
    match: "inSql",
  },
  {
    key: "fileIndex",
    value: "fileIndex",
    match: "orderByAsc",
  },
]);
const searchParamsModel = reactive(new SearchParamsModel<FileAttachmentModel>());
const { username, currentDepartmentCodeName, currentDepartmentCode } = useDepartment();
const fileAttachmentService = new FileAttachmentService();
const files = reactive<{
  attachmentsInfo: FileAttachmentModel[];
  srcList: Array<string>;
}>({
  attachmentsInfo: [],
  srcList: [],
});
const checked = ref(false);
const audio: any = ref({});
const canRemove = (fileInfo: FileAttachmentModel) => {
  return fileInfo.departmentCode === currentDepartmentCode;
};
const setSrcList = () => {
  files.srcList = files.attachmentsInfo
    .filter((file) => imgType.indexOf(file.type) > -1)
    .map((file) => file.url);
};
const getTime = (time: string) => {
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};
const exportFile = (url: string, fileName: string) => {
  let a = document.createElement("a");
  a.style.display = "none"; // 创建一个隐藏的a标签
  a.download = fileName;
  a.href = url;
  document.body.appendChild(a);
  a.click(); // 触发a标签的click事件
  document.body.removeChild(a);
};
const handleDownload = (info: any) => {
  if (info.type == "voice" && info.url == "") {
    fileAttachmentService.getVideoById(info.fileId).then((res) => {
      window.open(res.data.recordName, "_blank");
    });
  } else if (info.type === "未接通") {
  } else {
    exportFile(info.url, info.fileName);
  }
  return;
};
const saveFileInfo = (
  fileAttachment: FileAttachmentModel,
  isNeedAppend: boolean = false
) => {
  fileAttachmentService.save(fileAttachment).then((res) => {
    if (res.code === 200 && isNeedAppend) {
      ElMessage({
        message: res.message,
        type: "success",
      });
      files.attachmentsInfo.push({
        id: res.data,
        ...fileAttachment,
      });
    } else if (res.code !== 200) {
      ElMessage({
        message: res.message,
        type: "error",
      });
    }
  });
};
const uploadFile = (file: UploadModel) => {
  const path = getFullPath(file.id);
  let index = 1;
  if (files.attachmentsInfo.length > 0) {
    index =
      Number(
        last(
          files.attachmentsInfo.sort((a, b) => Number(a.fileIndex) - Number(b.fileIndex))
        )!.fileIndex
      ) + 1;
  }
  const fileAttachment: FileAttachmentModel = {
    nodeCode: props.nodeCode,
    fileName: file.name!,
    taskId: String(props.taskId),
    type: file.type!,
    url: path,
    fileId: file.id,
    fileSize: file.size!,
    departmentCode: currentDepartmentCode,
    departmentName: currentDepartmentCodeName,
    userName: username,
    time: dayjs().format("YYYY-MM-DD HH:mm"),
    nodeCodeName: NODE_CODE[props.nodeCode!],
    fileIndex: index,
    fileNewName: props.taskId === -1 ? "" : [props.taskId, index].join("_"),
    fileShowName: [props.taskId, index].filter((t) => t !== -1).join("_"),
  };
  files.attachmentsInfo.push(fileAttachment);
  setSrcList();
};
const deleteFileInfo = (id: string) => {
  fileAttachmentService.delete(id).then((res) => {
    ElMessage({
      message: res.message,
      type: res.code == 200 ? "success" : "error",
    });
    if (res.code === 200) {
      files.attachmentsInfo = files.attachmentsInfo.filter(
        (attachment) => attachment.id !== id
      );
      setSrcList();
    }
  });
};
const handleRemove = (fileInfo: FileAttachmentModel, index: number) => {
  if (fileInfo.id!) {
    ElMessageBox.confirm(`确定移除${fileInfo.fileName}?`).then(() => {
      deleteFileInfo(fileInfo.id!);
    });
  } else {
    files.attachmentsInfo = files.attachmentsInfo.filter((t, i) => i !== index);
    setSrcList();
  }
};
const getAll = () => {
  searchParamsModel.searchParams = searchModel.value;
  searchParamsModel.pageParams.pageSize = -1;
  files.attachmentsInfo = [];
  files.srcList = [];
  fileAttachmentService.list(searchParamsModel).then((res) => {
    if (res.code === 200) {
      const { results } = res.data;
      if (results.length > 0) {
        results.forEach((result: FileAttachmentModel) => {
          files.attachmentsInfo.push({
            ...result,
            id: result.id,
            nodeCode: result.nodeCode,
            taskId: result.taskId,
            type: result.type,
            fileName: result.fileName!,
            url: result.url,
            fileSize: result.fileSize || 0,
            fileId: result.fileId!,
            departmentCode: result.departmentCode,
            departmentName: result.departmentCodeName!,
            userName: result.createUser!,
            time: result.createTime!,
            status: result.status,
            nodeCodeName: NODE_CODE[result.nodeCode! as NodeCodeKey],
            fileIndex: result.fileIndex,
            fileNewName: result.fileNewName,
            fileShowName: result.fileNewName,
            checked: Boolean(result.status === 2)
          });
        });
        setSrcList();
      }
      console.log(files.attachmentsInfo);
      
      if (props.defaultValue) {
        files.attachmentsInfo = props.defaultValue;
      }
    }
  });
};
const getFiles = () => {
  const attachmentInfos = cloneDeep(files.attachmentsInfo);
  if (!props.taskId) {
    return attachmentInfos;
  } else {
    if (attachmentInfos.some(({ id }) => id)) {
      return attachmentInfos.filter(({ id }) => !id);
    }
    return attachmentInfos.filter(({ nodeCode }) => nodeCode === props.nodeCode);
  }
};
const clearFiles = () => {
  files.attachmentsInfo = [];
  files.srcList = [];
};
const refreshAttachmentInfo = () => {
  searchModel.value[0].value = String(props.taskId);
  getAll();
};
const handlePlayVideo = (e: Event, info: FileAttachmentModel) => {
  state.showPopover = false;
  audioButtonRef.value = e.target;
  state.showPopover = true;
  if (info.type == "voice" && info.url == "") {
    fileAttachmentService.getVideoById(info.fileId).then((res) => {
      audio.value = cloneDeep(res.data);
    });
  } else if (info.type === "未接通") {
  } else {
    audio.value = info;
  }
};
const hideHandle = () => {
  audio.value = {};
};
const getChoiceFiles = () => {
  const attachmentInfos = cloneDeep(files.attachmentsInfo);
  attachmentInfos.forEach((att) => {
    if (att.checked) {
      att.status = "2";
    }else{
      att.status = "1";
    }
  });
  return attachmentInfos;
};
const itemChange = (value: boolean, index: number) => {
  if (value) {
    const choiceFile = files.attachmentsInfo.filter(({ checked }) => checked);
    const totalSize = choiceFile
      .map(({ fileSize }) => fileSize)
      .reduce((prev: number, next: number) => {
        return Number(prev) + Number(next);
      }, 0);
    if (totalSize / 1024 > 10) {
      ElMessage.error("总文件大小不能超过10M！");
      files.attachmentsInfo[index].checked = false;
      return;
    }
    if (choiceFile.length > 3) {
      ElMessage.error("最多选择三个附件！");
      files.attachmentsInfo[index].checked = false;
    }
  }
};
const valChange = (value: boolean) => {
  if (value) {
    if (files.attachmentsInfo.length > 3) {
      ElMessage.error("最多选择三个附件！");
      files.attachmentsInfo.forEach((file) => {
        file.checked = false;
      });
    } else {
      files.attachmentsInfo.forEach((file) => {
        file.checked = true;
      });
    }
  } else {
    files.attachmentsInfo.forEach((file) => {
      file.checked = false;
    });
  }
};

const fileNameClickHandle = (e: Event, info: FileAttachmentModel) => {
  imgType.indexOf(info.type) > -1 && zoomIn(info.url);
  if (audioType.indexOf(info.type) > -1 && info.type !== "未接通") {
    handlePlayVideo(e, info);
  }
};
watchEffect(() => {
  if (props.taskId !== 0 && String(props.taskId) !== "-1") {
    refreshAttachmentInfo();
  }
});

watch(
  () => files.attachmentsInfo,
  (files) => {
    if (files.every((file) => file.checked)) {
      checked.value = true;
    } else {
      checked.value = false;
    }
  },
  { deep: true }
);
const zoomIn = (url: string) => {
  state.initial = files.srcList.indexOf(url);
  state.previewImageShow = true;
};
defineExpose({
  getFiles,
  saveFileInfo,
  clearFiles,
  refreshAttachmentInfo,
  getChoiceFiles,
  clearNotIDsFile() {
    files.attachmentsInfo = files.attachmentsInfo.filter(({ id }) => id);
  },
  getAllFiles() {
    return files.attachmentsInfo;
  },
  pushFile(file: FileAttachmentModel) {
    files.attachmentsInfo.push(file);
  },
});
</script>

<style lang="scss" scoped>
::v-deep(.titleWrapper) {
  width: 95%;
  align-items: center;
}

.fileAttachments {
  .header {
    display: flex;

    li {
      flex: 1;
      text-align: center;
      line-height: 1.8;
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-14,
        var(--sh3h-tips-color)
      );
    }
  }

  .content {
    display: flex;
    padding: 3px 0;
    margin-bottom: 5px;
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-14,
      var(--sh3h-attachment-color)
    );
    background-color: var(--sh3h-attachment-background-color);
    font-weight: bold;
    line-height: 2;

    .list-text {
      display: block;
      width: 20%;
      text-align: center;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      outline: 0;

      .icon {
        color: var(--sh3h-label-form-color);
        margin-right: 5px;

        svg:focus {
          outline: none !important;
        }
      }
    }
  }
  .checkbox{
    // width: 50px;
    margin-left: 15px;
  }
  .checkButton{
    width: 50px;
    height: 100%;
    margin: auto ;
  }
  .check-isDetail{
    width: 15px
  }

  .demo-image {
    display: flex;
  }

  .block {
    // width: 90px;
    // height: 90px;
    overflow: hidden;
    margin-right: 10px;
    position: relative;
  }

  .el-image {
    border: 2px solid var(--el-color-primary);
    border-radius: 3px;
  }

  .delImg {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba($color: #fff, $alpha: 0.5);
    right: 0;
    top: 0;
    transform: rotate(0deg);
    transition: 0.1s;
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    .el-icon {
      color: var(--el-color-primary);
      font-size: 20px;
    }
  }

  .none {
    display: none;
  }
}
</style>
