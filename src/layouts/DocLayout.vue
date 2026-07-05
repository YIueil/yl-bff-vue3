<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  key: string
  label: string
  path: string
  description: string
}

const route = useRoute()

const navItems: NavItem[] = [
  { key: 'icon', label: '图标 Icon', path: '/components/icon', description: 'Iconify 三种用法与自定义图标' },
  { key: 'modal', label: '模态框 Modal', path: '/components/modal', description: '声明式 / API / 选项式 / 上下文' },
  { key: 'button', label: '按钮 Button', path: '/components/button', description: '基础按钮样式与修饰类' },
  { key: 'echarts', label: '图表 ECharts', path: '/components/echarts', description: '按需引入与生命周期管理' },
  { key: 'draggable', label: '列表拖拽 Draggable', path: '/components/draggable', description: 'vue-draggable-plus 列表排序' },
  { key: 'drag-resize', label: '元素拖拽缩放 DragResize', path: '/components/drag-resize', description: 'vue3-draggable-resizable 单元素' },
  { key: 'about', label: '关于 About', path: '/components/about', description: '项目说明与能力索引' }
]

const siderCollapsed = ref(false)

// 记录当前内容区滚动容器，让 anchor 跳转有正确的容器上下文
const scrollContainer = ref<HTMLElement | null>(null)
const anchorItems = ref<Array<{ key: string; href: string; title: string }>>([])

// 当前章节标题从 route.meta.title 读取
const currentTitle = computed(() => {
  const metaTitle = (route.meta?.title as string | undefined) ?? '组件文档'
  return metaTitle
})

const collectAnchorItems = async () => {
  await nextTick()
  // 等待子页内容挂载
  await nextTick()
  const page = document.querySelector('main.doc-page')
  if (!page) {
    anchorItems.value = []
    return
  }
  const headings = page.querySelectorAll<HTMLElement>('[data-anchor]')
  const items: Array<{ key: string; href: string; title: string }> = []
  headings.forEach((el) => {
    const key = el.dataset.anchor as string
    const title = (el.textContent || '').trim()
    if (!key || !title) return
    items.push({ key, href: `#${key}`, title })
  })
  anchorItems.value = items
}

// 路由变化时刷新 anchor items
watch(
  () => route.fullPath,
  () => {
    collectAnchorItems()
  },
  { immediate: true }
)

// 监听窗口尺寸变化，折叠 sider
const updateSiderByWidth = () => {
  if (typeof window === 'undefined') return
  siderCollapsed.value = window.innerWidth < 992
}

const onResize = () => updateSiderByWidth()

