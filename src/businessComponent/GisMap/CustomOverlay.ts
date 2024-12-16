export class CustomOverlay extends BMap.Overlay {
  map: BMap.Map | null
  customerCenter: BMap.Point | null
  length: number
  el: HTMLElement | null
  title: string
  constructor(center: BMap.Point, length: number, title: string) {
    super()
    this.map = null
    this.customerCenter = center
    this.length = length
    this.title = title
    this.el = null
  }
  initialize(map: BMap.Map) {
    this.map = map
    this.el = document.createElement('div')
    this.el.className = 'el-popper is-light el-popover'
    this.el.innerHTML = `
    <div class="el-popconfirm">
      <div class="el-popconfirm__main">
      <i class="el-icon el-popconfirm__icon" style="color: rgb(255, 153, 0);"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm23.744 191.488c-52.096 0-92.928 14.784-123.2 44.352-30.976 29.568-45.76 70.4-45.76 122.496h80.256c0-29.568 5.632-52.8 17.6-68.992 13.376-19.712 35.2-28.864 66.176-28.864 23.936 0 42.944 6.336 56.32 19.712 12.672 13.376 19.712 31.68 19.712 54.912 0 17.6-6.336 34.496-19.008 49.984l-8.448 9.856c-45.76 40.832-73.216 70.4-82.368 89.408-9.856 19.008-14.08 42.24-14.08 68.992v9.856h80.96v-9.856c0-16.896 3.52-31.68 10.56-45.76 6.336-12.672 15.488-24.64 28.16-35.2 33.792-29.568 54.208-48.576 60.544-55.616 16.896-22.528 26.048-51.392 26.048-86.592 0-42.944-14.08-76.736-42.24-101.376-28.16-25.344-65.472-37.312-111.232-37.312zm-12.672 406.208a54.272 54.272 0 0 0-38.72 14.784 49.408 49.408 0 0 0-15.488 38.016c0 15.488 4.928 28.16 15.488 38.016A54.848 54.848 0 0 0 523.072 768c15.488 0 28.16-4.928 38.72-14.784a51.52 51.52 0 0 0 16.192-38.72 51.968 51.968 0 0 0-15.488-38.016 55.936 55.936 0 0 0-39.424-14.784z"></path></svg></i>
      ${this.title}
      </div>
      <div class="el-popconfirm__action">
        <button class="el-button el-button--text el-button--small" type="button" id="customCancel">
          <span>取消</span>
        </button>
        <button class="el-button el-button--primary el-button--small" type="button" id="customConfirm">
          <span class="">确定</span>
        </button>
      </div>
    </div>
    <span class="el-popper__arrow arrow" data-popper-arrow="" style="position: absolute; top: 70px;left: 0px; transform: translate3d(82px, 0px, 0px);"></span>
    <span id="el-id-2420-41" role="tooltip" style="position: absolute; border: 0px; padding: 0px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; overflow-wrap: normal;"></span>
    `
    map.getPanes().markerPane!.appendChild(this.el)
    this.cancel()
    this.confirm()
    return this.el
  }
  draw() {
    const pixel = (this.map as BMap.Map).pointToOverlayPixel(this.customerCenter!)
    this.el!.style.left = pixel.x - this.length / 2 + 'px'
    this.el!.style.top = pixel.y - this.length / 2 - 25 + 'px'
  }
  show() {
    if (this.el) {
      this.el.style.display = ''
    }
  }
  hide() {
    if (this.el) {
      this.el.style.display = 'none'
    }
  }
  cancel() {
    const cancel = document.getElementById('customCancel')!
    const _this = this
    cancel.onclick = function (e) {
      e.stopPropagation()
      _this.hide()
    }
  }
  confirm() {
    const confirm = document.getElementById('customConfirm')!
    const _this = this
    confirm.onclick = function (e) {
      e.stopPropagation()
      const [marker] = _this.map!.getOverlays().filter(({ title }: any) => title)
      
      const customEvent = new CustomEvent('confirm', { detail: (marker as BMap.CustomOverlay).customerCenter })
      document.dispatchEvent(customEvent)
    }
  }
}
