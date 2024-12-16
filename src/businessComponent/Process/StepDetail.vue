<template>
  <el-dialog
    v-model="props.dialogVisible"
    :title="props.process?.nodeName || ''"
    width="50%"
    :modal="false"
    draggable
    custom-class="stepDetailDialog"
    @close="emit('close')"
    append-to-body
  >
    <div class="dynamiclist">
      <div
        class="xq_box fl clearfix"
        v-for="(item, index) in state.list"
        :key="index + 1"
      >
        <div class="fl qianzhui">
          <span class="ajjbxx_nr_qz" :title="item.name">{{
            item.name ? item.name + "：" : ""
          }}</span>
        </div>
        <el-tooltip
          class="item"
          effect="dark"
          :content="item.value"
          placement="top-start"
        >
          <div class="fl ajjbxx_nr_qznr">{{ item.value }}</div>
        </el-tooltip>
      </div>
      <div class="wsj" v-if="state.list.length === 0">{{ state.note }}</div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue";
import { CaseRecodeService } from "@/api/service/WorkTicket/CaseRecodeService";
import { Response } from "@/api/interface";
import { cloneDeep } from "lodash-es";
import { setMaxListeners } from "events";

const caseRecodeService = new CaseRecodeService();
const props = withDefaults(
  defineProps<{
    process: any;
    dialogVisible: boolean;
  }>(),
  {
    dialogVisible: false,
  }
);
const emit = defineEmits(["close"]);

let state: any = reactive({
  list: [] as any,
  note: "当前环节无数据",
});
const getProcessFlow = () => {
  state.list = [];
  state.note = "正在加载中...";
  // TODO: 接入接口
  caseRecodeService
    .detail({
      taskId: props.process.taskId,
      recordId: props.process.id,
      tableName: props.process.relationTable,
    })
    .then((res: Response) => {
      state.list = cloneDeep(res.data) || [];
      if (state.list.length % 2 > 0) {
        state.list.push({
          name: "",
          value: "",
        });
      }
      state.note = "当前环节无数据";
    });
};

watch(
  () => props.dialogVisible,
  (val) => {
    val && getProcessFlow();
  }
);
</script>

<style lang="scss" scoped>
.dynamiclist {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  a,
  b,
  body,
  dd,
  del,
  div,
  dl,
  dt,
  em,
  form,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  html,
  i,
  iframe,
  img,
  ins,
  label,
  legend,
  li,
  ol,
  p,
  pre,
  small,
  span,
  strong,
  u,
  ul,
  var,
  input {
    margin: 0;
    padding: 0;
  }

  article,
  aside,
  footer,
  header,
  nav,
  section {
    display: block;
  }

  ol,
  ul {
    list-style: none;
  }

  img,
  button,
  input {
    border: none;
    outline: none;
  }

  img {
    vertical-align: top;
  }

  em,
  i,
  u {
    font-style: normal;
  }

  s {
    text-decoration: none;
  }

  .fl {
    float: left;
  }

  .fr {
    float: right;
  }

  /* 清除浮动公共类 */
  .clearfix:after,
  .clearfix:before {
    content: "";
    display: table;
  }

  .clearfix:after {
    clear: both;
  }

  .clearfix {
    *zoom: 1;
  }

  .wsj {
    width: 100%;
    box-sizing: border-box;
    font-size: 20px;
    color: #c2c2c2;
    padding: 100px;
    margin: 0 auto;
    text-align: center;
  }

  .xq_box {
    width: 50%;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    box-sizing: border-box;
    // border-top: 1px solid #8ca7c8;

    .qianzhui {
      width: 90px;
    }

    .ajjbxx_nr_qz {
      font-size: $font-size-16;
      color: #8992a9;
      font-weight: bold;
      width: 120px;
      text-align: justify;
      text-align-last: justify;
      flex: 1;
      display: inline-block;
      // margin-left: 50px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ajjbxx_nr_qz_span {
      font-size: $font-size-16;
      display: inline-block;
    }

    .ajjbxx_nr_qznr {
      margin-left: 30px;
      font-size: $font-size-16;
      color: #8992a9;
      font-weight: bold;
      width: calc(100% - 160px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .xq_box:nth-child(4n) {
    background: #e9f0f9;
  }

  .xq_box:nth-child(4n-1) {
    background: #e9f0f9;
  }
}

.dynamiclist::-webkit-scrollbar {
  display: none;
  width: 0px;
}
</style>
