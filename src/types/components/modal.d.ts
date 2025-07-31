import { type Component, type VNode } from 'vue'
import type { ComponentWithUnknownProps } from '@/types'

export interface ModalInstance<T = ComponentWithUnknownProps> {
  showModal?: boolean,
  getKey: () => string | number
  close: () => void,
  closeAll: () => void,
  hide: () => void,
  contentComponent?: ComponentPublicInstance & T,
  currentInstance?: ComponentPublicInstance & T
}

export interface ModalAppExport<T = ComponentWithUnknownProps> {
  showModal?: boolean,
  contentComponent?: ComponentPublicInstance & T,
  currentInstance?: ComponentPublicInstance & T
}

export type EventHandler<T = any> = (ctl: T) => void

export class ModalManagerInterface {

  public open<T = any>(options: ModalOptions<T>): ModalInstance

  public close(key: string | number): void

  public closeAll(): void

  public hide(key: string | number): void

  public show(key: string | number): void
}

export type ButtonAndEvent = {
  name: string,
  eventName: string,
  icon: string,
  type: 'primary' | 'danger' | 'default'
}

export type ModalOptions<T = any> = {
  // 唯一标识
  key?: string | number
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
  component?: string | Component | (() => VNode) // 支持组件或渲染函数
  footer?: Component | VNode | ButtonAndEvent[]

  // 组件props
  componentProps?: T

  // 事件
  on?: {
    [key: string]: EventHandler
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $modal: ModalManagerInterface
  }
}