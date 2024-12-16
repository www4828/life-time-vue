declare namespace CityGis {
  type ActionName = 'themeLayer' | 'goToPosition' | 'ShowData' | 'Clear'
  interface IBridgeOpt {
    id: string
    url: string
    onReady: () => void
  }
  interface IOpt {
    ActionName: ActionName,
    Parameters: any
  }
  class Bridge {
    constructor(bridgeOpt: IBridgeOpt)
    Invoke(opt: IOpt ): void
    addEventListener(cb: function, self: any):void
  }
}
declare namespace BMap {
  enum StatusCode {
    BMAP_STATUS_SUCCESS = 0,
    BMAP_STATUS_UNKNOWN_LOCATION = 2,
    BMAP_STATUS_PERMISSION_DENIED = 6,
    BMAP_STATUS_TIMEOUT = 8,
  }
  interface LocationOptions {
    poiRadius: number
    numPois: number
  }

  interface MarkerOptions {
    offset: Size
  }

  interface LocalSearchOptions {
    onSearchComplete: Function
    pageCapacity?: number
  }

  interface InfoWindowOptions {
    width?: number
    height?: number
    maxWidth?: number
    offset?: Size
    title?: string
    enableAutoPan?: boolean
    enableCloseOnClick?: boolean
  }
  interface LabelOptions {
    offset: Size
    position: Position
    enableMassClear?: boolean
  }
  interface OverlayOptions {
    point: Point
    opacity?: number
    offsetY?: number
    properties?: {
      title: string
      text: string
    }
  }
  interface MapPanes {
    floatPane?: HTMLElement
    markerMouseTarget?: HTMLElement
    floatShadow?: HTMLElement
    labelPane?: HTMLElement
    markerPane?: HTMLElement
    markerShadow?: HTMLElement
    mapPane?: HTMLElement
  }
  type StrokeStyle = 'solid' | 'dashed' 
  interface PolygonOptions {
    strokeColor: string
    fillColor: string
    strokeWeight: number
    strokeOpacity: number
    fillOpacity: number
    strokeStyle: StrokeStyle
    enableMassClear: boolean
    enableEditing: boolean
    enableClicking: boolean
  }
  class Map {
    constructor(container: string | HTMLElement);
    centerAndZoom(name: string, zoom: number): void;
    enableScrollWheelZoom(): void;
    addEventListener(type: string, fn: Function)
    removeEventListener(type: string, fn: Function)
    clearOverlays()
    addOverlay(marker: Marker)
    panTo(point: Point): void
    destroy()
    getPanes(): MapPanes
    pointToOverlayPixel(point: Point): Pixel
    openInfoWindow(windowInfo: InfoWindow, options: InfoWindowOptions)
    getOverlays():Array<Overlay>
  }
  class Size {
    constructor(width: number, height: number)
  }
  class Marker {
    constructor(point: Point, opts?: MarkerOptions)
  }
  class Point {
    constructor(x: number , y: number);
    lng: number
    lat: number
  }
  class Label {
    constructor(content: string, opts: LabelOptions)
    setStyle(styles: object)
    addEventListener(type: string, fn: Function)
    removeEventListener(type: string, fn: Function)
  }
  class InfoWindow {
    constructor(content: string | HTMLElement, opts: InfoWindowOptions)
  }
  class Polygon {
    constructor(points: Array<BMap.Point>, opts: Partial<PolygonOptions>)
  }
  class Polyline {
    constructor(points: Array<BMap.Point>, opts: Partial<PolygonOptions>)
  }
  class Geocoder {
    constructor()
    getPoint(address: string, fn: Function, cityName: string)
    getLocation(point: Point, callBack: Function, options?: LocationOptions)
  }
  class Overlay {
    constructor()
    initialize(map: Map)
    static getZIndex(lat: number, coordTyppe?: string): number
  }
  class CustomOverlay extends Overlay{
    point: Point
    draw()
    show()
    hide()
    title: string
    customerCenter: Point
    constructor(dom: string | HTMLElement, options: OverlayOptions)
  }
  class Pixel {
    /**
     * @param {number} x x坐标
     * @param {number} y y坐标
     */
    constructor(x: number, y: number)
    /**
     * x坐标
     */
    x: number
    /**
     * y坐标
     */
    y: number
    /**
     * 判断坐标点是否相等，当且仅当两点的x坐标和y坐标均相等时返回true
     * @param other 另一个像素点
     */
    equals(other: Point): boolean
  }
  class LocalSearch {
    constructor(location: Map | Point | string, opts: LocalSearchOptions)
    search(keyword: string)
    getStatus(): BMapGL.StatusCodes
  }

}