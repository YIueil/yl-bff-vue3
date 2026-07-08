import type { Component, ComponentPublicInstance, VNode } from 'vue'
import type { ComponentWithUnknownProps } from '@/types'

declare const modalTrustedHtmlBrand: unique symbol
export type ModalKey = string | number

export type ModalTrustedHtml = {
  readonly html: string
  readonly [modalTrustedHtmlBrand]: true
}

export class ModalManagerInterface {
  public getModal(key: ModalKey): ModalObject | undefined
  public listModal(): IterableIterator<ModalObject>
  public getModalEntryMap(): ReadonlyMap<ModalKey, ModalObject>
  /** 标记可信 HTML 以跳过文本转义；该方法不会清洗传入内容。 */
  public trustedHtml(html: string): ModalTrustedHtml
  public open<T = any>(options: ModalOptions<T>): ModalInstance
  public close(key: ModalKey): void
  public closeAll(): void
  public hide(key: ModalKey): void
  public show(key: ModalKey): void
  /** 登记最小化窗口，用于底部等距排列。 */
  public registerMinimized(key: ModalKey): void
  /** 取消最小化登记。 */
  public unregisterMinimized(key: ModalKey): void
  /** 返回响应式的最小化窗口 key 列表。 */
  public getMinimizedKeys(): ModalKey[]
  /** 返回指定 key 在最小化列表中的下标。 */
  public getMinimizedIndex(key: ModalKey): number
}

export interface ModalInstance<T = ComponentWithUnknownProps> {
  readonly showModal?: boolean
  getKey: () => ModalKey
  close: () => void
  closeAll: () => void
  hide: () => void
  contentComponent?: ComponentPublicInstance & T
  currentInstance?: ComponentPublicInstance & T
}

export type EventHandler<T = any> = (ctl: T) => void

export type ModalObject = {
  key: ModalKey
  options: ModalOptions
  visible: boolean
  showModal: boolean
  contentComponent?: ComponentPublicInstance
  mountNode?: HTMLElement
  modalInstance: ModalInstance
}

export type ButtonAndEvent = {
  name: string
  eventName: string
  icon: string
  type: 'primary' | 'danger' | 'default'
}

export type ModalOptions<T = any> = {
  // 唯一标识
  key?: ModalKey
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
  title?: string | VNode | ModalTrustedHtml
  component?: string | Component | VNode | (() => VNode) | ModalTrustedHtml
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
