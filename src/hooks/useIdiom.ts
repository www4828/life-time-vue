import { ref } from "vue";
import { NodeCodeKey } from "@/api/model/fileAttachmentModel";
export interface ListPrams {
  id?: string;
  taskId?: string;
  processId?: string;
  code: NodeCodeKey;
  name: string;
  formPath?: string;
}
export function useIdiom() {
  const idiomControl = ref(false)
  const idiomRef = ref()
  const closeDialog = () => {
    idiomControl.value = false
  }
  const showDialog = () => {
    idiomControl.value = true
  }
  return {
    idiomRef,
    idiomControl,
    closeDialog,
    showDialog
  }
}