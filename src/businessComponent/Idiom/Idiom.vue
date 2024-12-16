<template>
  <div class="idiomContent">
    <el-tag
      v-for="idiom in idiomContent"
      size="large"
      @click="idiomClick(idiom.phraseContent!, idiom.id!)"
      >{{ idiom.phraseName }}</el-tag
    >
  </div>
</template>

<script lang="ts" setup>
import { PhraseEntity } from "@/api/model/idiomModel";
import { ref, getCurrentInstance, onUnmounted } from "vue";
import { IdiomService } from "@/api/service/Idiom/IdiomService";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";

type IdiomContentProps = Pick<PhraseEntity, "id" | "phraseContent" | "phraseName">;

const props = defineProps<{
  nodeCode: NodeCodeKey;
}>();
const idiomService = new IdiomService();
const idiomContent = ref<IdiomContentProps[]>([]);
const { proxy } = <any>getCurrentInstance()!;
const emits = defineEmits(["idiomContentText"]);
const idiomClick = (content: string, id: string) => {
  idiomService.countNum(id);
  emits("idiomContentText", content);
};

proxy.mittBus.on(
  "updateIdiomContent" + props.nodeCode,
  (callBackIdIomContent: IdiomContentProps[]) => {
    idiomContent.value = callBackIdIomContent;
  }
);
onUnmounted(() => {
  proxy.mittBus.off("updateIdiomContent" + props.nodeCode);
});
</script>

<style scoped lang="scss">
.idiomContent {
  display: flex;
  justify-content: flex-end;
  padding-left: 100px;
  margin-bottom: 10px;
  cursor: pointer;
  ::v-deep(.el-tag) {
    margin-right: 10px;
  }
}
</style>
