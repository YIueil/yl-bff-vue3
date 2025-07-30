<script setup lang="ts">
import { Modal } from '@/utils/modal-manager'
import AboutView from '@/views/AboutView.vue'
import { ModalManagerInterface } from '@/types/components/modal'
import ModalViewOptions from '@/views/ModalViewOptions.vue'
const showModal = ref(false)
const modelKey = ref(0)

// 通过全局定义调用
const modal = inject<ModalManagerInterface>('modal')

const closeAll = function () {
  Modal.closeAll()
}

const openModalByFunction = function () {
  Modal.open({
    key: '第一个API窗体',
    title: '第一个API窗体',
    showMask: true,
    showHeader: true,
    component: AboutView,
    componentProps: {
      userName: '张三'
    },
    footer: [{
      name: '发送',
      eventName: 'send'
    }, {
      name: '关闭',
      eventName: 'close'
    }, {
      name: '获取key',
      eventName: 'getKey'
    }],
    on: {
      send: function (ctl: any) {
        console.log('send发送, 可能需要拿到ctl做一些操作, 比如拿到ctl中的data中的属性', ctl)
      },
      close: function (ctl: any) {
        ctl.close()
      },
      getKey: function (ctl: any) {
        console.log(ctl.getKey())
      },
      btnClick: function (ctl: any) {
        debugger
      }
    }
  })
}

const openModalByFunction2 = function () {
  Modal.open({
    key: '第二个API窗体',
    title: '第二个API窗体',
    showFooter: false,
    component: () => h(`div`, {
      style: {
        background: 'green'
      },
      innerHTML: '第二个API窗体, 通过h函数渲染'
    })
  })
}

const openModalByFunction3 = function () {
  Modal.open({
    key: '第三个API窗体',
    title: '第三个API窗体',
    component: `<div style="background: green">第三个API窗体, 单纯的String</div>`
  })
}

const openModalByFunction4 = function () {
  modal?.open({
    key: '第四个API窗体',
    component: AboutView,
    componentProps: {
      userName: '第四个API窗体'
    },
    showMask: true,
    showHeader: true
  })
}
</script>

<template>
  <button @click="showModal = true">弹出Modal</button>
  <button @click="openModalByFunction">API弹出Modal1</button>
  <button @click="openModalByFunction2">API弹出Modal2</button>
  <button @click="openModalByFunction3">API弹出Modal3</button>
  <button @click="openModalByFunction4">API弹出Modal4</button>
  <button @click="closeAll">关闭所有</button>
  <YlModal :key="modelKey" :show="showModal" :show-mask="true" @ok="showModal = false; modelKey++;" @close="showModal = false; modelKey++;">
    <template v-slot:header>
      弹出框标题很长很长很长很长很长很长很长很长很长很长很长很长很长很长
    </template>
    <template v-slot:body>
      <AboutView userName="外部传入用户" @btnClick="showModal = false; modelKey++;" />
    </template>
  </YlModal>
  <ModalViewOptions />
</template>

<style scoped>

</style>