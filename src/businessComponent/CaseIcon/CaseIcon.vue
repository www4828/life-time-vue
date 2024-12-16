<template>
  <div class="caseIcon">
    <div class="icon" v-for="icon in props.icons">
      <el-tooltip placement="top" effect="light" v-if="icon.name === 'solvingLimitTime'">
        <template #content>
          <div v-html="getNote(icon.note)"></div>
        </template>
        <div class="noIconWrapper">
          <div class="noIcon">
            {{ icon.icon }}
          </div>
          <span v-if="icon.remark !== ''" class="mark">{{ icon.remark }}</span>
        </div>
      </el-tooltip>
      <el-tooltip placement="top" effect="light" v-else-if="icon.name === 'overTime'">
        <template #content>
          <div v-html="getNote(icon.note)"></div>
        </template>
        <div class="noIconWrapper">
          <div class="noIcon overTime">
            {{ icon.icon }}
          </div>
          <span v-if="icon.remark !== ''" class="mark">{{ icon.remark }}</span>
        </div>
      </el-tooltip>
      <template v-else-if="icon.icon === 'yfj.png'">
        <el-popover
          placement="right"
          :width="800"
          trigger="hover"
          @show="showPopover"
          v-if="props.taskId"
        >
          <template #reference>
            <img :src="getIconSrc(icon.icon)" alt="" />
          </template>
          <FileAttachments :is-list-show="false" v-if="taskId !== ''" :task-id="taskId" />
        </el-popover>
        <template v-else>
          <el-tooltip placement="top" effect="light" v-if="icon.note">
            <template #content>
              <div v-html="getNote(icon.note)"></div>
            </template>
            <img :src="getIconSrc(icon.icon)" alt="" />
          </el-tooltip>
          <img :src="getIconSrc(icon.icon)" alt="" v-else />
        </template>
      </template>
      <template v-else-if="icon.icon === 'xl.png'">
        <el-popover
          placement="right"
          :width="800"
          trigger="hover"
          @show="showPopover"
          v-if="props.taskId"
        >
          <template #reference>
            <div class="noIconWrapper">
              <div class="noIcon">
                {{ icon.note }}
              </div>
            </div>
          </template>
          <ContactTable v-if="taskId !== ''" :task-id="taskId" :formType="icon.name" />
        </el-popover>
      </template>
      <template v-else>
        <el-tooltip placement="top" effect="light" v-if="icon.note">
          <template #content>
            <div v-html="getNote(icon.note)"></div>
          </template>
          <img
            :src="getIconSrc(icon.icon)"
            :class="{ isEmpty: !Boolean(icon.icon) }"
            alt=""
          />
        </el-tooltip>
        <img
          :src="getIconSrc(icon.icon)"
          :class="{ isEmpty: !Boolean(icon.icon) }"
          alt=""
          v-else
        />
        <span v-if="icon.remark !== ''" class="mark">{{ icon.remark }}</span>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Icon } from "./type";
import { ref } from "vue";
import FileAttachments from "../FileAttachments/FileAttachments.vue";
import ContactTable from "@/businessComponent/ContactDialog/table.vue";

const props = defineProps<{
  icons?: Icon[];
  taskId?: string;
}>();
const getIconSrc = (name: string) => {
  if (name !== "") {
    const icons = import.meta.globEager("@/assets/taskIcon/*.png");
    const icon = `../../assets/taskIcon/${name}`;
    return icons[icon].default;
  }
};
const taskId = ref("");
const getNote = (note: string) => {
  return note.replace(/\;/g, "<br/>");
};
const showPopover = () => {
  taskId.value = props.taskId + "";
};
</script>

<style lang="scss" scoped>
$icon: 22px;
.caseIcon {
  display: flex;
  cursor: pointer;
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: $icon;
      height: $icon;
      margin: 0 2px;
      &.isEmpty {
        visibility: hidden;
      }
    }
  }
  .noIconWrapper {
    display: flex;
    align-items: center;
    .noIcon {
      width: $icon;
      height: $icon;
      margin: 0 2px;
      background-color: var(--sh3h-noIcon-background-color);
      text-align: center;
      line-height: $icon;
      @include fontStyle(
        var(--sh3h-font-family-medium),
        $font-size-16,
        var(--sh3h-head-font-color)
      );
      font-weight: bold;
      &.overTime {
        background-color: var(--sh3h-mark-red-color);
      }
    }
  }

  .mark {
    display: inline-block;
    word-break: keep-all;
    white-space: nowrap;
    @include fontStyle(
      var(--sh3h-font-family-medium),
      $font-size-16,
      var(--sh3h-value-color)
    );
    font-weight: bold;
    margin: 0 3px;
  }
}
</style>
