import type { App } from 'vue'
import { createApp, h, isVNode } from 'vue'
import YlModal from '@/components/Modal/YlModal.vue'
import type {
  EventHandler,
  ModalInstance,
  ModalManagerInterface,
  ModalObject,
  ModalOptions,
  ModalTrustedHtml
} from '@/types/components/modal'
// 第三方拖拽组件
import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

const trustedHtmlBrand = Symbol('ModalTrustedHtml')

const isModalTrustedHtml = (value: unknown): value is ModalTrustedHtml => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<PropertyKey, unknown>)[trustedHtmlBrand] === true
  )
}

export class ModalManager implements ModalManagerInterface {
  private static instance: ModalManager
  // Modal实例Map
  private modalEntryMap: Map<string | number, ModalObject> = new Map()

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
    // ModalInstance 对象
    let { key } = options
    if (!key) {
      key = Math.random()
    }
    const modalEntry = this.modalEntryMap.get(key)
    if (modalEntry) {
      this.show(key)
      return {
        getKey: () => key,
        close: () => this.close(key),
        closeAll: () => this.closeAll(),
        hide: () => this.hide(key)
      }
    }
    const { title, component, footer, on: onEvent } = options

    // 每个 Modal 使用独立挂载节点，确保 app 和 DOM 资源一一对应
    const mountNode = document.createElement('div')
    mountNode.className = 'yl-modal-host'
    mountNode.dataset.modalKey = String(key)
    document.body.appendChild(mountNode)

    // 渲染函数
    const renderHeader = (): VNode | null => {
      if (!title) {
        return null
      }
      if (typeof title === 'string') {
        return h('div', title)
      }
      if (isModalTrustedHtml(title)) {
        return h('div', {
          innerHTML: title.html
        })
      }
      return title
    }
    const renderBody = (): VNode => {
      // 为渲染一个空 div 节点
      if (!component) {
        return h('div')
      }

      if (isVNode(component)) {
        return component
      }

      if (isModalTrustedHtml(component)) {
        return h('div', {
          innerHTML: component.html
        })
      }

      if (typeof component === 'string') {
        return h('div', component)
      }

      // 处理 h() 渲染函数
      if (typeof component === 'function') {
        return (component as () => VNode)()
      }

      // 如果是组件
      if (typeof component === 'object') {
        return h(component, {
          ...options.componentProps,
          ref: 'contentComponent'
        })
      }
      return h('div')
    }
    const renderFooter = (): VNode | null => {
      if (!footer) {
        return null
      }
      if (Array.isArray(footer)) {
        return h(
          'div',
          {
            className: 'modal-footer-container'
          },
          footer.map((btn) =>
            h(
              'button',
              {
                class: ['modal-btn', `modal-btn-${btn.type || 'default'}`],
                onClick: () => this.onEvent(key, btn.eventName, onEvent)
              },
              btn.name
            )
          )
        )
      }
      return h(footer)
    }

