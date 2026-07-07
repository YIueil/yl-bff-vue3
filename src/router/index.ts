import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/components'
    },
    {
      path: '/components',
      component: () => import('@/views/components-doc/ComponentsDocView.vue'),
      meta: { title: '组件文档' },
      children: [
        {
          path: '',
          redirect: '/components/icon'
        },
        {
          path: 'icon',
          name: 'doc-icon',
          component: () => import('@/views/components-doc/pages/IconDoc.vue'),
          meta: { title: '图标 Icon' }
        },
        {
          path: 'modal',
          name: 'doc-modal',
          component: () => import('@/views/components-doc/pages/ModalDoc.vue'),
          meta: { title: '模态框 Modal' }
        },
        {
          path: 'button',
          name: 'doc-button',
          component: () => import('@/views/components-doc/pages/ButtonDoc.vue'),
          meta: { title: '按钮 Button' }
        },
        {
          path: 'echarts',
          name: 'doc-echarts',
          component: () => import('@/views/components-doc/pages/EchartsDoc.vue'),
          meta: { title: '图表 ECharts' }
        },
        {
          path: 'draggable',
          name: 'doc-draggable',
          component: () => import('@/views/components-doc/pages/DraggableDoc.vue'),
          meta: { title: '列表拖拽 Draggable' }
        },
        {
          path: 'drag-resize',
          name: 'doc-drag-resize',
          component: () => import('@/views/components-doc/pages/DragResizeDoc.vue'),
          meta: { title: '元素拖拽缩放 DragResize' }
        },
        {
          path: 'about',
          name: 'doc-about',
          component: () => import('@/views/components-doc/pages/AboutDoc.vue'),
          meta: { title: '关于 About' }
        }
      ]
    }
  ]
})

export default router
