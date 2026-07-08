<script lang="ts">
import {
  Fragment,
  defineComponent,
  h,
  isVNode,
  onBeforeUnmount,
  onMounted,
  resolveComponent,
  type ComponentPublicInstance,
  type VNode
} from 'vue'
import YlModal from '@/components/Modal/YlModal.vue'
import type { ModalObject } from '@/types/components/modal'
import { isModalTrustedHtml, Modal } from '@/utils/modal-manager'

const renderHeader = (modalEntry: ModalObject): VNode | null => {
  const { title } = modalEntry.options
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

const renderBody = (modalEntry: ModalObject): VNode => {
  const { component, componentProps } = modalEntry.options
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
  if (typeof component === 'function') {
    return (component as () => VNode)()
  }
  return h(component, {
    ...componentProps,
    ref: (instance: ComponentPublicInstance | null) => {
      Modal.setContentComponent(modalEntry.key, instance ?? undefined)
    }
  })
}

const renderFooter = (modalEntry: ModalObject): VNode | null => {
  const { footer, on: onEvent } = modalEntry.options
  if (!footer) {
    return null
  }
  if (Array.isArray(footer)) {
    return h(
      resolveComponent('a-space'),
      { size: 'small' },
      {
        default: () =>
          footer.map((button) =>
            h(
              resolveComponent('a-button'),
              {
                type: button.type || 'default',
                onClick: () => Modal.onEvent(modalEntry.key, button.eventName, onEvent)
              },
              { default: () => button.name }
            )
          )
      }
    )
  }
  return isVNode(footer) ? footer : h(footer)
}

const renderModal = (modalEntry: ModalObject): VNode => {
  const options = modalEntry.options
  return h(
    'div',
    {
      key: modalEntry.key,
      class: 'yl-modal-host',
      'data-modal-key': String(modalEntry.key),
      ref: (node: Element | ComponentPublicInstance | null) => {
        Modal.setMountNode(modalEntry.key, node instanceof HTMLElement ? node : undefined)
      }
    },
    [
      h(
        YlModal,
        {
          visible: modalEntry.visible,
          show: modalEntry.showModal,
          modalKey: modalEntry.key,
          showMask: options.showMask,
          showHeader: options.showHeader,
          showBody: true,
          showFooter: options.showFooter,
          clickMaskClose: options.clickMaskClose,
          isTeleport: options.isTeleport,
          parent: options.parent,
          resizable: options.resizable,
          draggable: options.draggable,
          onEvent: (eventName: string) => Modal.onEvent(modalEntry.key, eventName, options.on)
        },
        {
          header: () => renderHeader(modalEntry),
          body: () => renderBody(modalEntry),
          footer: () => renderFooter(modalEntry)
        }
      )
    ]
  )
}

export default defineComponent({
  name: 'YlModalHost',
  setup() {
    const hostId = Symbol('YlModalHost')

    onMounted(() => {
      Modal.registerHost(hostId)
    })
    onBeforeUnmount(() => {
      Modal.unregisterHost(hostId)
    })

    return () => h(Fragment, [...Modal.getModalEntryMap().values()].map(renderModal))
  }
})
</script>
