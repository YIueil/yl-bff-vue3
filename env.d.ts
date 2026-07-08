/// <reference types="vite/client" />
import type { ModalManagerInterface } from './src/types/components/modal'

export {}

declare module 'vue' {
  export interface GlobalComponents {
    Vue3DraggableResizable: typeof import('vue3-draggable-resizable')['default']
  }

  interface ComponentCustomProperties {
    $modal: ModalManagerInterface
  }
}

// 客户端环境变量类型补充，避免业务代码使用散落的类型断言。
declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
  }
}
