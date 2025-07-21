import { createApp, h } from 'vue'
import type { App, Component } from 'vue'
import YlModal from '@/components/YlModal.vue'
import type { ModalInstance, ModalOptions, ModalManagerInterface } from '@/types/components/modal'
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
    if (!key) {
      key = Math.random()
    }
    // 统一挂载到名为 modal-div 这个类名的 div 下
    let mountNode = document.getElementsByClassName('modal-div')[0]
    if (!mountNode) {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)
    }

    // 渲染内容函数
    const renderBody = () => {
      // 为空时返回 null
      if (!options.body) {
        return null
      }

      // 处理渲染函数
      if (typeof options.body === 'function') {
        try {
          // 尝试作为渲染函数执行 TODO 学习 h() 函数后再完善
          const result = options.body();
          if (result && (result as any).__v_isVNode) {
            return result as VNode;
          }
          // 如果是组件构造函数，继续下面的处理
        } catch {
          // 如果执行出错，说明是组件构造函数
        }
      }

      // 如果是组件
      if (typeof options.body === 'object') {
        return h(options.body, {
          ...options.componentProps,
          onClose: () => this.close(key),
          onCloseAll: () => this.closeAll(),
          onEvent: (event: string, payload?: any) => {
            options.onComponentEvent?.(event, payload)
          }
        })
      }
      console.error('渲染body失败', options.body)
    }

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
            onClose: () => {
              options.onClose?.()
              this.close()
            }
          },
          {
            header: options.title ? typeof options.title === 'function' ? options.title : () => options.title as string : undefined,
            body: renderBody,
            footer: options.footer ? typeof options.footer === 'function' ? options.footer : () => h(options.footer as Component) : undefined
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

