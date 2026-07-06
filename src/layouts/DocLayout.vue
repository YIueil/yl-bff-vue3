<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  key: string
  label: string
  path: string
  description: string
}

interface AnchorItem {
  key: string
  href: string
  title: string
}

const MOBILE_BREAKPOINT = 992

const route = useRoute()

const navItems: NavItem[] = [
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

const scrollContainer = ref<HTMLElement | null>(null)
const anchorItems = ref<AnchorItem[]>([])
const isMobile = ref(false)
const desktopNavOpen = ref(true)
const mobileNavOpen = ref(false)

let mobileMediaQuery: MediaQueryList | null = null

const currentTitle = computed(() => {
  return (route.meta?.title as string | undefined) ?? '组件文档'
})

const navigationOpen = computed(() => {
  return isMobile.value ? mobileNavOpen.value : desktopNavOpen.value
})

const siderCollapsed = computed(() => !navigationOpen.value)

const getAnchorContainer = (): HTMLElement | Window => {
  return scrollContainer.value ?? window
}

const collectAnchorItems = async () => {
  await nextTick()
  await nextTick()

  const page = scrollContainer.value?.querySelector('main.doc-page')
  if (!page) {
    anchorItems.value = []
    return
  }

  anchorItems.value = Array.from(page.querySelectorAll<HTMLElement>('[data-anchor]'))
    .map((element) => {
      const key = element.dataset.anchor
      const title = (element.textContent || '').trim()

      return key && title ? { key, href: `#${key}`, title } : null
    })
    .filter((item): item is AnchorItem => item !== null)
}

const toggleNavigation = () => {
  if (isMobile.value) {
    mobileNavOpen.value = !mobileNavOpen.value
    return
  }

  desktopNavOpen.value = !desktopNavOpen.value
}

const closeMobileNavigation = () => {
  if (isMobile.value) {
    mobileNavOpen.value = false
  }
}

const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
  isMobile.value = event.matches
  mobileNavOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && mobileNavOpen.value) {
    mobileNavOpen.value = false
  }
}

const handleAnchorClick = (event: MouseEvent, info: { href: string }) => {
  event.preventDefault()
  window.history.replaceState(window.history.state, '', info.href)
}

watch(
  () => route.fullPath,
  async () => {
    closeMobileNavigation()
    await collectAnchorItems()
  },
  { immediate: true }
)

