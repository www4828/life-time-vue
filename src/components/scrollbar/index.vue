<template>
    <ElScrollbar class="scrollbar-wrapper">
        <slot></slot>
    </ElScrollbar>
</template> 
<script lang="ts">
import {ElScrollbar} from 'element-plus'
import { defineComponent } from 'vue'
export default defineComponent({
    components:{
        ElScrollbar
    }
})

</script>