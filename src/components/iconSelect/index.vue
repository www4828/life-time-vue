<template>
  <div class="icon-select">
    <el-select
      v-model="data.value"
      placeholder="请选择图标"
      popper-class="selectIconBox"
      @change="handleChange"
      ref="refSelect"
    >
      <el-option v-for="item in data.options" :key="item" :label="item" :value="item">
        <span class="sh3h-border">
          <svg-icon :iconName="item" class="sh3h-svg" />
        </span>
      </el-option>
    </el-select>
    <div class="svg-icon-warp">
      <svg-icon :iconName="data.value || ''" class="sh3h-svg" />
    </div>
  </div>
</template>
<script scoped lang="ts" setup>
import { reactive, unref, ref, watch } from "vue";

const refSelect = ref(null) as any;
const emits = defineEmits(["change"]);
const props = defineProps({
  list: {
    type: Array,
    default: [],
  },
  value: String,
});
const defaultProps = {
  children: "children",
  label: "label",
};
const data = reactive({
  value: props.value,
  options: [] as any,
});

const loadSvg = () => {
  const files = import.meta.globEager("@/assets/svg/*.svg");
  const modules: any = [];
  for (let key in files) {
    if (Object.prototype.hasOwnProperty.call(files, key)) {
      if (files[key].default.indexOf("svg/") === -1) {
        modules.push(files[key].default.split("assets/")[1].split(".")[0]);
      } else {
        modules.push(files[key].default.split("svg/")[1].split(".svg")[0]);
      }
    }
  }
  data.options = modules;
};
loadSvg();
const handleChange = (val: any) => {
  emits("change", val);
};
watch(props, (newValue, oldValue) => {
  data.value = newValue.value;
});
</script>
<style lang="scss" scoped>
.icon-select {
  position: relative;
}
.sh3h-svg {
  width: 25px;
  height: 25px;
  // color: #333;
  font-size: $font-size-16;
}
.svg-icon-warp {
  position: absolute;
  top: 5px;
  left: 10px;
}
::v-deep(.el-input__inner) {
  color: var(--sh3h-head-font-color) !important;
}
</style>
