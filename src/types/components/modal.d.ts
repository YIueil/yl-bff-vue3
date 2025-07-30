import { type Component, type DefineComponent, type VNode } from 'vue'

export interface ModalInstance {
  close: () => void,
  closeAll: () => void
}

export class ModalManagerInterface {

  public open<T = any>(options: ModalOptions<T>): ModalInstance

  public close(key: string | number): void

  public closeAll(): void
}

export type ModalOptions<T = any> = {
  // 唯一标识
  key?: string | number | null
  // 基础配置
  showMask?: boolean
  showHeader?: boolean
  showFooter?: boolean
  clickMaskClose?: boolean
  isTeleport?: boolean
  parent?: boolean
  resizable?: boolean
  draggable?: boolean

  // 主体内容
  title?: string | VNode
  body?: string | Component | (() => VNode) // 支持组件或渲染函数
  footer?: Component | VNode

  // 组件props
  componentProps?: T

  // 事件
  onClose?: () => void,
  onCloseAll?: () => void,
  onComponentEvent?: (event: string, payload?: any) => void
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $modal: ModalManagerInterface
  }
}