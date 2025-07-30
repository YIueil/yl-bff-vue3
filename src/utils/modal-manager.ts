import type { App } from 'vue'
import { createApp, h, isVNode } from 'vue'
import YlModal from '@/components/YlModal.vue'
import type { ModalInstance, ModalManagerInterface, ModalOptions } from '@/types/components/modal'
// 第三方拖拽组件
import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

export class ModalManager implements ModalManagerInterface {
  private static instance: ModalManager
  // Modal实例Map
  private modalAppMap: Map<string | number, App> = new Map<string | number, App>()

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager()
    }
    return ModalManager.instance
  }

  public open<T = any>(options: ModalOptions<T>): ModalInstance {
    let { key } = options
    const { title, component, footer } = options

    // 统一挂载到名为 modal-div 这个类名的 div 下
    let mountNode = document.getElementsByClassName('modal-div')[0]
    if (!mountNode) {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)
    }
    if (!key) {
      key = Math.random()
    }

    // 渲染函数
    const renderHeader = (): VNode | null => {
      if (!title) {
        return null
      }
      if (typeof title === 'string') {
        return h('div', {
          innerHTML: title
        })
      }
      return h(title)
    }
    const renderBody = (): VNode => {
      console.log(component, typeof component)
      // 为渲染一个空 div 节点
      if (!component) {
        return h('div')
      }

      if (isVNode(component)) {
        return component
      }

      if (typeof component === 'string') {
        // 使用 h() 函数进行渲染
        return h('div', {
          innerHTML: component
        })
      }

      // 处理 h() 渲染函数
      if (typeof component === 'function') {
        return (component as Function)()
      }

      // 如果是组件
      if (typeof component === 'object') {
        return h(component, {
          ...options.componentProps,
          onClose: () => this.close(key),
          onCloseAll: () => this.closeAll()
        })
      }
      return h('div')
    }
    const renderFooter = (): VNode | null => {
      if (!footer) {
        return null
      }
      return h(footer)
    }
    const renderHeaderVNode = renderHeader()
    const renderBodyVNode = renderBody()
    const renderFooterVNode = renderFooter()
    const modalApp = createApp({
      render() {
        return h(
          YlModal,
          {
            show: true,
            showMask: options.showMask,
            showHeader: options.showHeader !== false,
            showBody: true,
            showFooter: options.showFooter !== false,
            clickMaskClose: options.clickMaskClose,
            isTeleport: options.isTeleport,
            parent: options.parent,
            resizable: options.resizable,
            draggable: options.draggable,
            onEvent: (eventName: string) => {
              const callback = options.on?.[eventName]
              if (callback) {
                // 关键: 将内容组件实例传递给回调 TODO 传入 Ctl
                callback(null)
              } else {
                console.error('Model声明未实现的事件', eventName)
              }
            }
          },
          {
            header: () => renderHeaderVNode,
            body: () => renderBodyVNode,
            footer: () => renderFooterVNode
          }
        )
      },
      methods: {
        close: () => {
          console.log('销毁Modal的createApp上下文', modalApp)
        }
      }
    })
    modalApp.use(Vue3DraggableResizable)
    modalApp.mount(mountNode)
    this.modalAppMap.set(key, modalApp)

    return {
      close: () => this.close(key),
      closeAll: () => this.closeAll()
    }
  }

  public close(key: string | number): void {
    const modalApp = this.modalAppMap.get(key)
    if (modalApp) {
      modalApp.unmount()
      modalApp._container?.remove()
      this.modalAppMap.delete(key)
    }
  }

  public closeAll(): void {
    for (const key of this.modalAppMap.keys()) {
      this.close(key)
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
