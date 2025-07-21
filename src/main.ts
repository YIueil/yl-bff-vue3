import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import '@/core/svg-import'

// 拖拽和大小定制组件
import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

// 自定义模态框
import { ModalPlugin } from '@/utils/modal-manager'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vue3DraggableResizable)
app.use(ModalPlugin)
app.mount('#app')
