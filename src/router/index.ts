import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/icon',
      name: 'icon',
      component: () => import('../views/IconView.vue')
    },
    {
      path: '/drag',
      name: 'drag',
      component: () => import('../views/DraggableView.vue')
    },
    {
      path: '/drag-resize',
      name: 'drag-resize',
      component: () => import('../views/DragResizeView.vue')
    },
    {
      path: '/modal',
      name: 'modal',
      component: () => import('../views/ModalView.vue')
    },
    {
      path: '/button',
      name: 'button',
      component: () => import('../views/ButtonView.vue')
    },
    {
      path: '/echarts',
      name: 'echarts',
      component: () => import('../views/EchartsView.vue')
    }
  ]
})

export default router
