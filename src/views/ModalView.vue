<script setup lang="ts">
import { Modal } from '@/utils/modal-manager'
import AboutView from '@/views/AboutView.vue'
import { type ModalInstance, ModalManagerInterface } from '@/types/components/modal'
import ModalViewOptions from '@/views/ModalViewOptions.vue'
const showModal = ref(false)
const modelKey = ref(0)

// 通过全局定义调用
const modal = inject<ModalManagerInterface>('modal')

let instance: ModalInstance | null = null

const closeAll = function () {
  instance?.closeAll()
}

const openModalByFunction = function () {
  let modalInstance: ModalInstance | null = null
  modalInstance = Modal.open({
    key: '第一个API窗体',
    title: '第一个API窗体',
    showMask: true,
    showHeader: true,
    component: AboutView,
    componentProps: {
      userName: '张三'
    },
    footer: [{
      name: '确认',
      eventName: 'ok'
    }, {
      name: '取消',
      eventName: 'cancel'
    }],
    on: {
      ok: function (ctl: any) {
        console.log('确认, 可能需要拿到ctl做一些操作, 比如拿到ctl中的data中的属性', ctl)
      },
      cancel: function (ctl: any) {
        console.log('取消, 可能需要拿到ctl做一些操作, 比如拿到ctl中的data中的属性', ctl)
      }
    }
  })
  instance = modalInstance
}

const openModalByFunction2 = function () {
  let modalInstance: ModalInstance | null = null
  modalInstance = Modal.open({
    key: '第二个API窗体',
    title: '第二个API窗体',
    showFooter: false,
    component: () => h(`div`, {
      style: {
        background: 'green'
      },
      innerHTML: '第二个API窗体, 通过h函数渲染'
    }),
    onClose: () => modalInstance?.close()
  })
}

const openModalByFunction3 = function () {
  let modalInstance: ModalInstance | null = null
  modalInstance = Modal.open({
    key: '第三个API窗体',
    title: '第三个API窗体',
    component: `<div style="background: green">第三个API窗体, 单纯的String</div>`,
    onClose: () => modalInstance?.close()
  })
}

const openModalByFunction4 = function () {
  let modalInstance: ModalInstance
  modalInstance = modal?.open({
    key: '第四个API窗体',
    component: AboutView,
    componentProps: {
      userName: '第四个API窗体'
    },
    showMask: true,
    showHeader: true,
    onClose: () => modalInstance?.close()
  }) as ModalInstance
}
</script>

<template>
  <button @click="showModal = true">弹出Modal</button>
  <button @click="openModalByFunction">API弹出Modal1</button>
  <button @click="openModalByFunction2">API弹出Modal2</button>
  <button @click="openModalByFunction3">API弹出Modal3</button>
  <button @click="openModalByFunction4">API弹出Modal4</button>
  <button @click="closeAll">关闭所有</button>
  <YlModal :key="modelKey" :show="showModal" :show-mask="true" @close="showModal = false; modelKey++;">
    <template v-slot:header>
      弹出框标题很长很长很长很长很长很长很长很长很长很长很长很长很长很长
    </template>
    <template v-slot:body>
      <AboutView />
    </template>
  </YlModal>
  <ModalViewOptions />
</template>

<style scoped>

</style>