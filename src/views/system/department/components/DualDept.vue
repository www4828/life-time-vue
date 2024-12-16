<template>
  <div class="dual-dept">
    <div class="title">
      平台层级：
    </div>
    <el-form
      :model="form"
      :inline="true"
      label-width="87px"
      size="small"
      label-suffix="："
      label-position="left"
      style="margin-top: 15px"
    >
      <el-form-item label="派遣平台" style="margin-bottom: 5px">
        <el-select v-model="form.dispatchCode">
          <el-option
            v-for="item in state.dispatchList"
            :label="item.platformName"
            :value="item.id"
            :key="item.id"
            :disabled="item.id == form.serviceCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="业务平台" style="float: right; margin-bottom: 5px">
        <el-select v-model="form.serviceCode">
          <el-option
            v-for="item in state.dispatchList"
            :label="item.platformName"
            :value="item.id"
            :key="item.id"
            :disabled="item.id == form.dispatchCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="中心名称" style="margin-bottom: 5px">
        <el-select v-model="form.centerCode">
          <el-option
            v-for="item in state.centerList"
            :label="item.name"
            :value="item.code"
            :key="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-transfer
      v-model="state.check"
      :data="state.allRelationList"
      filterable
      :titles="['可选择部门', '已存在部门']"
      :props="{ key: 'relationDeptCode', label: 'relationDeptName' }"
    >
      <!-- groupName -->
      <!-- <span
        slot-scope="{ option }"
        :style="option.groupName ? 'height: 60px;display: inline-block;' : ''"
      >
        <h6 v-if="option.groupName">{{ option.groupName }}</h6>
        {{ option.relationDeptName }}</span
      > -->
    </el-transfer>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";

const form:any = reactive({})
const state = reactive({
      dispatchList: [] as any,
      centerList: [] as any,
      chekcDe: [] as any,
      deptdeArr: [] as any,
      relationList: [] as any,
      noRelationList: [] as any,
      allRelationList: [] as any,
      check: [] as any,
      mainDept: [] as any,
      mainDeptSaveArr: [] as any,
    })
</script>

<style lang="scss">
.dual-dept {
  .el-transfer-panel__item {
    height: auto;
  }
  .el-transfer-panel__item .el-checkbox__input {
    bottom: 6px;
    top: auto;
  }
}
</style>
