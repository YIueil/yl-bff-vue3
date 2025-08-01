/// <reference types="vite/client" />
export {}

declare module 'vue' {
  export interface GlobalComponents {
    Vue3DraggableResizable: typeof import('vue3-draggable-resizable')['default']
  }
}