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
