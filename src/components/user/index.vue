<template>
  <div class="flex">
    <el-avatar :size="size" :src="avatar"></el-avatar>
  </div>
  <div class="info">
    <div class="name">{{ name }}</div>
    <div class="deptment">{{ deptment }}</div>
  </div>
  <el-dropdown :show-timeout="70" :hide-timeout="50" @command="onHandleCommandClick">
    <span class="el-dropdown-link">
      {{}}
      <el-icon class="el-icon--right">
        <ele-ArrowDown />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <!-- <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item> -->
        <el-dropdown-item command="updatePassword">修改密码</el-dropdown-item>
        <el-dropdown-item command="logout" divided>退出登入</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <Password :dialogVisible="dialogVisible" @close="dialogVisible = false" />
</template>
<script lang="ts">
import { useStore } from "@/store";
import { Session } from "@/utils/storage";
import { useLock } from "@/hooks/useLock";
import { defineComponent, ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { Action } from "element-plus";
import Password from "@/businessComponent/Password/index.vue";
import Watermark from "@/utils/wartermark";
import { loadAppConfig } from "@/utils/loadJson";

export default defineComponent({
  name: "User",
  components: { Password },
  props: {
    name: {
      type: String,
      required: true,
    },
    deptment: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: "small",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  setup() {
    let dialogVisible = ref(false);
    const store = useStore();
    const router = useRouter();
    const { hasLockCase } = useLock();
    const onHandleCommandClick = (path: string) => {
      switch (path) {
        case "logout":
          hasLockCase().then(() => {
            logout();
          });
          break;
        case "updatePassword":
          dialogVisible.value = true;
          break;
        default:
          break;
      }
    };
    const logout = () => {
      store
        .dispatch("userInfos/LoginOut")
        .then(() => {
          Watermark.del();
          Session.clear();
          store.dispatch("routesList/setRoutesList", []);
          loadAppConfig().then((res) => {
            router.push({ path: res.data.portalPath });
          });
          nextTick(() => {
            location.reload();
          });
        })
        .catch((error) => {
          console.log(error);
        });
    };
    const resetPassword = () => {
      ElMessageBox.confirm('确定要重置此用户的密码为"123456"吗?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          ElMessage({
            type: "success",
            message: "密码已重置",
          });
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消操作",
          });
        });
    };
    return {
      onHandleCommandClick,
      logout,
      resetPassword,
      dialogVisible,
    };
  },
});
</script>
<style scoped lang="scss">
.flex {
  display: flex;

  .el-avatar--small {
    --el-avatar-size: 30px !important;
  }

  .el-avatar > img {
    width: 100% !important;
    height: 100%;
    float: left;
  }
}

.el-icon {
  color: var(--sh3h-head-font-color) !important;
  font-size: 20px;
}

.info {
  width: auto;
  height: 100%;
  float: left;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  margin: 0 10px;

  .name {
    width: auto;
    height: 20px;
    float: left;
    font-size: $font-size-16;
    @include flex-box(center, center);
    font-family: SourceHanSansCN-Bold;
    // margin-bottom: 10px;
  }

  .deptment {
    width: auto;
    height: 20px;
    float: left;
    font-size: $font-size-14;
    font-family: SourceHanSansCN-Bold;
    @include flex-box(center, center);
    margin-top: 5px;
  }
}
</style>
