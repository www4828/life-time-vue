<template>
    <div class="Layout">
        <div class="treeWrapper">
            <div class="search">
                <slot name="search"></slot>
            </div>
            <!-- <div class="button">
                <slot name="button"></slot>
            </div> -->
            <div class="table">
                <slot name="table"></slot>
            </div>
        </div>
        <!-- <div class="contentWrapper">
            <div class="content">
                <slot name="content"></slot>
            </div>
        </div> -->
    </div>
</template>
<style lang="scss" scoped>
$margin: 20px;
$padding: 22px;
$padding10: 10px;
$leftWidth: 445px;

.color {
    border: 1px solid var(--sh3h-tree-border-color);
    background-color: var(--sh3h-tree-background-color);
}

.Layout {
    display: flex;
    width: 100%;
    height: 100%;
    background-color: var(--sh3h-breadcrumb-background-color);
    padding: $margin;
    box-sizing: border-box;

    .treeWrapper {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
        width: 100%;
        @extend .color;

        .search {
            display: flex;
            padding: 0 $padding 0 $padding;
        }

        .table {
            // flex: 1;
            box-sizing: border-box;
            padding: $padding10 $margin;
            height: calc(100% - 50px);
            width: 100%;
            // overflow-y: hidden;
            // margin: $padding;
            // padding-top: $margin;
            // border-top: 1px solid var(--sh3h-tree-border-color);
        }

        // .button {
        //     display: flex;
        //     padding: $padding;
        // }
    }

    .contentWrapper {
        margin-left: $margin ;
        flex: 1;
        display: flex;

        .content {
            flex: 1;
            padding: $padding10 $margin $margin;
            @extend .color;
        }
    }
}

::v-deep(.el-table th.el-table__cell) {
    -webkit-user-select: none;
    user-select: none;
    //background-color: var(--sh3h-background-color);
}

::v-deep(.el-table thead) {
    color: var(--sh3h-theme-color);
}
</style>
  