onMounted(() => {
  updateSiderByWidth()
  window.addEventListener('resize', onResize)
  collectAnchorItems()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

const handleAnchorClick = (e: MouseEvent, info: { href: string; title: string }) => {
  // 让浏览器处理 hash 跳转即可
  e.preventDefault()
  const targetId = info.href.replace(/^#/, '')
  const target = document.getElementById(targetId)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (history.pushState) {
      history.pushState(null, '', info.href)
    }
  }
}
</script>

<template>
  <a-layout class="doc-layout">
    <a-layout-header class="doc-header">
      <div class="doc-header-inner">
        <RouterLink to="/components" class="doc-brand">
          <span class="doc-brand-mark">YL</span>
          <span class="doc-brand-name">yl-bff-vue3</span>
          <span class="doc-brand-tag">组件文档</span>
        </RouterLink>

        <div class="doc-header-spacer"></div>

        <h1 class="doc-header-title">{{ currentTitle }}</h1>

        <div class="doc-header-spacer"></div>

        <RouterLink to="/" class="doc-back-home">回到主站</RouterLink>
      </div>
    </a-layout-header>

    <a-layout class="doc-body">
      <a-layout-sider
        :width="220"
        :collapsed="siderCollapsed"
        :collapsible="true"
        theme="light"
        class="doc-sider"
      >
        <nav class="doc-nav" aria-label="组件导航">
          <RouterLink
            to="/"
            class="doc-nav-item"
            :class="{ 'doc-nav-item-home': true }"
          >
            <span class="doc-nav-dot"></span>
            <span class="doc-nav-label">首页 Home</span>
          </RouterLink>
          <div class="doc-nav-divider">组件</div>
          <RouterLink
            v-for="item in navItems"
            :key="item.key"
            :to="item.path"
            class="doc-nav-item"
            active-class="doc-nav-item-active"
          >
            <span class="doc-nav-dot"></span>
            <span class="doc-nav-label">{{ item.label }}</span>
            <span class="doc-nav-desc">{{ item.description }}</span>
          </RouterLink>
        </nav>
      </a-layout-sider>

      <a-layout-content class="doc-content">
        <a-affix :offset-top="0" class="doc-affix">
          <div class="doc-anchor-wrap">
            <a-anchor
              v-if="anchorItems.length > 0"
              :items="anchorItems"
              :target-offset="64"
              class="doc-anchor"
              @click="handleAnchorClick"
            />
            <div v-else class="doc-anchor-empty">本页无目录</div>
          </div>
        </a-affix>

        <div ref="scrollContainer" class="doc-scroll">
          <RouterView v-slot="{ Component, route: childRoute }">
            <component :is="Component" :key="childRoute.fullPath" />
          </RouterView>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
:root,
.doc-layout {
  --doc-ink: #172033;
  --doc-muted: #5d6678;
  --doc-line: #dce2eb;
  --doc-surface: #ffffff;
  --doc-surface-soft: #f5f7fb;
  --doc-accent: #3157d5;
  --doc-accent-soft: #edf1ff;
  --doc-header-bg: linear-gradient(135deg, #243b80 0%, #3157d5 55%, #4a75ef 100%);
}

.doc-layout {
  min-height: 100vh;
  color: var(--doc-ink);
  background: var(--doc-surface-soft);
}

.doc-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 64px;
  padding: 0 24px;
  color: #ffffff;
  background: var(--doc-header-bg);
  box-shadow: 0 4px 16px rgb(26 51 117 / 18%);
}

.doc-header-inner {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.doc-brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

.doc-brand-mark {
  display: inline-grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: var(--doc-accent);
  background: #ffffff;
  border-radius: 10px;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.04em;
}

.doc-brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.doc-brand-tag {
  padding: 3px 8px;
  background: rgb(255 255 255 / 18%);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.doc-header-spacer {
  flex: 1 1 auto;
}

.doc-header-title {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
  opacity: 0.92;
}

.doc-back-home {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  color: var(--doc-accent);
  background: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.doc-back-home:hover {
  transform: translateY(-1px);
}

.doc-body {
  min-height: calc(100vh - 64px);
  background: var(--doc-surface-soft);
}

.doc-sider {
  background: var(--doc-surface);
  border-right: 1px solid var(--doc-line);
}

.doc-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 12px;
}

.doc-nav-divider {
  margin: 12px 8px 6px;
  color: var(--doc-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.doc-nav-item {
  display: grid;
  grid-template-columns: 8px 1fr;
  grid-template-rows: auto auto;
  gap: 2px 10px;
  align-items: center;
  padding: 8px 10px;
  color: var(--doc-ink);
  background: transparent;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;
}

.doc-nav-item:hover {
  background: var(--doc-accent-soft);
  color: var(--doc-accent);
}

.doc-nav-item-home {
  grid-template-rows: auto;
  font-weight: 600;
}

.doc-nav-item-active {
  color: var(--doc-accent);
  background: var(--doc-accent-soft);
}

.doc-nav-dot {
  width: 8px;
  height: 8px;
  background: var(--doc-line);
  border-radius: 50%;
  grid-row: 1 / span 2;
}

.doc-nav-item-active .doc-nav-dot,
.doc-nav-item:hover .doc-nav-dot {
  background: var(--doc-accent);
}

.doc-nav-label {
  font-size: 14px;
  font-weight: 600;
}

.doc-nav-desc {
  grid-column: 2;
  color: var(--doc-muted);
  font-size: 12px;
  line-height: 1.4;
}

.doc-nav-item-home .doc-nav-desc {
  display: none;
}

.doc-content {
  position: relative;
  padding: 0;
  background: var(--doc-surface-soft);
}

.doc-affix {
  z-index: 5;
  background: var(--doc-surface);
  border-bottom: 1px solid var(--doc-line);
}

.doc-anchor-wrap {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 8px 24px;
  overflow-x: auto;
}

.doc-anchor {
  width: 100%;
  background: transparent;
}

.doc-anchor :deep(.ant-anchor) {
  max-width: 100%;
}

.doc-anchor-empty {
  color: var(--doc-muted);
  font-size: 13px;
}

.doc-scroll {
  padding: 24px 32px 64px;
}

@media (max-width: 992px) {
  .doc-header-title {
    display: none;
  }

  .doc-sider {
    position: fixed;
    z-index: 9;
    height: calc(100vh - 64px);
  }
}

@media (max-width: 640px) {
  .doc-brand-name,
  .doc-brand-tag {
    display: none;
  }

  .doc-scroll {
    padding: 16px 16px 48px;
  }

  .doc-anchor-wrap {
    padding: 8px 16px;
  }
}
</style>
