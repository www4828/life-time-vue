<template>
  <div class="buttonGroup">
    <el-dropdown
      split-button
      type="primary"
      popper-class="operation-group"
      @click="handleClick"
      @command="clickDropdown"
      class="width-120"
      placement="bottom-end"
      trigger="click"
      :popper-options="{
        modifiers: [
          {
            name: 'computeStyles',
            options: {
              roundOffsets: ({ x, y }: Coordinate) => ({
                x: Math.round(x),
                y: Math.round(y - 10),
              }),
            },
          },
        ],
      }"
      v-if="props.list.length > 1"
    >
      {{ props.list[0]?.name }}
      <template #dropdown v-if="props.list.length > 1">
        <el-dropdown-menu class="sh3h-dropdown-menu">
          <template
            v-for="item in props.list.filter((e, idx) => idx > 0)"
            :key="item.name"
          >
            <el-dropdown-item
              :command="item.name"
              v-if="item.id! !== String(props.row.status)"
            >
              {{ item.name }}
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div class="oneButton" @click="handleClick" v-else>{{ props.list[0]?.name }}</div>
  </div>
</template>
<script lang="ts" setup>
import { CaseInfoModel, ButtonInfoModel } from "@/api/model/dispatchModel";
interface Props {
  list: Array<ButtonInfoModel>;
  row: CaseInfoModel;
}
interface Coordinate {
  x: number;
  y: number;
}
const props = defineProps<Props>();
const emit = defineEmits(["dropdownClick", "commandClick"]);
const handleClick = () => {
  emit("dropdownClick", props.row);
};
const clickDropdown = (command: string) => {
  emit("commandClick", command, props.row);
};

</script>
<style lang="scss" scoped>
.buttonGroup {
  width: 100%;
  height: 100%;
  ::v-deep(.el-button) {
    width: 90px;
  }
}

.sh3h-dropdown-menu {
  width: 120px;
  background-color: var(--el-color-primary);
  color: var(--lt-head-font-color);
  border-bottom: 1px solid #fff;
}

::v-deep(.el-dropdown-menu__item) {
  box-sizing: border-box;
  list-style: none;
  line-height: 20px;
  justify-content: center;
  margin: 0;
  font-size: $font-size-14;
  color: var(--lt-ad-font-color);
  cursor: pointer;
  outline: 0;
}

::v-deep(.el-popper__arrow) {
  display: none;
}

::v-deep(.el-dropdown) {
  display: inline-block;
  position: relative;
  width: 118px !important;
}

::v-deep(.el-button--mini) {
  width: 90px !important;
}

::v-deep(.el-dropdown__caret-button) {
  width: 30px !important;
}

.width-120 {
  width: 120px !important;
}
.oneButton {
  width: 120px;
  height: 30px;
  line-height: 30px;
  font-size: $font-size-14;
  color: var(--lt-ad-font-color);
  background-color: var(--el-color-primary);
  text-align: center;
  cursor: pointer;
}
</style>
