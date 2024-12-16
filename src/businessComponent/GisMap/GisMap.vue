<template>
  <iframe
    id="gisShow"
    name="gisShow"
    :src="gisUrl"
    style="width: 100%; height: 100%"
    frameborder="0"
    scrolling="no"
    allowtransparency="true"
  ></iframe>
</template>
<script lang="ts" setup>
import { Session } from "@/utils/storage";
const emit = defineEmits(["getPoint", "mapReady"]);
const gisUrl = Session.get("appConfig").urls.gisMapUrl;
const jsBridge = new CityGis.Bridge({
  id: "gisShow",
  url: gisUrl,
  onReady() {
    emit("mapReady");
    console.log("gis is ready");
  },
});
jsBridge.addEventListener(function (arg: any) {
  switch (arg.action) {
    case "getPoint":
      // todo: 接入接口返回地图信息
      // emit("getPoint", arg);
      break;
    default:
  }
}, window);
const interactWithMap = (actionName: CityGis.ActionName, options: object) => {
  jsBridge.Invoke({
    ActionName: actionName,
    Parameters: options,
  });
};

const location = (x: number | string, y: number | string) => {
  interactWithMap("goToPosition", {
    positon: {
      x: x,
      y: y,
    },
    heading: 0,
    tilt: 45,
    hasImg: true,
    marker: {
      size: 16,
      color: "#ff0000",
    },
    zoom: 10,
    isRotation360: false,
  });
};

defineExpose({
  location,
});
</script>

<style lang="scss" scoped></style>
