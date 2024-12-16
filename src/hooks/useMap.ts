export interface AddressInfo {
  lon: number;
  lat: number;
  locationAddress: string;
  locationDistrict: string;
  locationStreet: string;
  locationRoad: string;
}
export interface AddressCallback {
  result?: AddressInfo;
  resultMessage: string;
  code: number
}

export function useMap() {
  const getGeo = (): BMap.Geocoder => {
    const geo = new BMap.Geocoder();
    return geo;
  };
  const getLocalSearch = (fn: Function): BMap.LocalSearch => {
    const localSearch = new BMap.LocalSearch('上海市',{
      onSearchComplete: fn
    });
    return localSearch
  }

  const getAddressByLng = (point: any): Promise<AddressCallback> => {
    return new Promise((resolve) => {
      const geo = getGeo();
      geo.getLocation(point, function(res: any) {
        if (res.surroundingPois.length > 0) {
          const [result] = res.surroundingPois
          resolve({ resultMessage: "地址解析成功", result: {
            lon: result.point.lng,
            lat: result.point.lat,
            locationAddress: result.address,
            locationDistrict: res.addressComponents.district,
            locationRoad: res.addressComponents.streetNumber,
            locationStreet: res.addressComponents.street,
          }, code: 200 });
        } else {
          resolve({ resultMessage: "地址解析成功", result: {
            lon: point.lng,
            lat: point.lat,
            locationAddress: res.address,
            locationDistrict: res.addressComponents.district,
            locationRoad: res.addressComponents.streetNumber,
            locationStreet: res.addressComponents.street,
          }, code: 200 });
        }
       
      })
    })
  }

  const getAreaInfoByAddress = (address: string): Promise<AddressCallback> => {
    return new Promise((resolve) => {
      const geo = getGeo();
      geo.getPoint(
        address,
        async function (point: any) {
          if (point) {
            resolve(await getAddressByLng(point))
          } else {
            resolve({ resultMessage: "地址没有解析到结果,请在地图面板手动选择", code: 500 });
          }
        },
        "上海"
      );
    });
  };
  return {
    getAreaInfoByAddress,
    getAddressByLng,
    getLocalSearch
  }
}