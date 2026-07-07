<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  navigationOpen: boolean
  siderCollapsed: boolean
  isMobile: boolean
}>()

const emit = defineEmits<{
  toggleNavigation: []
  closeMobileNavigation: []
}>()

const scrollContainer = ref<HTMLElement | null>(null)

const toggleNavigation = () => {
  emit('toggleNavigation')
}

const closeMobileNavigation = () => {
  emit('closeMobileNavigation')
}

defineExpose({
  getScrollContainer: () => scrollContainer.value
})
</script>

<template>
  <a-layout class="doc-layout">
    <a-layout-header class="doc-header">
      <slot
        name="header"
        :navigation-open="navigationOpen"
        :toggle-navigation="toggleNavigation"
      />
    </a-layout-header>

    <a-layout class="doc-body">
      <button
        v-if="isMobile && navigationOpen"
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
        <slot name="sider" :close-mobile-navigation="closeMobileNavigation" />
      </a-layout-sider>

      <a-layout-content class="doc-content">
        <div ref="scrollContainer" class="doc-scroll-container">
          <div class="doc-scroll">
            <slot />
          </div>
        </div>
      </a-layout-content>

      <aside class="doc-toc" aria-label="页内目录">
        <slot name="aside" />
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
