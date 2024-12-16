<template>
  <div class="dept-show">
    <el-row type="flex" class="row-bg" justify="space-around">
      <el-col :span="8">
        <span class="label">部门编码：</span>
        <span class="value" :title="props.formData.departmentName || '--'">{{
          props.formData.departmentName || '--'
        }}</span>
      </el-col>
      <el-col :span="8">
        <span class="label">名称：</span>
        <span class="value" :title="props.formData.departmentName || '--'">{{
          props.formData.departmentName || '--'
        }}</span>
      </el-col>
      <el-col :span="8">
        <span class="label">部门层级：</span>
        <span class="value">{{
          props.formData.departmentLevel
        }}</span>
      </el-col>
    </el-row>
    <!-- <el-row type="flex" class="row-bg" justify="space-around">
      <el-col :span="8">
        <span class="label">部门类型：</span>
        <span class="value" :title="props.formData.departmentType || '--'">{{
          props.formData.departmentType || '--'
        }}</span>
      </el-col>
      <el-col :span="8">
        <span class="label">分组：</span>
        <span class="value">
          <ShowCodeLabel
            code="030"
            :value="props.formData.group"
            :key="props.formData.code"
        />
        </span>
      </el-col>
      <el-col :span="8">
        <span class="label">部门平台：</span>
        <span class="value" :title="props.formData.departmentType || '--'">{{
          props.formData.departmentType || '--'
        }}</span>
      </el-col>
    </el-row> -->
    <el-row type="flex" class="row-bg" justify="space-around">
      <el-col :span="8">
        <span class="label">部门标签：</span>
        <span class="value" :title="props.formData.departmentTag || '--'">{{
          props.formData.departmentTag || '--'
        }}</span>
      </el-col>
      <el-col :span="8">
        <span class="label">联系电话：</span>
        <span class="value" :title="props.formData.contactNumber || '--'">{{
          props.formData.contactNumber || '--'
        }}</span>
      </el-col>
      <el-col :span="8">
        <span class="label">联系人：</span>
        <span class="value">{{ props.formData.contactPerson || '--' }}</span>
      </el-col>
    </el-row>
    <el-row type="flex" class="row-bg" justify="space-around">
      <el-col :span="8">
        <span class="label">状态：</span>
        <span class="value">{{ props.formData.status ? '正常' : '--' }}</span>
      </el-col>
      <el-col :span="8">
        <span class="label">排序：</span>
        <span class="value">{{ props.formData.sort || '--' }}</span>
      </el-col>
      <el-col :span="8"></el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { reactive , watch} from 'vue'
import { DepartmentModel } from "@/api/model/departmentModel";


const props = withDefaults(
  defineProps<{
    formData:DepartmentModel
  }>(),
  {
    formData: {} as any
  }
);
watch(
  ()=>props.formData,
  ()=>{
    console.log(props.formData);
    
  },
			{
				deep: true,
			})
</script>

<style lang="scss" scope>
.dept-show {
  background-color: #e9ecf0;
  line-height: 3;
  padding: 20px 0;
  font-size: $font-size-14;
  min-width: 600px;
  .el-col-8 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .label {
    width: 140px;
    text-align: right;
    display: inline-block;
    color: var(--sh3h-label-form-color);
  }
  .value {
    color: #414951;
  }
}
</style>
