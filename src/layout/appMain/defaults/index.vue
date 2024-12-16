<template>
    <div class="appMain">
        <div class="breadcrumb" v-if="getThemeConfig.isBreadCrumb">
            <Breadcrumb />
        </div>
        <div class="tagsView" v-if="getThemeConfig.isTagsView">
            <TagsView />
        </div>
        <div :class="mainLinkStyle">
            <div class="link-box ">
                <Link />
            </div>
        </div>
        <!-- <div class="footer" v-if="getThemeConfig.isFooter">
            <Footer />
        </div> -->
    </div>
</template>
<script lang="ts">
import { defineComponent, computed } from "vue";
import Breadcrumb from '@/layout/components/defaults/breadcrumb.vue';
import TagsView from '@/layout/components/defaults/tagsView.vue';
import Footer from '@/layout/components/defaults/footer.vue';
import Link from '@/layout/components/defaults/link.vue';
import { store } from "@/store";
export default defineComponent({
    name: "appMain",
    components: {
        Breadcrumb,
        TagsView,
        Footer,
        Link
    },
    setup() {
        const getThemeConfig = computed(() => {
            return store.state.themeConfig.themeConfig;
        });

        const mainLinkStyle = computed(() => {
            let styleName = "mainLink";
            if (getThemeConfig.value.isBreadCrumb) {
                styleName += "-breadcrumb"
            }
            if (getThemeConfig.value.isTagsView) {
                styleName += "-tagsview"
            }
            if (getThemeConfig.value.isFooter) {
                styleName += "-footer"
            }
            return styleName;

        });
        return {
            getThemeConfig,
            mainLinkStyle
        }
    }
});
</script>
<style lang="scss">
.appMain {
    // width: calc(100% - 2px);
    width: 100%;
    height: 100%;
    float: left;
    // margin: 0 0 0 2px;

    .breadcrumb {
        width: 100%;
        height: $breadcrumb-height;
        float: left;
        background-color: var(--sh3h-breadcrumb-background-color);
        box-shadow: -2px 2px 5px var(--sh3h-shadow-color);
    }
    .tagsView {
        width: 100%;
        height: $tagsView-height;
        float: left;
        background: url("@/assets/layout/tag_bg.png") no-repeat left top;
        background-size: 100% 100%;
    }
    .mainLink {
        width: 100%;
        height: 100%;
        float: left;
        &-breadcrumb {
            width: 100%;
            height: calc(100% - $breadcrumb-height);
            float: left;

            &-tagsview {
                width: 100%;
                height: calc(100% - $breadcrumb-height - $tagsView-height);
                float: left;

                &-footer {
                    width: 100%;
                    height: 100%;
                    float: left;
                }
            }
            &-footer {
                width: 100%;
                height: calc(100% - $breadcrumb-height - $footer-height);
                float: left;
            }
        }
        &-tagsview {
            width: 100%;
            height: calc(100% - $tagsView-height);
            float: left;

            &-footer {
                width: 100%;
                height: calc(100% - $tagsView-height);
                float: left;
                background-color: #f2f2f5;
            }
        }
        &-footer {
            width: 100%;
            height: calc(100% - $footer-height);
            float: left;
        }
    }
    .link-box {
        width: calc(100% - 30px);
        height: calc(100% - 30px);
        float: left;
        margin: 15px;
        position: relative;
        
    }
    .footer {
        width: 100%;
        height: $footer-height;
        float: left;
    }
}
</style>