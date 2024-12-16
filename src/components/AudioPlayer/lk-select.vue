<template>
  <div class="lk-select">
    <div ref="reference" @click="showPopper" >
      <slot name="reference"/>
    </div>
    <div ref="Popper" class="Popper" v-show="visible">
      <slot/>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, nextTick ,onUnmounted} from 'vue'

const emits = defineEmits(['update:visible'])
const props = defineProps({
  visible: [Boolean, String]
})
const reference = ref()
const Popper = ref()

watch(() => props.visible, ( newValue ) => {
  if (newValue) {
    nextTick(() => {
      const { left, top, height} = reference.value.getBoundingClientRect()
      Popper.value.style.left = left +  'px'
      Popper.value.style.top = top + height + 'px'
    })
    window.addEventListener('mousedown',docClick)
  }else {
    window.removeEventListener('mousedown',docClick)
  }
})

function docClick(e){
  //如果点击的是音量 或者 是音量面板 则 不隐藏音量面板
  if (Popper.value.contains(e.target) || reference.value.contains(e.target)){
    return
  }
  emits('update:visible', false)
}

function showPopper() {
  emits('update:visible', !props.visible)
}
onUnmounted(()=>{
  emits('update:visible', false)
})
defineExpose({
  showPopper
})
</script>
<style scoped>
.lk-select {
  cursor: pointer;
  position: relative;
}

.Popper {
  position: fixed;
  top: 0;
  left: 0;
  background: #fff;
  box-shadow: 0 2px 12px 0px rgba(0, 0, 0, 0.1);
}

</style>

