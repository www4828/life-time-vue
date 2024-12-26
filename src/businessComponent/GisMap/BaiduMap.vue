<template>
  <div class="mapContentWrapper">
    <div id="mapContent"></div>
    <el-input v-model="keyWords" class="keywords" placeholder="请输入地址">
      <template #append>
        <el-button
          :icon="Search"
          ref="buttonRef"
          v-click-outside="onClickOutside"
          @click="searchKeyWords"
        />
      </template>
    </el-input>
    <el-popover
      ref="popoverRef"
      :virtual-ref="buttonRef"
      v-model:visible="isShow"
      trigger="click"
      width="300px"
      virtual-triggering
      @hide="cur = -1"
    >
      <ul class="address">
        <li
          v-for="(r, index) in result"
          @click.self="choiceAddress(r, index)"
          :class="{ active: cur === index }"
        >
          {{ r.title }}
        </li>
      </ul>
    </el-popover>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, ref, getCurrentInstance, onUnmounted, unref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { ClickOutside as vClickOutside } from "element-plus";
import { useMap, AddressInfo } from "@/hooks/useMap";
import { CustomOverlay } from "./CustomOverlay";
import lgpq from "@/assets/map/lgpq.json";
interface ChoiceAddress extends AddressInfo {
  point: BMap.Point;
  title: string;
}
const props = defineProps<{
  isDetail?: boolean;
}>();
let map = ref<BMap.Map | null>(null);
const buttonRef = ref();
const isDetail = ref(!!props.isDetail);
const cur = ref(-1);
const popoverRef = ref();
const isShow = ref(false);
const result = ref<ChoiceAddress[]>([]);
const { proxy } = <any>getCurrentInstance()!;
const { getAddressByLng, getLocalSearch } = useMap();
const keyWords = ref("");
const emit = defineEmits(["clickDone"]);
let localSearch = ref<BMap.LocalSearch>();
const onClickOutside = () => {
  unref(popoverRef).popperRef?.delayHide?.();
};
const autoComplete = (results: any) => {
  result.value = [];
  if (localSearch.value!.getStatus() == 0) {
    for (let i = 0; i < results.getCurrentNumPois(); i++) {
      const { point, address, title, province } = results.getPoi(i);
      result.value.push({
        point: point,
        locationAddress: address,
        locationDistrict: province,
        locationStreet: "",
        locationRoad: "",
        lon: point.lng,
        lat: point.lat,
        title,
      });
    }
  }
};
const addCustomOverlay = (point: BMap.Point) => {
  const marker = new BMap.Marker(point);
  map.value!.addOverlay(marker);
  const customerLayer = new CustomOverlay(point, 175, "是否选择");
  map.value!.addOverlay(customerLayer);
};
const choiceAddress = (info: ChoiceAddress, index: number) => {
  cur.value = index;
  map.value!.clearOverlays();
  map.value!.panTo(info.point);
  addCustomOverlay(info.point);
};
nextTick(() => {
  map.value = new BMap.Map("mapContent");
  map.value.centerAndZoom("上海", 18);
  map.value.enableScrollWheelZoom();
  const points: BMap.Point[] = [];
  lgpq[0].geometry.coordinates.forEach((data) => {
    const [x, y] = data;
    points.push(new BMap.Point(x, y));
  });
  const polyline = new BMap.Polyline(points, {
    strokeColor: "blue",
    strokeWeight: 2,
    strokeOpacity: 0,
    fillOpacity: 0,
    enableMassClear: false,
  }); //创建多边形
  map.value.addOverlay(polyline);
  localSearch.value = getLocalSearch(autoComplete);
  map.value.addEventListener("click", function (e: any) {
    if (!isDetail.value) {
      map.value!.clearOverlays();
      addCustomOverlay(e.point);
    }
  });

  proxy.mittBus.on("toLocation", (address: string) => {
    keyWords.value = address;
    map.value!.clearOverlays();
    searchKeyWords();
    isShow.value = true;
  });

  proxy.mittBus.on("showMarker", (point: any) => {
    isDetail.value = true;
    if (isDetail.value) {
      map.value!.addEventListener("tilesloaded", function () {
        const mapPoint = new BMap.Point(point.lng, point.lat);
        const marker = new BMap.Marker(mapPoint);
        map.value!.panTo(mapPoint);
        map.value!.addOverlay(marker);
      });
    }
  });
});
const onConfirm = (e: any) => {
  getAddressByLng(e.detail).then((result) => {
    proxy.mittBus.emit("mapClick", result);
    emit("clickDone");
    isShow.value = false;
  });
};
document.addEventListener("confirm", onConfirm);
const searchKeyWords = () => {
  isShow.value = true;
  localSearch.value!.search(keyWords.value);
};
onUnmounted(() => {
  proxy.mittBus.off("showMarker");
  proxy.mittBus.off("toLocation");
  document.removeEventListener("confirm", onConfirm);
  // map.value!.destroy();
});
</script>

<style lang="scss" scoped>
.mapContentWrapper {
  position: relative;
  height: 100%;
  #mapContent {
    width: 100%;
    height: 100%;
    font-size: 16px;
    ::v-deep(.BMap_cpyCtrl) {
      display: none !important;
    }
    ::v-deep(.anchorBL) {
      display: none !important;
    }
    ::v-deep(.el-popper.is-light .el-popper__arrow::before) {
      border-left-color: transparent;
      border-top-color: transparent;
    }
  }
  .keywords {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 300px;
    z-index: 999;
  }
}
.address {
  li {
    margin-bottom: 10px;
    cursor: pointer;
    &.active {
      color: var(--lt-workTicket-background);
      font-weight: bold;
    }
  }
}
</style>
