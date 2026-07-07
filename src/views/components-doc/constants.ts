import type { NavItem } from './types'

export const MOBILE_BREAKPOINT = 992

export const navItems: NavItem[] = [
  {
    key: 'icon',
    label: '图标 Icon',
    path: '/components/icon',
    description: 'Iconify 三种用法与自定义图标'
  },
  {
    key: 'modal',
    label: '模态框 Modal',
    path: '/components/modal',
    description: '声明式 / API / 选项式 / 上下文'
  },
  {
    key: 'button',
    label: '按钮 Button',
    path: '/components/button',
    description: '基础按钮样式与修饰类'
  },
  {
    key: 'echarts',
    label: '图表 ECharts',
    path: '/components/echarts',
    description: '按需引入与生命周期管理'
  },
  {
    key: 'draggable',
    label: '列表拖拽 Draggable',
    path: '/components/draggable',
    description: 'vue-draggable-plus 列表排序'
  },
  {
    key: 'drag-resize',
    label: '元素拖拽缩放 DragResize',
    path: '/components/drag-resize',
    description: 'vue3-draggable-resizable 单元素'
  },
  {
    key: 'about',
    label: '关于 About',
    path: '/components/about',
    description: '项目说明与能力索引'
  }
]
