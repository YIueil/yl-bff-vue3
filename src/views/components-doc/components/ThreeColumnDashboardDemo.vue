<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ThreeColumnLayout from '@/layouts/ThreeColumnLayout.vue'
import {
  activityItems,
  contactItems,
  deviceTrafficItems,
  favoriteItems,
  metricItems,
  pageItems,
  regionTrafficItems
} from '../layout-demo-data'

const route = useRoute()

const leftOpen = ref(true)
const rightOpen = ref(true)
const isMobileLayout = ref(false)

let mobileMediaQuery: MediaQueryList | null = null

const syncLayoutMode = (event: MediaQueryListEvent | MediaQueryList) => {
  isMobileLayout.value = event.matches

  if (event.matches) {
    leftOpen.value = false
    rightOpen.value = false
    return
  }

  leftOpen.value = true
  rightOpen.value = true
}

const toggleLeft = () => {
  leftOpen.value = !leftOpen.value

  if (isMobileLayout.value && leftOpen.value) {
    rightOpen.value = false
  }
}

const toggleRight = () => {
  rightOpen.value = !rightOpen.value

  if (isMobileLayout.value && rightOpen.value) {
    leftOpen.value = false
  }
}

const closeLeft = () => {
  leftOpen.value = false
}

const closeRight = () => {
  rightOpen.value = false
}

const closeMobilePanels = () => {
  if (!isMobileLayout.value) {
    return
  }

  leftOpen.value = false
  rightOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMobilePanels()
  }
}

watch(
  () => route.fullPath,
  () => {
    closeMobilePanels()
  }
)

onMounted(() => {
  mobileMediaQuery = window.matchMedia('(max-width: 1199px)')
  syncLayoutMode(mobileMediaQuery)
  mobileMediaQuery.addEventListener('change', syncLayoutMode)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', syncLayoutMode)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <ThreeColumnLayout
    :left-open="leftOpen"
    :right-open="rightOpen"
    :is-mobile="isMobileLayout"
    :left-width="264"
    :right-width="304"
    class="dashboard-demo"
    @toggle-left="toggleLeft"
    @toggle-right="toggleRight"
    @close-left="closeLeft"
    @close-right="closeRight"
  >
    <template #left>
      <div class="demo-left-panel">
        <div class="demo-brand">
          <span class="demo-brand-mark">YL</span>
          <div>
            <div class="demo-brand-name">Workspace</div>
            <div class="demo-brand-meta">Operations</div>
          </div>
        </div>

        <section class="demo-nav-section" aria-label="Favorites">
          <h3>Favorites</h3>
          <button
            v-for="item in favoriteItems"
            :key="item.key"
            type="button"
            class="demo-nav-item"
            :class="{ 'demo-nav-item-active': item.active }"
          >
            <Icon :icon="item.icon" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </button>
        </section>

        <section class="demo-nav-section" aria-label="Pages">
          <h3>Pages</h3>
          <button v-for="item in pageItems" :key="item.key" type="button" class="demo-nav-item">
            <Icon :icon="item.icon" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </button>
        </section>
      </div>
    </template>

    <template #topbar="{ leftOpen: slotLeftOpen, rightOpen: slotRightOpen }">
      <div class="demo-topbar">
        <button
          type="button"
          class="demo-icon-button"
          :aria-label="slotLeftOpen ? '收起左侧栏' : '展开左侧栏'"
          :aria-expanded="slotLeftOpen"
          aria-controls="three-column-left-sider"
          @click="toggleLeft"
        >
          <Icon icon="mdi:menu" aria-hidden="true" />
        </button>

        <div class="demo-breadcrumb">
          <span>Dashboards</span>
          <Icon icon="mdi:chevron-right" aria-hidden="true" />
          <strong>Default</strong>
        </div>

        <label class="demo-search">
          <Icon icon="mdi:magnify" aria-hidden="true" />
          <input type="search" value="Search" aria-label="搜索 Dashboard" />
        </label>

        <button type="button" class="demo-icon-button" aria-label="刷新">
          <Icon icon="mdi:refresh" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="demo-icon-button"
          :aria-label="slotRightOpen ? '收起右侧栏' : '展开右侧栏'"
          :aria-expanded="slotRightOpen"
          aria-controls="three-column-right-sider"
          @click="toggleRight"
        >
          <Icon icon="mdi:bell-outline" aria-hidden="true" />
        </button>
      </div>
    </template>

    <div class="demo-dashboard-content">
      <section class="demo-hero">
        <div>
          <p class="demo-eyebrow">Today</p>
          <h2>Dashboard</h2>
        </div>
        <a-button type="primary">Export report</a-button>
      </section>

      <section class="demo-metric-grid" aria-label="Overview metrics">
        <article
          v-for="item in metricItems"
          :key="item.label"
          class="demo-metric-card"
          :class="`demo-metric-${item.tone}`"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <em>{{ item.trend }}</em>
        </article>
      </section>

      <section class="demo-panel demo-trend-panel">
        <div class="demo-panel-header">
          <div>
            <p class="demo-eyebrow">Traffic</p>
            <h3>Total users</h3>
          </div>
          <span>Jan - Jun</span>
        </div>
        <div class="demo-line-chart" aria-label="Static traffic trend">
          <span
            v-for="height in [42, 54, 46, 72, 62, 88, 76, 96, 84, 108, 98, 118]"
            :key="height"
            :style="{ height: `${height}px` }"
          ></span>
        </div>
      </section>

      <section class="demo-bottom-grid">
        <article class="demo-panel">
          <div class="demo-panel-header">
            <h3>Traffic by device</h3>
          </div>
          <div class="demo-progress-list">
            <div v-for="item in deviceTrafficItems" :key="item.label" class="demo-progress-item">
              <div>
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
              <i :style="{ width: `${item.percent}%` }"></i>
            </div>
          </div>
        </article>

        <article class="demo-panel">
          <div class="demo-panel-header">
            <h3>Traffic by location</h3>
          </div>
          <div class="demo-progress-list">
            <div v-for="item in regionTrafficItems" :key="item.label" class="demo-progress-item">
              <div>
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
              <i :style="{ width: `${item.percent}%` }"></i>
            </div>
          </div>
        </article>
      </section>
    </div>

    <template #right>
      <div class="demo-right-panel">
        <section>
          <h3>Notifications</h3>
          <div class="demo-activity-list">
            <article v-for="item in activityItems" :key="item.key" class="demo-activity-item">
              <span></span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.time }}</p>
              </div>
            </article>
          </div>
        </section>

        <section>
          <h3>Contacts</h3>
          <div class="demo-contact-list">
            <article v-for="item in contactItems" :key="item.key" class="demo-contact-item">
              <span>{{ item.initials }}</span>
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.role }}</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </template>
  </ThreeColumnLayout>
