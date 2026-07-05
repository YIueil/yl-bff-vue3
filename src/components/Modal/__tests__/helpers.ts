import { mount, type ComponentMountingOptions } from '@vue/test-utils'
import { defineComponent, type Component } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import YlModalHost from '@/components/Modal/YlModalHost.vue'

// stub Vue3DraggableResizable，避免 DOM 测量报错
const Vue3DraggableResizableStub = defineComponent({
  name: 'Vue3DraggableResizable',
  props: [
    'x',
    'y',
    'w',
    'h',
    'active',
    'draggable',
    'resizable',
    'parent',
    'handles',
    'initW',
    'initH'
  ],
  emits: [
    'update:x',
    'update:y',
    'update:w',
    'update:h',
    'update:active',
    'activated',
    'deactivated',
    'drag-start',
    'drag-end',
    'dragging',
    'resize-start',
    'resize-end',
    'resizing'
  ],
  template: '<div class="vdr-stub"><slot /></div>'
})

// stub unplugin 图标
const IconStub = defineComponent({
  name: 'IconStub',
  template: '<span class="icon-stub" />'
})

export interface MountOptions extends ComponentMountingOptions<any> {
  withHost?: boolean
}

export function mountWithApp(component: Component, options: MountOptions = {}) {
  const { withHost = true, ...rest } = options
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { render: () => null } }]
  })
  const pinia = createPinia()

  const globalConfig = {
    plugins: [pinia, router, Antd],
    stubs: {
      Vue3DraggableResizable: Vue3DraggableResizableStub,
      'i-mdi-minus': IconStub,
      'i-mdi-resize': IconStub,
      'i-mdi-window-maximize': IconStub,
      'i-mdi-window-restore': IconStub,
      'i-mdi-close': IconStub
    },
    ...(rest.global as object)
  }

  const wrapper = mount(component, {
    ...rest,
    global: globalConfig,
    attachTo: document.body
  })
  mountedWrappers.push(wrapper)

  if (withHost) {
    const hostWrapper = mount(YlModalHost, {
      global: globalConfig,
      attachTo: document.body
    })
    mountedWrappers.push(hostWrapper)
    return { wrapper, hostWrapper, pinia, router }
  }
  return { wrapper, pinia, router }
}

const mountedWrappers: Array<{ unmount: () => void }> = []

export function cleanupBody() {
  for (const w of mountedWrappers) {
    try {
      w.unmount()
    } catch {
      // 忽略已卸载的
    }
  }
  mountedWrappers.length = 0
  document.body.innerHTML = ''
}
