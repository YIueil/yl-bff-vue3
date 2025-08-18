<script setup lang="ts">
import { Modal } from '@/utils/modal-manager'
import AboutView, { type AboutViewExpose } from '@/views/AboutView.vue'
import { type ModalInstance, ModalManagerInterface } from '@/types/components/modal.d'
import ModalViewOptions from '@/views/ModalViewOptions.vue'
const showModal = ref(false)
const showFooter = ref(true)
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
      name: '临时隐藏',
      eventName: 'hide',
    }, {
      name: '获取key',
      eventName: 'getKey'
    }, {
      name: '打印当前count',
      eventName: 'print'
    }, {
      name: '增加count',
      eventName: 'increment'
    }],
    on: {
      send: function (ctl: ModalInstance) {
        console.log('send发送, 可能需要拿到ctl做一些操作, 比如拿到ctl中的data中的属性', ctl)
      },
      close: function (ctl: ModalInstance) {
        ctl.close()
      },
      hide: function (ctl: ModalInstance) {
        console.log(`临时隐藏了 key: ${ctl.getKey()}`)
        ctl.hide()
      },
      getKey: function (ctl: ModalInstance) {
        console.log(ctl.getKey())
        // 默认情况下随便调用方法也不会报错, 但是不推荐, 容易出错
        console.log(ctl.contentComponent?.func())
      },
      print: (ctl: ModalInstance<AboutViewExpose>) => {
        console.log(ctl.contentComponent?.getCount())
        console.log(ctl.contentComponent?.count)
      },
      increment: (ctl: ModalInstance<AboutViewExpose>) => {
        ctl.contentComponent?.increment()
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
  <button @click="console.log(modal?.listModal())">打印所有的Modal信息</button>
  <button @click="console.log(modal?.getModalEntryMap())">打印ModalEntryMap</button>
  <br/>
  <button @click="showModal = true">弹出Modal</button>
  <button @click="openModalByFunction">API弹出Modal1</button>
  <button @click="openModalByFunction2">API弹出Modal2</button>
  <button @click="openModalByFunction3">API弹出Modal3</button>
  <button @click="openModalByFunction4">API弹出Modal4</button>
  <button @click="closeAll">关闭所有</button>
  <YlModal :key="modelKey" :visible="showModal" :show-footer="showFooter" :show-mask="true" @ok="showFooter = !showFooter" @close="showModal = false; modelKey++;">
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