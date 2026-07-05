import type { App, ComponentPublicInstance } from 'vue'
import { nextTick, shallowReactive } from 'vue'
import type {
  EventHandler,
  ModalInstance,
  ModalKey,
  ModalManagerInterface,
  ModalObject,
  ModalOptions,
  ModalTrustedHtml
} from '@/types/components/modal'

const trustedHtmlBrand = Symbol('ModalTrustedHtml')

export const isModalTrustedHtml = (value: unknown): value is ModalTrustedHtml => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<PropertyKey, unknown>)[trustedHtmlBrand] === true
  )
}

export class ModalManager implements ModalManagerInterface {
  private static instance: ModalManager
  private modalEntryMap = shallowReactive(new Map<ModalKey, ModalObject>())
  private hostIds = new Set<symbol>()

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager()
    }
    return ModalManager.instance
  }

  public trustedHtml(html: string): ModalTrustedHtml {
    return Object.freeze({
      html,
      [trustedHtmlBrand]: true
    }) as unknown as ModalTrustedHtml
  }

  public open<T = any>(options: ModalOptions<T>): ModalInstance {
    const key = options.key ?? Math.random()
    const existingEntry = this.modalEntryMap.get(key)
    if (existingEntry) {
      this.show(key)
      return existingEntry.modalInstance
    }

    if (import.meta.env.DEV && this.hostIds.size === 0) {
      console.warn('未检测到 YlModalHost，API Modal 将在 Host 挂载后渲染')
    }

    const getEntry = () => this.modalEntryMap.get(key)
    const modalInstance: ModalInstance = {
      get showModal() {
        return getEntry()?.showModal
      },
      get contentComponent() {
        return getEntry()?.contentComponent
      },
      getKey: () => key,
      close: () => this.close(key),
      closeAll: () => this.closeAll(),
      hide: () => this.hide(key)
    }
    const modalEntry: ModalObject = shallowReactive({
      key,
      options: options as ModalOptions,
      visible: false,
      showModal: true,
      contentComponent: undefined,
      mountNode: undefined,
      modalInstance
    })
    this.modalEntryMap.set(key, modalEntry)

    void nextTick(() => {
      if (this.modalEntryMap.get(key) === modalEntry) {
        modalEntry.visible = true
      }
    })

    return modalInstance
  }

  public onEvent(key: ModalKey, eventName: string, onEvent?: Record<string, EventHandler>): void {
    const modalEntry = this.modalEntryMap.get(key)
    if (!modalEntry) {
      console.warn(`未知的窗口key: ${key}`)
      return
    }

    const callback = onEvent?.[eventName]
    if (callback) {
      callback(modalEntry.modalInstance)
      return
    }

    if (eventName === 'close') {
      this.close(key)
      return
    }
    console.error(`Modal声明未实现的事件${eventName}, key: ${key}`)
  }

  public getModal(key: ModalKey): ModalObject | undefined {
    return this.modalEntryMap.get(key)
  }

  public listModal(): IterableIterator<ModalObject> {
    return this.modalEntryMap.values()
  }

  public getModalEntryMap(): ReadonlyMap<ModalKey, ModalObject> {
    return this.modalEntryMap
  }

  public setContentComponent(key: ModalKey, component: ComponentPublicInstance | undefined): void {
    const modalEntry = this.modalEntryMap.get(key)
    if (modalEntry) {
      modalEntry.contentComponent = component
    }
  }

  public setMountNode(key: ModalKey, mountNode: HTMLElement | undefined): void {
    const modalEntry = this.modalEntryMap.get(key)
    if (modalEntry) {
      modalEntry.mountNode = mountNode
    }
  }

  public registerHost(hostId: symbol): void {
    if (import.meta.env.DEV && this.hostIds.size > 0 && !this.hostIds.has(hostId)) {
      console.warn('检测到多个 YlModalHost，同一个 API Modal 将被重复渲染')
    }
    this.hostIds.add(hostId)
  }

  public unregisterHost(hostId: symbol): void {
    this.hostIds.delete(hostId)
    if (this.hostIds.size === 0) {
      this.modalEntryMap.clear()
    }
  }

  public hide(key: ModalKey): void {
    const modalEntry = this.modalEntryMap.get(key)
    if (modalEntry) {
      modalEntry.showModal = false
    }
  }

  public show(key: ModalKey): void {
    const modalEntry = this.modalEntryMap.get(key)
    if (modalEntry) {
      modalEntry.showModal = true
    }
  }

  public close(key: ModalKey): void {
    this.modalEntryMap.delete(key)
  }

  public closeAll(): void {
    const keys = [...this.modalEntryMap.keys()]
    for (const key of keys) {
      this.close(key)
    }
  }
}

const modalManagerInstance = ModalManager.getInstance()

export const ModalPlugin = {
  install(app: App) {
    app.config.globalProperties.$modal = modalManagerInstance
    app.provide('modal', modalManagerInstance)
  }
}

export const Modal = modalManagerInstance
