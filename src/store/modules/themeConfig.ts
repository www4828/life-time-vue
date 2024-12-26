import { Module } from 'vuex'
import { ThemeConfigState, RootStateTypes } from '@/store/interface'
import { ColorModel } from "@/api/model/themeModel";
import { ThemeService } from "@/api/service/System/ThemeService";
import { cloneDeep } from 'lodash-es';

const themeService = new ThemeService()
const themeConfigModule: Module<ThemeConfigState, RootStateTypes> = {
  namespaced: true,
  state: {
    themeConfig: {
      isShowLogo: true, //显示logo
      isMenuIcon: true, //显示菜单图标
      isUniqueOpened: false, //是否只保持一个子菜单的展开
      isBreadCrumb: false, //显示面包屑
      isBreadCrumbIcon: false, //显示面包屑图标
      tagsStyle: 'default', //标签样式
      isTagsView: true, //显示标签页
      isTagsViewIcon: true, //显示标签页图标
      isFooter: true, //显示底部系统信息
      footerText: '',
      isWarteMark: true, //显示水印(默认当前用户)
      animation: 'slide-right', //动态
      globalTitle: '后台集成管理系统', //系统标题
      globalViceTitle: '', //系统副标题
      globalComponentSize: '0',
      layout: 'defaults',
      isCollapse: true,
      isShareTagsView: true, // 是否开启 TagsView 共用
      isCacheTagsView: false, // 是否开启 TagsView 缓存
      isSortableTagsView: true, // 是否开启 TagsView 拖拽
    },
    colorList: [
      {
        name: '--lt-login-color',
        value: '#2d2d2d',
        type: 'color',
        opacity: true,
        description: '登陆文字颜色',
        status: false,
      },
      {
        name: '--lt-login2-color',
        value: '#a5a5a5',
        type: 'color',
        opacity: true,
        description: '登陆2文字颜色',
        status: false,
      },
      {
        name: '--lt-theme-color',
        value: '#0c1935',
        type: 'color',
        opacity: true,
        description: '主题色',
        status: false,
      },
      {
        name: '--el-color-primary',
        // value: '#2F69EB',
        value:'#2e75d2',
        type: 'color',
        opacity: true,
        description: '主题primary颜色',
        status: true,
      },
      {
        name: '--el-color-success',
        value: '#30D3A3',
        type: 'color',
        opacity: true,
        description: '主题success颜色',
        status: true,
      },
      {
        name: '--el-color-warning',
        value: '#F7B817',
        type: 'color',
        opacity: true,
        description: '主题warning颜色',
        status: true,
      },
      {
        name: '--el-color-danger',
        value: '#E23A25',
        type: 'color',
        opacity: true,
        description: '主题danger颜色',
        status: true,
      },
      {
        name: '--el-color-badge',
        value: '#f56c6c',
        type: 'color',
        opacity: true,
        description: 'badge颜色',
        status: true,
      },
      {
        name: '--el-color-info',
        value: '#687082',
        type: 'color',
        opacity: false,
        description: '主题info颜色',
        status: true,
      },
      {
        name: '--lt-shadow-color',
        // value: '#caccd180',
        value: '#efefef',
        type: 'color',
        opacity: false,
        description: '阴影颜色',
        status: true,
      },
      {
        name: '--lt-background-color',
        value: '#f5fafe',
        type: 'color',
        opacity: false,
        description: '主题背景颜色',
        status: true,
      },
      {
        name: '--lt-head-background-color',
        value: '#2459A8',
        type: 'color',
        opacity: false,
        description: 'head背景颜色',
        status: true,
      },
      {
        name: '--lt-head-font-color',
        value: '#FFFFFF',
        type: 'color',
        opacity: false,
        description: 'head字体颜色',
        status: true,
      },
      {
        name: '--lt-menu-background-color',
        // value: '#f2f7ff',
        value: '#fff',
        type: 'color',
        opacity: false,
        description: '菜单背景颜色',
        status: true,
      },
      {
        name: '--lt-menu-active-background-color',
        value: '#F6F9FF',
        type: 'color',
        opacity: false,
        description: '菜单选中背景颜色',
        status: true,
      },
      {
        name: '--lt-menu-font-color',
        value: '#333',
        type: 'color',
        opacity: false,
        description: '菜单字体颜色',
        status: true,
      },
      {
        name: '--lt-menu-active-font-color',
        value: '#487de8',
        type: 'color',
        opacity: false,
        description: '菜单选中字体颜色',
        status: true,
      },
      {
        name: '--lt-tags-color',
        value: '#2e75d2',
        type: 'color',
        opacity: false,
        description: '标签背景颜色',
        status: true,
      },
      {
        name: '--lt-tags-font-color',
        value: '#1f2e43',
        type: 'color',
        opacity: false,
        description: '标签字体颜色',
        status: true,
      },
      {
        name: '--lt-tags-active-font-color',
        value: '#2f69eb',
        type: 'color',
        opacity: false,
        description: '标签选中字体颜色',
        status: true,
      },
      {
        name: '--lt-tips-color',
        value: '#9aa6b8',
        type: 'color',
        opacity: false,
        description: 'tips颜色',
        status: true,
      },
      {
        name: '--lt-attachment-color',
        value: '#4176c0',
        type: 'color',
        opacity: false,
        description: '附件文字颜色',
        status: true,
      },
      {
        name: '--lt-attachment-background-color',
        value: '#deebfc',
        type: 'color',
        opacity: false,
        description: '附件背景颜色',
        status: true,
      },
      {
        name: '--lt-TimeLine-title-color',
        value: '#a2dffc',
        type: 'color',
        opacity: false,
        description: '时间轴文字颜色',
        status: true,
      },
      {
        name: '--lt-tree-color',
        value: '#606266',
        type: 'color',
        opacity: false,
        description: '树形边框颜色',
        status: true,
      },
      {
        name: '--lt-tree-active-color',
        value: '#398bde26',
        type: 'color',
        opacity: false,
        description: '树形边框颜色',
        status: true,
      },
      {
        name: '--lt-tree-border-color',
        value: '#d3dbde',
        type: 'color',
        opacity: false,
        description: '树形边框颜色',
        status: true,
      },
      {
        name: '--lt-tree-background-color',
        value: '#f6f8fa',
        type: 'color',
        opacity: false,
        description: '树形背景颜色',
        status: true,
      },
      {
        name: '--lt-historyCase-label-color',
        value: '#6d7985',
        type: 'color',
        opacity: false,
        description: '树形背景颜色',
        status: true,
      },
      {
        name: '--lt-historyCase-value-color',
        value: '#51565c',
        type: 'color',
        opacity: false,
        description: '树形背景颜色',
        status: true,
      },
      {
        name: '--lt-noIcon-background-color',
        value: '#3cb657',
        type: 'color',
        opacity: false,
        description: '没有icon的背景颜色',
        status: true,
      },
      {
        name: '--lt-mark-red-color',
        value: '#e03f3f',
        type: 'color',
        opacity: false,
        description: '红色mark颜色',
        status: true,
      },
      {
        name: '--lt-mark-blue-color',
        value: '#3db658',
        type: 'color',
        opacity: false,
        description: '绿色mark颜色',
        status: true,
      },
      {
        name: '--lt-mark-green-color',
        value: '#3781d3',
        type: 'color',
        opacity: false,
        description: '蓝色mark颜色',
        status: true,
      },
      {
        name: '--lt-workTicket-background-color',
        value: '#f3f7fe',
        type: 'color',
        opacity: false,
        description: '工单背景颜色',
        status: true,
      },
      {
        name: '--lt-case-header-color',
        value: '#e3ecf8',
        type: 'color',
        opacity: false,
        description: '案件头部颜色',
        status: true,
      },
      {
        name: '--lt-initiative-color',
        value: '#f78336',
        type: 'color',
        opacity: false,
        description: '主动背景颜色',
        status: true,
      },
      {
        name: '--lt-passivity-color',
        value: '#f78336',
        type: 'color',
        opacity: false,
        description: '被动背景颜色',
        status: true,
      },
      {
        name: '--lt-intelligence-color',
        value: '#3cb657',
        type: 'color',
        opacity: false,
        description: '智能背景颜色',
        status: true,
      },
      {
        name: '--lt-label-color',
        value: '#66707b',
        type: 'color',
        opacity: false,
        description: '标签颜色',
        status: true,
      },
      {
        name: '--lt-label-form-color',
        value: '#8992a9',
        type: 'color',
        opacity: false,
        description: '标签颜色2',
        status: true,
      },
      {
        name: '--lt-locationAddress-color',
        value: '#ff0d0d',
        type: 'color',
        opacity: false,
        description: '解析地址颜色',
        status: true,
      },
      {
        name: '--lt-value-color',
        value: '#292e34',
        type: 'color',
        opacity: false,
        description: '值颜色',
        status: true,
      },
      {
        name: '--lt-taskInfo-background-color',
        value: '#f3f7fe',
        type: 'color',
        opacity: false,
        description: '案件内容背景颜色',
        status: true,
      },
      {
        name: '--lt-breadcrumb-background-color',
        value: '#FFFFFF',
        type: 'color',
        opacity: false,
        description: '面包屑背景颜色',
        status: true,
      },
      {
        name: '--lt-breadcrumb-font-color',
        value: '#364159',
        type: 'color',
        opacity: false,
        description: '面包屑字体颜色',
        status: true,
      },
      {
        name: '--lt-breadcrumb-active-font-color',
        value: '#2F69EB',
        type: 'color',
        opacity: false,
        description: '面包屑选中字体颜色',
        status: true,
      },
      {
        name: '--lt-footer-background-color',
        value: '#FFFFFF',
        type: 'color',
        opacity: false,
        description: '底部背景颜色',
        status: true,
      },
      {
        name: '--lt-footer-font-color',
        value: '#9ba0ac',
        type: 'color',
        opacity: false,
        description: '底部字体颜色',
        status: true,
      },
      {
        name: '--lt-theme-background-color',
        value: '#ffffff',
        type: 'color',
        opacity: false,
        description: '面板背景色',
        status: true,
      },
      {
        name: '--lt-department-background-color',
        value: '#fafafa',
        type: 'color',
        opacity: false,
        description: '部门背景色',
        status: true,
      },
      {
        name: '--el-tree-text-color',
        value: '#efefef',
        type: 'color',
        opacity: false,
        description: '部门背景色',
        status: true,
      },
      {
       name: '--el-table-header-bg-color',
       value: '#f5fafe',
       type: 'color',
       opacity: false,
       description: '填充色',
       status: true,
     },
     {
        name: '--lt-deep-blue',
        value: '#2158b1',
        type: 'color',
        opacity: false,
        description: '深蓝色',
        status: true,
      },
      {
        name: '--lt-home-title-blue',
        value: '#c5e2ff',
        type: 'color',
        opacity: false,
        description: '主页案件列表title',
        status: true,
      },
      {
        name: '--lt-home-login-label',
        value: '#acc9f2',
        type: 'color',
        opacity: false,
        description: '主页登录label',
        status: true,
      },
      {
        name: '--el-border-radius-base',
        value: '0',
        type: 'number',
        opacity: false,
        description: '按钮圆角度',
        status: true,
      },
      {
        name: '--lt-tag-border-radius-base',
        value: '0',
        type: 'number',
        opacity: false,
        description: '标签默认圆角度',
        status: false,
      },
      {
        name: '--lt-font-family-medium',
        value: 'SourceHanSansCN-Medium',
        type: 'string',
        opacity: false,
        description: 'Medium字体样式',
        status: true,
      },
      {
        name: '--lt-font-family-bold',
        value: 'SourceHanSansCN-Bold',
        type: 'string',
        opacity: false,
        description: 'Bold字体样式',
        status: true,
      },
      {
        name: '--lt-font-family-normal',
        value: 'SourceHanSansCN-Normal',
        type: 'string',
        opacity: false,
        description: 'Normal字体样式',
        status: true,
      }
    ],
  },
  mutations: {
    getThemeConfig(state, data: any) {
      state.themeConfig = data
    },
    getColorList(state, data: any) {
      state.colorList = data
    },
    TOGGLE_SIDEBAR: (state) => {
      state.themeConfig.isCollapse = state.themeConfig.isCollapse ? 'false' : 'true'
    },
    TOGGLE_TAGS(state) {
      state.themeConfig.isTagsView = state.themeConfig.isTagsView ? 'false' : 'true';
    },
  },
  actions: {
    async setThemeConfig({ commit }, data: ThemeConfigState) {
      return new Promise((reslove)=>{
        themeService.getThemeConfig().then(res=>{
          if(res.code == 200){
            let data = cloneDeep(res.data),json = {} as any
            for(let key in data){
              if(data[key] === 'true' || data[key] === 'false' ){
                json[key] = JSON.parse(data[key])
              }else{
                json[key] = data[key]
              }
            }
            commit('getThemeConfig', json)
            
            reslove(true)
          }
        })
      })
    },
    async setColorList({ commit }, data: ThemeConfigState) {
      return new Promise((reslove)=>{
        themeService.list({
          "pageParams": {
            "pageIndex": 0,
            "pageSize": -1
          },
          searchParams:[]
        }).then(res=>{
          let json = [] as Array<ColorModel>
          if(res.code == 200){
            res.data.data.results.forEach((item:any)=>{
              json.push({
                name: item.themeKey,
                value: item.themeValue,
                type: item.themeType,
                opacity: Boolean(item.themeOpacity === '0'),
                description: item.themeDes,
                status: item.status,
              })
            })
            
            commit('getColorList', json)
            reslove(true)
          }
        })
      })
    },
    async toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
  },
}
export default themeConfigModule