</template>

<style scoped>
.dashboard-demo {
  --demo-line: #e6ebf1;
  --demo-muted: #6c7788;
  --demo-ink: #202633;
  --demo-surface: #ffffff;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.demo-left-panel,
.demo-right-panel {
  min-width: 0;
  height: 100%;
  padding: 18px;
}

.demo-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 44px;
  margin-bottom: 24px;
}

.demo-brand-mark {
  display: grid;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  place-items: center;
  color: #ffffff;
  background: #1677ff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
}

.demo-brand-name,
.demo-contact-item strong,
.demo-activity-item strong {
  color: var(--demo-ink);
  font-weight: 600;
}

.demo-brand-meta,
.demo-activity-item p,
.demo-contact-item p {
  margin: 2px 0 0;
  color: var(--demo-muted);
  font-size: 12px;
}

.demo-nav-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 20px;
}

.demo-nav-section h3,
.demo-right-panel h3 {
  margin: 0 0 8px;
  color: var(--demo-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.demo-nav-item {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 38px;
  padding: 0 10px;
  color: var(--demo-muted);
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
}

.demo-nav-item svg {
  flex: 0 0 auto;
  font-size: 18px;
}

.demo-nav-item:hover,
.demo-nav-item-active {
  color: #1677ff;
  background: #e6f4ff;
}

.demo-topbar {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 60px;
  padding: 0 20px;
}

.demo-icon-button {
  display: inline-grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #4f5b6b;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 19px;
}

.demo-icon-button:hover {
  color: #1677ff;
  background: #f3f6fa;
  border-color: var(--demo-line);
}

.demo-icon-button:focus-visible,
.demo-nav-item:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

.demo-breadcrumb {
  display: inline-flex;
  flex: 0 1 auto;
  gap: 6px;
  align-items: center;
  min-width: 0;
  color: var(--demo-muted);
  font-size: 13px;
}

.demo-breadcrumb strong {
  color: var(--demo-ink);
  font-weight: 500;
}

.demo-search {
  display: flex;
  flex: 1 1 220px;
  gap: 8px;
  align-items: center;
  max-width: 320px;
  height: 34px;
  margin-left: auto;
  padding: 0 10px;
  color: var(--demo-muted);
  background: #f6f8fb;
  border: 1px solid var(--demo-line);
  border-radius: 6px;
}

.demo-search input {
  min-width: 0;
  width: 100%;
  color: var(--demo-ink);
  background: transparent;
  border: 0;
  outline: none;
  font-size: 13px;
}

.demo-dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
}

.demo-hero,
.demo-panel-header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.demo-hero h2,
.demo-panel h3 {
  margin: 0;
  color: var(--demo-ink);
  font-weight: 600;
  letter-spacing: 0;
}

.demo-hero h2 {
  font-size: 24px;
}

.demo-panel h3 {
  font-size: 16px;
}

.demo-eyebrow {
  margin: 0 0 4px;
  color: var(--demo-muted);
  font-size: 12px;
}

.demo-metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.demo-metric-card,
.demo-panel {
  background: var(--demo-surface);
  border: 1px solid var(--demo-line);
  border-radius: 8px;
}

.demo-metric-card {
  min-height: 112px;
  padding: 16px;
}

.demo-metric-card span,
.demo-panel-header span {
  color: var(--demo-muted);
  font-size: 13px;
}

.demo-metric-card strong {
  display: block;
  margin-top: 12px;
  color: var(--demo-ink);
  font-size: 26px;
  font-weight: 650;
}

.demo-metric-card em {
  display: inline-flex;
  margin-top: 8px;
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
}

.demo-metric-blue em {
  color: #1677ff;
}

.demo-metric-green em {
  color: #0f9f6e;
}

.demo-metric-amber em {
  color: #b7791f;
}

.demo-metric-rose em {
  color: #d14343;
}

.demo-panel {
  padding: 18px;
}

.demo-line-chart {
  display: grid;
  grid-template-columns: repeat(12, minmax(14px, 1fr));
  gap: 10px;
  align-items: end;
  height: 180px;
  margin-top: 18px;
  padding: 18px;
  background:
    linear-gradient(#edf1f5 1px, transparent 1px) 0 0 / 100% 45px,
    #f8fafc;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
}

.demo-line-chart span {
  display: block;
  min-height: 24px;
  background: linear-gradient(180deg, #1677ff, #20c997);
  border-radius: 6px 6px 2px 2px;
}

.demo-bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.demo-progress-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.demo-progress-item div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--demo-muted);
  font-size: 13px;
}

.demo-progress-item strong {
  color: var(--demo-ink);
  font-weight: 600;
}

.demo-progress-item i {
  display: block;
  height: 8px;
  background: #1677ff;
  border-radius: 999px;
}

.demo-progress-item {
  position: relative;
}

.demo-progress-item::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  height: 8px;
  background: #edf1f5;
  border-radius: 999px;
  content: '';
}

.demo-progress-item i {
  position: relative;
  z-index: 1;
}

.demo-right-panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.demo-activity-list,
.demo-contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-activity-item,
.demo-contact-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
}

.demo-activity-item > span {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  background: #1677ff;
  border-radius: 50%;
}

.demo-activity-item div,
.demo-contact-item div {
  min-width: 0;
}

.demo-contact-item > span {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #ffffff;
  background: #4f5b6b;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1199px) {
  .demo-search {
    max-width: none;
  }
}

@media (max-width: 840px) {
  .demo-metric-grid,
  .demo-bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .demo-topbar {
    gap: 8px;
    padding: 0 12px;
  }

  .demo-breadcrumb {
    display: none;
  }

  .demo-search {
    flex-basis: 120px;
  }

  .demo-dashboard-content {
    padding: 16px;
  }

  .demo-hero {
    align-items: flex-start;
  }

  .demo-metric-grid,
  .demo-bottom-grid {
    grid-template-columns: 1fr;
  }

  .demo-line-chart {
    gap: 6px;
    padding: 12px;
  }
}
</style>
