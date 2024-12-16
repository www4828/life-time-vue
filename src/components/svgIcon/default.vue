<template>
    <svg :class="svgClass" aria-hidden="true">
      <use :xlink:href="iconName"/>
    </svg>
  </template>
  
<script lang="ts">import { computed, defineComponent } from "vue";


export default defineComponent({
    name:"svg-default",
    components:{},
    props:{
        iconName: {
            "type": String,
            "required": true
        },
        className: {
            "type": String,
            "default": ""
        }
    },
    setup(props){
        const iconName=computed(()=>{
            return  `#icon-${props.iconName}`;
        });
        const svgClass=computed(()=>{
            if (props.className) {
                return "svg-icon " + props.className;
            }
            return "svg-icon";
        });

        return{
            iconName,
            svgClass
        }
    }
});
</script>

 