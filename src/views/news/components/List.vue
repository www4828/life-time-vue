<template>
  <Title :title="props.title">
    <div class="titleRight">
      <div class="more" @click="moreClick">更多</div>
      <div class="reportTitle" v-if="props.title == '工作简报'">
        <span :class="state.checkType == '日报' ? 'weightClick' : 'reportClick'" @click="reportType('日报')">日报</span>
        <span>/</span>
        <span :class="state.checkType == '周报' ? 'weightClick' : 'reportClick'" @click="reportType('周报')">周报</span>
        <span>/</span>
        <span :class="state.checkType == '通报' ? 'weightClick' : 'reportClick'" @click="reportType('通报')">通报</span>
        <span>/</span>
        <span :class="state.checkType == '专报' ? 'weightClick' : 'reportClick'" @click="reportType('专报')">专报</span>
      </div>
    </div>
    <template #content>
      <div class="lists">
        <Scrollbar class="caseWrapper">
          <div class="listBox">
            <div class="listInfo" v-for="value in props.lists">
              <div class="item" @click="downloadFile(value.ID)">{{ value.NAME }}</div>
              <div>{{ value.NOTICE_TIME }}</div>
            </div>

          </div>
        </Scrollbar>

        <div class="listIcon">
          <div class="top"></div>
          <div class="center"></div>
          <div class="bottom"></div>

        </div>
      </div>
    </template>
  </Title>
  <MoreDialog v-if="state.dialogHidden" :dialogVisible="state.dialogHidden" :title="props.title"
    :addTitle="state.addTitle" @close="closeDialog" :typeHidden="props.typeHidden">
  </MoreDialog>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import Scrollbar from "@/components/scrollbar/index.vue";
import Title from "@/components/Title/Title.vue";
import MoreDialog from './MoreDialog.vue';
import { FileAttachmentService } from "@/api/service/WorkTicket/FileAttachmentService";
import { ElMessage } from "element-plus";

const fileAttachmentService = new FileAttachmentService();
const props = defineProps<{
  title: string;
  lists: any
  typeHidden?: boolean
}>();


const state = reactive({
  dialogHidden: false,
  dialogTitle: "",
  addTitle: "",
  checkType: "",
})
const emit = defineEmits(['report','downloadFile'])
const moreClick = () => {
  // emit('more', props.title)
  let isLogin = sessionStorage.getItem('token')
  if(isLogin){
    state.dialogHidden = true
    // state.dialogTitle = type
    if (props.title == "工作提示") {
      state.addTitle = "提示标题"
    } else if (props.title == "工作简报") {
      state.addTitle = "简报标题"
    } else if (props.title == "相关文件") {
      state.addTitle = "文件标题"
    }
  }else{
    ElMessage.warning('请登录后查看更多')
  }
}
const closeDialog = () => {
  state.dialogHidden = false
}
const reportType = (type: string) => {
  emit('report', type)
  state.checkType = type
}
const downloadFile = (id: string) => {
  let isLogin = sessionStorage.getItem('token')
  if (isLogin) {
    emit('downloadFile',String(id))
  } else {
    ElMessage.warning('请登录后查看')
  }
}
</script>
<style lang="scss" scoped>
.reportTitle {
  color: #2c569e;
  line-height: 30px;
  float: right;
  font-size: $font-size-18;
  margin-right: 25px;
  display: flex;
  justify-content: space-evenly;
  width: 202px;
  font-weight: 500;

}

.more {
  background: url("@/assets/layout/more.png") no-repeat right center;
  padding-right: 22px;
  margin-right: 25px;
  font-size: $font-size-18;
  color: #2c569e;
  line-height: 30px;
  float: right;
  font-weight: 500;
}

.reportClick {
  cursor: pointer;
}

.weightClick {
  cursor: pointer;
  font-weight: bolder;
}

.lists {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 30px 40px 40px 36px;
  box-sizing: border-box;
  background-color: #ffffff;


  .caseWrapper {
    height: 100%;
    width: calc(100% - 6px);


    .listBox {
      // height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding-right: 48px;

      .listInfo {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 20px;
        line-height: 40px;
        height: 40px;
        background: url("@/assets/layout/diamond.png") no-repeat left center;

        .item {
          margin-left: 26px;
          cursor: pointer;
        }
      }


    }
  }



  .listIcon {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .top {
      width: 5px;
      height: 5px;
      background-color: #1176dd;

    }

    .center {
      height: calc(100% - 10px);
      width: 2px;
      background-color: #255ba5;
      opacity: 0.302;
      border: 1px solid #1176dd;
      margin: 9px 0px;
    }

    .bottom {
      width: 5px;
      height: 5px;
      background-color: #1176dd;
    }
  }
}</style>