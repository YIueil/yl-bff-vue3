import { createRouter, createWebHistory } from 'vue-router'
import { loadView } from './load-view'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/components'
    },
    {
      path: '/components',
      component: loadView(() => import('@/views/components-doc/ComponentsDocView.vue')),
      meta: { title: '组件文档' },
      children: [
        {
          path: '',
          redirect: '/components/icon'
        },
        {
          path: 'icon',
          name: 'doc-icon',
          component: loadView(() => import('@/views/components-doc/pages/IconDoc.vue')),
          meta: { title: '图标 Icon' }
        },
        {
          path: 'layout',
          name: 'doc-layout',
          component: loadView(() => import('@/views/components-doc/pages/LayoutDoc.vue')),
          meta: { title: '布局 Layout' }
        },
        {
          path: 'modal',
          name: 'doc-modal',
          component: loadView(() => import('@/views/components-doc/pages/ModalDoc.vue')),
          meta: { title: '模态框 Modal' }
        },
        {
          path: 'button',
          name: 'doc-button',
          component: loadView(() => import('@/views/components-doc/pages/ButtonDoc.vue')),
          meta: { title: '按钮 Button' }
        },
        {
          path: 'echarts',
          name: 'doc-echarts',
          component: loadView(() => import('@/views/components-doc/pages/EchartsDoc.vue')),
          meta: { title: '图表 ECharts' }
        },
        {
          path: 'draggable',
          name: 'doc-draggable',
          component: loadView(() => import('@/views/components-doc/pages/DraggableDoc.vue')),
          meta: { title: '列表拖拽 Draggable' }
        },
        {
          path: 'drag-resize',
          name: 'doc-drag-resize',
          component: loadView(() => import('@/views/components-doc/pages/DragResizeDoc.vue')),
          meta: { title: '元素拖拽缩放 DragResize' }
        },
        {
          path: 'code-block',
          name: 'doc-code-block',
          component: loadView(() => import('@/views/components-doc/pages/CodeBlockDoc.vue')),
          meta: { title: '代码块 CodeBlock' }
        },
        {
          path: 'about',
          name: 'doc-about',
          component: loadView(() => import('@/views/components-doc/pages/AboutDoc.vue')),
          meta: { title: '关于 About' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/NotFoundView.vue'),
      meta: { title: '页面未找到' }
    }
  ]
})

export default router
