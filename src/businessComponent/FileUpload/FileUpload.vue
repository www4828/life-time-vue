<template>
  <div class="uploadBtn" @click.stop>
    <el-upload
      ref="upload"
      class="uploadButton"
      action="#"
      :before-upload="validUploadFile"
      multiple
      :limit="10"
      :accept="acceptFile('files')"
      :show-file-list="false"
      :on-exceed="handleExceed"
      :http-request="uploadFile"
    >
      <el-button type="primary" v-loading="fileLoading" :icon="Upload"
        >点击上传</el-button
      >
    </el-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { Upload } from "@element-plus/icons-vue";
import { UploadService } from "@/api/service/UploadService";
import { UploadModel } from "@/api/model/uploadModel";
import type { UploadUserFile, UploadRawFile, UploadRequestOptions } from "element-plus";
import { ElMessage } from "element-plus";

type UploadRawFile = /*unresolved*/ any
type UploadRequestOptions = /*unresolved*/ any
type UploadUserFile = /*unresolved*/ any
type AllowFileType = "video" | "audio" | "file" | "excel" | "img" | "files";
const ALLOW_HOOK = {
  video: ["mp4", "ogv", "ogg", "webm"],
  audio: ["wav", "mp3", "ogg", "acc", "webm", "amr"],
  file: ["doc", "docx", "xlsx", "xls", "pdf"],
  excel: ["xlsx", "xls"],
  img: ["jpg", "jpeg", "png", "gif"],
  files: [
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "pdf",
    "gif",
    "txt",
    "xml",
    "jpg",
    "jpeg",
    "png",
    "bmp",
    "rar",
    "zip",
    "7z",
    "mp3",
    "mp4",
    "wav",
    "amr",
    "wma",
    "m4a",
    "aac",
    "3gp",
  ],
};
const fileLoading = ref(false);
const emit = defineEmits(["uploadFile"]);
const uploadService = new UploadService();
const validUploadFile = (file: UploadRawFile) => {
  fileLoading.value = true;
  const type = "files";
  const fileName = file.name;
  const fileNameReg = fileName.match(/\.(\w+)(#|\?|$)/)!;
  const fileType = (fileNameReg && fileNameReg[1]).toString().toLowerCase();
  const validType = (ALLOW_HOOK[type] || []).includes(fileType);
  const isLt10M = file.size / 1024 / 1024 < 10;
  const isValidName = fileName.indexOf("%") == -1 && fileName.indexOf("&") == -1;
  if (!validType) {
    const supprtTypes = ALLOW_HOOK[type].join(",");
    fileLoading.value = false;
    ElMessage.error(`只支持${supprtTypes}类型文件上传`);
  }
  if (!isValidName) {
    fileLoading.value = false;
    ElMessage.error('上传文件名称不能带有字符"%","&"');
  }
  if (!isLt10M) {
    fileLoading.value = false;
    ElMessage.error("单个上传资料大小不能超过 10MB!");
  }
  return validType && isValidName && isLt10M;
};
const acceptFile = (type: AllowFileType): string => {
  if (type) {
    return ALLOW_HOOK[type].join(",");
  }
  let acceptFileStr: string = "";
  for (let t in ALLOW_HOOK) {
    acceptFileStr += ALLOW_HOOK[t as AllowFileType].join(",");
  }
  return acceptFileStr;
};
const uploadFile = (file: UploadRequestOptions) => {
  const formData = new FormData();
  formData.append("file", file.file);
  return uploadService
    .upload(formData)
    .then((res) => {
      if (Array.isArray(res)) {
        emit("uploadFile", {
          size: file.file.size,
          type: file.file.name.split(".")[1],
          ...res[0],
        } as UploadModel);
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {
      ElMessage.error("上传失败");
    })
    .finally(() => {
      fileLoading.value = false;
    });
};
const handleExceed = (files: File[], fileList: UploadUserFile[]) => {
  ElMessage({
    message: `当前限制选择 10 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
      files.length + fileList.length
    } 个文件`,
    type: "warning",
  });
};
</script>

<style lang="scss" scoped>
.uploadBtn {
  .uploadButton {
    display: flex;
  }
}
</style>
