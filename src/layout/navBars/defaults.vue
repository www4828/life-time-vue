<template>
    <div class="navBar">
        <div class="login-box">
            <div class="logo" v-show="getThemeConfig.isShowLogo"></div>
            <div class="title">{{ getThemeConfig.globalTitle }}</div>
            <!-- <div class="department">新虹街道防疫办</div> -->
        </div>

        <div class="info-box">
            <!-- <div class="info-item">
                <div class="phone">
                    <div :class="['icon-box', ic_selected ? 'select' : '']" @click="isSelect">
                        <div class="icon"></div>
                    </div>
                </div>
            </div> -->
            <div class="info-item">
                <Screenfull />
            </div>
            <div class="info-item">
                <User :name="userinfo.name!" :deptment="userinfo.departmentList.map((i: any) => i.departmentName).join(',')"
                    :avatar="Icon" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { defineComponent, computed, defineProps, ref, onMounted, defineEmits, watch } from "vue";
import Screenfull from "@/components/screenFull/index.vue";
import User from "@/components/user/index.vue";
import { Session } from "@/utils/storage";
import Icon from '@/assets/login/icon_user.png'
export default defineComponent({
    name: "navBarDeafaults",
    components: {
        Screenfull,
        User
    },
    props: {
        selected: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const ic_selected = ref<boolean>(false);
        const visible = ref(false);
        const store = useStore();
        const getThemeConfig = computed(() => {
            return store.state.themeConfig.themeConfig;
        });
        const clientModel = Session.get('userInfo');
        onMounted(() => {
            ic_selected.value = props.selected;
        });
        const isSelect = () => {
            ic_selected.value = !ic_selected.value;
            if (ic_selected.value) {
                visible.value = false;
            }
            emit("update:selected", ic_selected.value);
        };
        const userinfo = Session.get('userInfo');
        watch(
            () => props.selected,
            () => {
                ic_selected.value = props.selected;
            }
        );
        return {
            getThemeConfig,
            clientModel,
            isSelect,
            ic_selected,
            userinfo, 
            visible,
            Icon
        }

    }
});
</script>
<style scoped lang="scss">
.navBar {
    width: 100%;
    height: 100%;
    float: left;
    color: var(--sh3h-head-font-color);

    .login-box {
        width: auto;
        height: 100%;
        float: left;
        margin: 0 0 0 20px;

        .logo {
            width: 70px;
            height: 100%;
            float: left;
            background: url("@/assets/logo.png") no-repeat;
            background-position: center center;
            background-size: 65px 65px;
            margin: 5px 10px 0 0;
        }

        .title {
            width: auto;
            height: 100%;
            float: left;
            font-size: $font-size-30;
            font-family: SourceHanSansCN-Bold;
            display: flex;
            justify-content: center;
            align-items: center;
            letter-spacing: 0px;
        }

        .department {
            width: auto;
            height: 100%;
            float: left;
            font-size: $font-size-18;
            font-family: SourceHanSansCN-Bold;
            display: flex;
            justify-content: center;
            align-items: center;
            letter-spacing: 0px;
            margin: 5px 0 0 60px;
        }
    }

    .info-box {
        width: auto;
        height: 100%;
        float: right;
        margin: 0 30px 0 0;
        display: flex;
        justify-content: center;
        align-items: center;

        .info-item {
            width: auto;
            height: 100%;
            float: left;
            margin: 0 10px;
            @include flex-box(center, center);

            .phone {
                width: auto;
                height: 100%;
                float: right;
                display: flex;
                font-size: 22px;
                align-items: center;

                /*闪烁动画*/
                @keyframes twinkle {
                    from {
                        opacity: 1.0;
                    }

                    50% {
                        opacity: 0.4;
                    }

                    to {
                        opacity: 1.0;
                    }
                }

                .ppp {
                    animation: twinkle 2s;
                    animation-iteration-count: infinite;
                }

                .icon-box {
                    float: left;
                    cursor: pointer;

                    .icon {
                        width: 22px;
                        height: 22px;
                        float: left;
                        background: url("@/assets/navMenu/phone.png");
                        background-size: 100% 100%;
                    }

                    &.select {
                        background: url("@/assets/navMenu/nav-select-bg.png");
                        background-size: 100% 100%;
                    }
                }
            }
        }
    }
}
</style>