onMounted(() => {
  mobileMediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  handleMediaChange(mobileMediaQuery)
  mobileMediaQuery.addEventListener('change', handleMediaChange)
  window.addEventListener('keydown', handleKeydown)
  collectAnchorItems()
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', handleMediaChange)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <a-layout class="doc-layout">
    <a-layout-header class="doc-header">
      <div class="doc-header-inner">
        <button
          type="button"
          class="doc-menu-toggle"
          :aria-label="navigationOpen ? '收起组件导航' : '展开组件导航'"
          :aria-expanded="navigationOpen"
          aria-controls="doc-navigation"
          @click="toggleNavigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <RouterLink to="/components" class="doc-brand">
          <span class="doc-brand-mark">YL</span>
          <span class="doc-brand-name">yl-bff-vue3</span>
        </RouterLink>

        <span class="doc-header-divider" aria-hidden="true"></span>
        <span class="doc-header-title">{{ currentTitle }}</span>

        <div class="doc-header-spacer"></div>

        <RouterLink to="/" class="doc-back-home">回到主站</RouterLink>
      </div>
    </a-layout-header>

    <a-layout class="doc-body">
      <button
        v-if="isMobile && mobileNavOpen"
        type="button"
        class="doc-nav-backdrop"
        aria-label="关闭组件导航"
        @click="closeMobileNavigation"
      ></button>

      <a-layout-sider
        id="doc-navigation"
        :width="240"
        :collapsed-width="0"
        :collapsed="siderCollapsed"
        :collapsible="true"
        :trigger="null"
        theme="light"
        class="doc-sider"
      >
        <nav class="doc-nav" aria-label="组件导航">
          <RouterLink to="/" class="doc-nav-item doc-nav-item-home" @click="closeMobileNavigation">
            首页 Home
          </RouterLink>

          <div class="doc-nav-divider">组件总览</div>

          <RouterLink
            v-for="item in navItems"
            :key="item.key"
            :to="item.path"
            :title="item.description"
            class="doc-nav-item"
            active-class="doc-nav-item-active"
            @click="closeMobileNavigation"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </a-layout-sider>

      <a-layout-content class="doc-content">
        <div ref="scrollContainer" class="doc-scroll-container">
          <div class="doc-scroll">
            <RouterView v-slot="{ Component, route: childRoute }">
              <component :is="Component" :key="childRoute.path" />
            </RouterView>
          </div>
        </div>
      </a-layout-content>

      <aside class="doc-toc" aria-label="页内目录">
        <div class="doc-anchor-wrap">
          <div class="doc-toc-title">本页目录</div>
          <a-anchor
            v-if="anchorItems.length > 0"
            :items="anchorItems"
            :affix="false"
            :get-container="getAnchorContainer"
            :target-offset="24"
            class="doc-anchor"
            @click="handleAnchorClick"
          />
          <div v-else class="doc-anchor-empty">本页无目录</div>
        </div>
      </aside>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.doc-layout {
  --doc-ink: #262626;
  --doc-muted: #8c8c8c;
  --doc-line: #f0f0f0;
  --doc-surface: #ffffff;
  --doc-surface-soft: #fafafa;
  --doc-accent: #1677ff;
  min-height: 100vh;
  color: var(--doc-ink);
  background: var(--doc-surface);
}

.doc-header {
  position: relative;
  z-index: 20;
  height: 64px;
  padding: 0 28px;
  color: var(--doc-ink);
  line-height: normal;
  background: var(--doc-surface);
  border-bottom: 1px solid var(--doc-line);
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
}

.doc-header-inner {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.doc-menu-toggle {
  display: inline-flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 12px;
  padding: 0;
  color: var(--doc-ink);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.doc-menu-toggle span {
  width: 16px;
  height: 1px;
  background: currentcolor;
}

.doc-menu-toggle:hover {
  color: var(--doc-accent);
  background: #f5f5f5;
}

.doc-menu-toggle:focus-visible,
.doc-brand:focus-visible,
.doc-back-home:focus-visible,
.doc-nav-item:focus-visible {
  outline: 2px solid var(--doc-accent);
  outline-offset: 2px;
}

.doc-brand {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 10px;
  align-items: center;
  color: var(--doc-ink);
  text-decoration: none;
}

.doc-brand-mark {
  display: inline-grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #ffffff;
  background: var(--doc-accent);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.doc-brand-name {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.doc-header-divider {
  width: 1px;
  height: 20px;
  margin: 0 18px;
  background: var(--doc-line);
}

.doc-header-title {
  color: var(--doc-muted);
  font-size: 14px;
}

.doc-header-spacer {
  flex: 1 1 auto;
}

.doc-back-home {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  color: var(--doc-ink);
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.doc-back-home:hover {
  color: var(--doc-accent);
  background: #f5f5f5;
}

.doc-body {
  position: relative;
  display: flex;
  height: calc(100vh - 64px);
  min-height: 0;
  overflow: hidden;
  background: var(--doc-surface);
}

.doc-sider {
  position: relative;
  z-index: 11;
  flex: 0 0 auto;
  height: 100%;
  overflow: hidden;
  background: var(--doc-surface) !important;
  border-right: 1px solid var(--doc-line);
}

.doc-sider :deep(.ant-layout-sider-children) {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}

.doc-nav {
  display: flex;
  flex-direction: column;
  min-width: 240px;
  padding: 22px 20px 40px;
}

.doc-nav-divider {
  margin: 8px 12px 12px;
  padding-bottom: 12px;
  color: var(--doc-muted);
  border-bottom: 1px solid var(--doc-line);
  font-size: 13px;
}

.doc-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  color: var(--doc-ink);
  text-decoration: none;
  font-size: 14px;
  line-height: 24px;
  transition:
    color 0.2s,
    background-color 0.2s;
}

.doc-nav-item:hover {
  color: var(--doc-accent);
  background: #f5f5f5;
}

.doc-nav-item-active {
  color: var(--doc-accent);
  background: #e6f4ff;
  font-weight: 500;
}

.doc-nav-item-active::after {
  position: absolute;
  top: 8px;
  right: 0;
  bottom: 8px;
  width: 2px;
  background: var(--doc-accent);
  border-radius: 2px;
  content: '';
}

.doc-nav-item-home {
  margin-bottom: 10px;
  font-weight: 500;
}

.doc-content {
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: var(--doc-surface);
}

.doc-scroll-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}

.doc-scroll {
  width: 100%;
  max-width: 1080px;
  min-height: 100%;
  margin: 0 auto;
  padding: 48px 48px 80px;
}

.doc-toc {
  flex: 0 0 176px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--doc-surface);
  border-left: 1px solid var(--doc-line);
  scrollbar-gutter: stable;
}

.doc-anchor-wrap {
  padding: 36px 16px 40px;
}

.doc-toc-title {
  margin: 0 0 12px 8px;
  color: var(--doc-muted);
  font-size: 12px;
}

.doc-anchor {
  width: 100%;
  background: transparent;
}

.doc-anchor :deep(.ant-anchor-wrapper) {
  margin-left: 0;
  padding-left: 0;
  background: transparent;
}

.doc-anchor :deep(.ant-anchor) {
  padding-left: 0;
}

.doc-anchor :deep(.ant-anchor::before) {
  border-inline-start-color: var(--doc-line);
}

.doc-anchor :deep(.ant-anchor-link) {
  padding: 4px 0 4px 16px;
}

.doc-anchor :deep(.ant-anchor-link-title) {
  overflow: hidden;
  color: #595959;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-anchor :deep(.ant-anchor-link-title:hover),
.doc-anchor :deep(.ant-anchor-link-title-active) {
  color: var(--doc-accent);
}

.doc-anchor-empty {
  padding-left: 8px;
  color: var(--doc-muted);
  font-size: 13px;
}

.doc-nav-backdrop {
  display: none;
}

@media (max-width: 1199px) {
  .doc-toc {
    display: none;
  }

  .doc-scroll {
    max-width: 1040px;
  }
}

@media (max-width: 991px) {
  .doc-header {
    padding: 0 20px;
  }

  .doc-sider {
    position: fixed !important;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 15;
    height: 100%;
    box-shadow: 8px 0 24px rgb(0 0 0 / 12%);
  }

  .doc-nav-backdrop {
    position: fixed;
    inset: 0;
    z-index: 14;
    display: block;
    padding: 0;
    background: rgb(0 0 0 / 36%);
    border: 0;
    cursor: pointer;
  }

  .doc-scroll {
    max-width: none;
    padding: 40px 32px 72px;
  }
}

@media (max-width: 639px) {
  .doc-header {
    padding: 0 12px;
  }

  .doc-menu-toggle {
    margin-right: 8px;
  }

  .doc-brand-name,
  .doc-header-divider,
  .doc-header-title {
    display: none;
  }

  .doc-back-home {
    padding: 0 8px;
  }

  .doc-scroll {
    padding: 28px 16px 56px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doc-layout *,
  .doc-layout *::before,
  .doc-layout *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

:deep(.doc-page [data-anchor]) {
  scroll-margin-top: 24px;
}

:deep(.doc-page-hero .ant-typography) {
  margin: 0;
}

:deep(.doc-page-eyebrow) {
  color: var(--doc-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

:deep(.doc-page-title) {
  margin-top: 10px !important;
  color: var(--doc-ink);
  font-size: clamp(30px, 4vw, 38px);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

:deep(.doc-page-summary) {
  max-width: 760px;
  margin-top: 14px !important;
  color: #595959;
  font-size: 15px;
  line-height: 1.8;
}
</style>
