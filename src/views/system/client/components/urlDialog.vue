<template>
  <el-dialog v-model="data.dialogUrlVisible" title="服务器回调地址" width="30%" @close="$emit('closeUrlDialog')" destroy-on-close>
    <el-table :data="props.formData" border style="width: 100%">
      <el-table-column prop="text" >
        <template #default="scope">
           <el-input size="small" v-model="scope.row.text" v-show="scope.row.show" placeholder="请输入内容"></el-input>
            <span v-show="!scope.row.show">{{scope.row.text}}</span>
       </template>
      </el-table-column>
      <el-table-column align="center" width="100px">
        <template #default="scope">
          <div class="icon-box">
            <el-link type="warning" :icon="Edit" class="edit-icon" @click="updateUrl(scope.row)" />
            <el-popconfirm title="确定是否删除" @confirm="deleteUrl(scope)" >
              <template #reference>
                <el-link type="danger" :icon="Delete" ></el-link>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-button class="mt-4" style="width: 100%" @click="onAddItem">添加</el-button>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('closeUrlDialog')">取消</el-button>
        <el-button type="primary" @click="createData">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue"
import { Edit, Delete } from '@element-plus/icons-vue'
const emits = defineEmits(['closeUrlDialog', 'saveUrl']);
const props = defineProps({
  showFlag: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Array,
    default: [{ text: '' }]
  },
  dialogStatus: {
    type: String
  }
})
const data = reactive({
  dialogUrlVisible: false,
  list: []
})
const onAddItem = () => {
  props.formData.push({
    text: '',
    show: true
  })
}
const updateUrl = (row: any)=>{
   props.formData.forEach((item: any)=>{
    if(item.text === row.text) item.show = !item.show
   })
}
const deleteUrl = (scope: any)=>{
   props.formData.splice(scope.$index,1)
}
const createData = () => {
  data.dialogUrlVisible = false
  emits('saveUrl', props.formData)
}
watch(props, (newValue, oldValue) => {
  data.dialogUrlVisible = newValue.showFlag
})
</script>
<style lang="scss">
.el-dialog__body {
  padding: 20px;

  .urlform {
    .el-form-item {
      width: 70%;
    }
  }

  .el-table {
    margin-bottom: 20px;

    // border: 1px solid #efefef;
    // width: 70%;
    .el-table__header-wrapper {
      height: 0;
    }

    .icon-box {
      .edit-icon {
        margin-right: 10px;
      }
    }
  }
}
</style>