import { reactive } from "vue";
import { Icon, MarkIcon, MarkType, ClassName } from "@/businessComponent/CaseIcon/type";
import { TaskIconService } from "@/api/service/TaskIcon/TaskIconService";


export function useMarkIcon(taskId: string) {
  const taskIconService = new TaskIconService();
  const markIcons = reactive<{ icons: Icon[], caseMark: MarkIcon[]}>({
    icons:[],
    caseMark: []
  })
  const getTaskIcon = () => {
    taskIconService.getTaskIcon(taskId).then((res) => {
      if (res.code === 200) {
        if (res.data.tags.length > 0) {
          const { tags } = res.data;
          tags.forEach((item: Icon) => {
            markIcons.icons.push({
              name: item.name,
              icon: item.icon,
              note: item.note,
              remark: item.remark,
            });
          });
        }
        if (res.data.waterMarks.length > 0) {
          const { waterMarks } = res.data;
          waterMarks.forEach((item: Icon) => {
            const colorReg = /[a-z]+/;
            const typeReg = /[A-Z]{1}\w+/;
            const icon = item.icon;
            const color = icon.match(colorReg)![0];
            const type = icon.match(typeReg)![0];
            markIcons.caseMark.push({
              name: item.name,
              type: (type.slice(0, 1).toLowerCase() + type.slice(1)) as MarkType,
              className: color as ClassName,
              note: item.note
            });
          });
        }
      }
    });
  };
  getTaskIcon()
  return {
    markIcons
  }
}
export function useMarkIconAll(all:Array<string>) {
  const taskIconService = new TaskIconService();
  return new Promise((resolve)=>{
    taskIconService.getTaskIconAll(all).then((res) => {
      resolve(res.data)
    });
  }) 
}
export function getTaskIcon(tagsAndWaterMarks:any) {
  const markIcons = reactive<{ icons: Icon[], caseMark: MarkIcon[]}>({
    icons:[],
    caseMark: []
  })
  const getTaskIcon = () => {
    if (tagsAndWaterMarks.tags.length > 0) {
      const { tags } = tagsAndWaterMarks;
      tags.forEach((item: Icon) => {
        markIcons.icons.push({
          name: item.name,
          icon: item.icon,
          note: item.note,
          remark: item.remark,
        });
      });
    }
    if (tagsAndWaterMarks.waterMarks.length > 0) {
      const { waterMarks } = tagsAndWaterMarks;
      waterMarks.forEach((item: Icon) => {
        const colorReg = /[a-z]+/;
        const typeReg = /[A-Z]{1}\w+/;
        const icon = item.icon;
        const color = icon.match(colorReg)![0];
        const type = icon.match(typeReg)![0];
        markIcons.caseMark.push({
          name: item.name,
          type: (type.slice(0, 1).toLowerCase() + type.slice(1)) as MarkType,
          className: color as ClassName,
          note: item.note
        });
      });
    }
  };
  getTaskIcon()
  return markIcons
}
export function useMarkIconXF(taskId: string) {
  const taskIconService = new TaskIconService();
  const markIcons = reactive<{ icons: Icon[], caseMark: MarkIcon[]}>({
    icons:[],
    caseMark: []
  })
  const getTaskIcon = () => {
    taskIconService.getTaskIconXF(taskId).then((res) => {
      if (res.code === 200) {
        if (res.data.tags.length > 0) {
          const { tags } = res.data;
          tags.forEach((item: Icon) => {
            markIcons.icons.push({
              name: item.name,
              icon: item.icon,
              note: item.note,
              remark: item.remark,
            });
          });
        }
        if (res.data.waterMarks.length > 0) {
          const { waterMarks } = res.data;
          waterMarks.forEach((item: Icon) => {
            const colorReg = /[a-z]+/;
            const typeReg = /[A-Z]{1}\w+/;
            const icon = item.icon;
            const color = icon.match(colorReg)![0];
            const type = icon.match(typeReg)![0];
            markIcons.caseMark.push({
              name: item.name,
              type: (type.slice(0, 1).toLowerCase() + type.slice(1)) as MarkType,
              className: color as ClassName,
              note: item.note
            });
          });
        }
      }
    });
  };
  getTaskIcon()
  return {
    markIcons
  }
}