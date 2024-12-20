import { ConfigEnv, defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { svgBuilder } from './src/plugins/svgBuilder'
import topLevelAwait from 'vite-plugin-top-level-await'
import { createHtmlPlugin } from 'vite-plugin-html'

const pathResolve = (dir: string): any => {
  return resolve(__dirname, '.', dir)
}
const alias: Record<string, string> = {
  '@': pathResolve('./src/'),
  '@public': pathResolve('./public'),
}

const viteConfig = defineConfig((mode: ConfigEnv) => {
  const env = loadEnv(mode.mode, process.cwd())
  return {
    define: {
      'process.env': {
        BASE_API: '/',
      },
    },
    plugins: [
      vue(),
      svgBuilder('./src/assets/svg/'),
      topLevelAwait({
        // The export name of top-level await promise for each chunk module
        promiseExportName: '__tla',
        // The function to generate import names of top-level await promise in each chunk module
        promiseImportName: (i) => `__tla_${i}`,
      }),
      createHtmlPlugin({
        /**
         * 需要注入 index.html ejs 模版的数据
         */
        inject: {
          data: {
            VITE_APP_BASE_DISTRICT: env.VITE_APP_BASE_DISTRICT,  
          },
        },
      })
    ],
    root: process.cwd(),
    resolve: { alias },
    base: env.VITE_BASE_PATH,
    server: {
      host: '0.0.0.0',
      port: env.VITE_PORT as unknown as number,
      open: true,
      proxy: {
        '/api': {
          target: 'http://47.97.163.17:8081',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/sysUrl': {
          target: 'http://8.155.10.223/lifetime-api/lifetime-manager-server',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/sysUrl/, ''),
        },
        '/mediaUrl': {
          target: 'https://cy.fengxian.gov.cn/file-service',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/mediaUrl/, ''),
        },
        '/sms': {
          target: 'https://12319.shucm.cn/gateway-server/hotline-sms-service',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/sms/, ''),
        }
      },
    },
    build: {},
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: "@import 'src/theme/index.scss';",
        },
      },
    },
  }
})

export default viteConfig