    const modalApp = createApp({
      setup() {
        const currentInstance = getCurrentInstance()
        const contentComponent = ref(null)
        // 初始不展示, 为了保证动画能够正常加载, 挂载后再进行展示
        const visible = ref(false)
        // 控制临时隐藏 Modal 组件
        const showModal = ref(true)
        // 在挂载后，我们可以改变这个值
        onMounted(() => {
          // 挂载后，我们可以将visible改为true，这样模态框就会显示
          visible.value = true
        })
        // 返回值会暴露给模板和其他的选项式 API 钩子
        return {
          // 这里如果增加东西, 最好扩展到 ModalInstance 这个接口中
          currentInstance,
          contentComponent,
          visible,
          showModal
        }
      },
      render() {
        return h(
          YlModal,
          {
            visible: this.visible,
            show: this.showModal,
            showMask: options.showMask,
            showHeader: options.showHeader,
            showBody: true,
            showFooter: options.showFooter,
            clickMaskClose: options.clickMaskClose,
            isTeleport: options.isTeleport,
            parent: options.parent,
            resizable: options.resizable,
            draggable: options.draggable,
            onEvent: (eventName: string) => this.onEvent(eventName)
          },
          {
            header: () => renderHeader(),
            body: () => renderBody(),
            footer: () => renderFooter()
          }
        )
      },
      methods: {
        getKey: () => key,
        hide: () => this.hide(key),
        close: () => this.close(key),
        closeAll: () => this.closeAll(),
        onEvent: (eventName: string) => this.onEvent(key, eventName, onEvent)
      }
    })
    modalApp.use(Vue3DraggableResizable)
    let modalContext: ComponentPublicInstance
    try {
      modalContext = modalApp.mount(mountNode)
    } catch (mountError) {
      try {
        modalApp.unmount()
      } catch (cleanupError) {
        console.error(`Modal挂载失败后的卸载清理异常, key: ${key}`, cleanupError)
      } finally {
        mountNode.remove()
      }
      throw mountError
    }
    const modalInstance = {
      getKey: () => key,
      close: () => this.close(key),
      closeAll: () => this.closeAll(),
      hide: () => this.hide(key)
    }
    this.modalEntryMap.set(key, {
      app: modalApp,
      mountNode: mountNode,
      modalContext: modalContext,
      modalInstance: modalInstance
    })
    return modalInstance
  }

  public onEvent(
    key: string | number,
    eventName: string,
    onEvent?: {
      [p: string]: EventHandler
    }
  ) {
    const modalEntry = this.modalEntryMap.get(key)
    if (!modalEntry) {
      console.warn(`未知的窗口key: ${key}`)
      return
    }
    const { modalContext } = modalEntry
    // 触发事件
    // console.log('onEvent', eventName, modalContext)
    const callback = onEvent?.[eventName]
    if (callback) {
      callback(modalContext)
      return
    } else {
      // 提供一些默认的事件实现, 如关闭事件默认关闭窗口
      switch (eventName) {
        case 'close':
          this.close(key)
          break
        default:
          console.error(`Model声明未实现的事件${eventName}, key: ${key}`)
      }
    }
  }

  public getModal(key: string | number): ModalObject | undefined {
    return this.modalEntryMap.get(key)
  }

  public listModal(): IterableIterator<ModalObject> {
    return this.modalEntryMap.values()
  }

  public getModalEntryMap() {
    return this.modalEntryMap
  }

  public hide(key: string | number) {
    const modalEntry = this.modalEntryMap.get(key)
    if (!modalEntry) return

    const { modalContext } = modalEntry
    modalContext.showModal = false
  }

  public show(key: string | number) {
    const modalEntry = this.modalEntryMap.get(key)
    if (!modalEntry) return

    const { modalContext } = modalEntry
    modalContext.showModal = true
  }

  public close(key: string | number): void {
    const modalEntry = this.modalEntryMap.get(key)
    if (!modalEntry) return

    this.modalEntryMap.delete(key)
    const { app, mountNode } = modalEntry
    try {
      app.unmount()
    } finally {
      mountNode.remove()
    }
  }

  public closeAll(): void {
    const keys = [...this.modalEntryMap.keys()]
    const closeErrors: unknown[] = []
    for (const key of keys) {
      try {
        this.close(key)
      } catch (error) {
        closeErrors.push(error)
      }
    }
    if (closeErrors.length > 0) {
      throw closeErrors[0]
    }
  }
}

const modalManagerInstance = ModalManager.getInstance()

// 导出安装函数, 实现Vue插件所需的 install(app: App) 方法
export const ModalPlugin = {
  install(app: App) {
    // 注册全局属性
    app.config.globalProperties.$modal = modalManagerInstance

    // 组合式 API 使用
    app.provide('modal', modalManagerInstance)
  }
}

// 支持局部注册导入使用
export const Modal = modalManagerInstance
