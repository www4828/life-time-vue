/// <reference types="vite/client" />
/// <reference types="element-plus/global.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'element-plus';

interface ImportMetaEnv{
  readonly VITE_PORT:number,
  readonly VITE_OPEN:boolean,
  readonly VITE_VITE_PUBLIC_PATH:string
}

interface ImportMeta{
  readonly env:ImportMetaEnv
}