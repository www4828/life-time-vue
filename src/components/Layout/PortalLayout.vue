<template>
    <div class="NewsLayout">
        <!-- <Scrollbar> -->
        <!-- <div class="first">
            <div class="today">
                <slot name="today"></slot>
            </div>
            <div class="tips">
                <slot name="tips"></slot>
            </div>
        </div> -->
        <div class="third">
            <div class="left">
                <slot name="overAll"></slot>
            </div>
            <div class="right">
                <slot name="dispose"></slot>
            </div>

        </div>
        <div class="first">
            <div class="left">
                <slot name="files"></slot>
            </div>
            <div class="right">
                <slot name="tips"></slot>
            </div>
        </div>
        <!-- </Scrollbar> -->
    </div>
</template>
<script lang="ts" setup>
import Scrollbar from "@/components/scrollbar/index.vue";

</script>
<style lang="scss" scoped>
$padding: 24px;
$firstHieght: 345px;
$firstOneWidth: 1050px;

.NewsLayout {
    display: flex;
    flex-direction: column;
    // background-color: var(--sh3h-breadcrumb-background-color);
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: $padding;

    .first {
        height: 300px;
        display: flex;
        flex-direction: row;
        margin-bottom: 60px;

        .left {
            // width: 1050px;
            width: 50%;

            height: 100%;
            margin-right: 20px;
        }

        .right {
            // width: 800px;
            width: 50%;

            height: 100%;
        }
    }

    .third {
        display: flex;
        flex-direction: row;
        height: 500px;
        margin-bottom: 45px;
        width: 100%;

        .left {
            width: 50%;
            margin-right: 20px;
            height: 100%;
        }

        .right {
            width: 50%;
            height: 100%;
        }
    }



}
</style>