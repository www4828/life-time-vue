import { computed, nextTick } from 'vue'
import { store } from '@/store'
import { StyleState } from '@/store/interface'
import { getLightColor, getDarkColor } from '@/utils/theme'

export function useTheme() {
  const getThemeConfig = computed(() => {
    return store.state.themeConfig.themeConfig
  })
  const overrideElement = () => {
    let colorList = getThemeConfig.value.colorList
    colorList?.forEach((item: StyleState) => {
      document.documentElement.style.setProperty(`${item.name}`, item.value)
      if (item.type === 'color' && item.opacity) {
        initLightColor(item.name, item.value)
        initDarkColor(item.name, item.value)
      }
    })
    const html = document.getElementsByTagName('html')[0]
    const styles = html.getAttribute('style')
    sessionStorage.setItem('styles', styles!)
  }
  const initLightColor = (name: string, color: string) => {
    // 颜色变浅
    for (let i = 1; i <= 9; i++) {
      document.documentElement.style.setProperty(
        `${name}-light-${i}`,
        `${getLightColor(color, i / 10)}`
      )
    }
  }
  const initDarkColor = (name: string, color: string) => {
    // 颜色变深
    for (let i = 1; i <= 9; i++) {
      document.documentElement.style.setProperty(
        `${name}-dark-${i}`,
        `${getDarkColor(color, i / 10)}`
      )
    }
  }
  nextTick(() => {
    overrideElement()
  })
  return {
    getThemeConfig,
  }
}
