import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DocLayout from '@/layouts/DocLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首页' }
    },
    {
      path: '/components',
      component: DocLayout,
      meta: { title: '组件文档' },
      children: [
        {
          path: '',
          redirect: '/components/icon'
        },
        {
          path: 'icon',
          name: 'doc-icon',
          component: () => import('@/views/components/IconDoc.vue'),
          meta: { title: '图标 Icon' }
        },
        {
          path: 'modal',
          name: 'doc-modal',
          component: () => import('@/views/components/ModalDoc.vue'),
          meta: { title: '模态框 Modal' }
        },
        {
          path: 'button',
          name: 'doc-button',
          component: () => import('@/views/components/ButtonDoc.vue'),
          meta: { title: '按钮 Button' }
        },
        {
          path: 'echarts',
          name: 'doc-echarts',
          component: () => import('@/views/components/EchartsDoc.vue'),
          meta: { title: '图表 ECharts' }
        },
        {
          path: 'draggable',
          name: 'doc-draggable',
          component: () => import('@/views/components/DraggableDoc.vue'),
          meta: { title: '列表拖拽 Draggable' }
        },
        {
          path: 'drag-resize',
          name: 'doc-drag-resize',
          component: () => import('@/views/components/DragResizeDoc.vue'),
          meta: { title: '元素拖拽缩放 DragResize' }
        },
        {
          path: 'about',
          name: 'doc-about',
          component: () => import('@/views/components/AboutDoc.vue'),
          meta: { title: '关于 About' }
        }
      ]
    }
  ]
})

export default router
