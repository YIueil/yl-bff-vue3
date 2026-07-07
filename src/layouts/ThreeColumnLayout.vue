<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    leftOpen: boolean
    rightOpen: boolean
    isMobile: boolean
    leftWidth?: number
    rightWidth?: number
  }>(),
  {
    leftWidth: 260,
    rightWidth: 300
  }
)

const emit = defineEmits<{
  toggleLeft: []
  toggleRight: []
  closeLeft: []
  closeRight: []
}>()

const closePanels = () => {
  emit('closeLeft')
  emit('closeRight')
}
</script>

<template>
  <section
    class="three-column-layout"
    :class="{
      'three-column-layout-mobile': isMobile,
      'three-column-left-open': leftOpen,
      'three-column-right-open': rightOpen
    }"
    :style="{
      '--three-column-left-width': `${props.leftWidth}px`,
      '--three-column-right-width': `${props.rightWidth}px`
    }"
  >
    <button
      v-if="isMobile && (leftOpen || rightOpen)"
      type="button"
      class="three-column-backdrop"
      aria-label="关闭侧栏"
      @click="closePanels"
    ></button>

    <aside id="three-column-left-sider" class="three-column-sider three-column-sider-left">
      <slot name="left" />
    </aside>

    <main class="three-column-main">
      <header class="three-column-topbar">
        <slot
          name="topbar"
          :left-open="leftOpen"
          :right-open="rightOpen"
          :toggle-left="() => emit('toggleLeft')"
          :toggle-right="() => emit('toggleRight')"
        />
      </header>

      <div class="three-column-content">
        <slot />
      </div>
    </main>

    <aside id="three-column-right-sider" class="three-column-sider three-column-sider-right">
      <slot name="right" />
    </aside>
  </section>
</template>

<style scoped>
.three-column-layout {
  position: relative;
  display: grid;
  grid-template-columns:
    minmax(0, var(--three-column-left-width)) minmax(0, 1fr)
    minmax(0, var(--three-column-right-width));
  width: 100%;
  min-height: 720px;
  overflow: hidden;
  color: #202633;
  background: #f4f6f8;
  border: 1px solid #dfe4ea;
  border-radius: 8px;
}

.three-column-layout:not(.three-column-left-open) {
  grid-template-columns: 0 minmax(0, 1fr) minmax(0, var(--three-column-right-width));
}

.three-column-layout:not(.three-column-right-open) {
  grid-template-columns: minmax(0, var(--three-column-left-width)) minmax(0, 1fr) 0;
}

.three-column-layout:not(.three-column-left-open):not(.three-column-right-open) {
  grid-template-columns: 0 minmax(0, 1fr) 0;
}

.three-column-sider,
.three-column-main {
  min-width: 0;
  min-height: 0;
}

.three-column-sider {
  position: relative;
  z-index: 2;
  height: 100%;
  overflow: hidden auto;
  background: #ffffff;
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.three-column-sider-left {
  border-right: 1px solid #e6ebf1;
}

.three-column-sider-right {
  border-left: 1px solid #e6ebf1;
}

.three-column-layout:not(.three-column-left-open) .three-column-sider-left,
.three-column-layout:not(.three-column-right-open) .three-column-sider-right {
  opacity: 0;
  pointer-events: none;
}

.three-column-main {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.three-column-topbar {
  position: sticky;
  top: 0;
  z-index: 1;
  flex: 0 0 auto;
  background: rgb(255 255 255 / 92%);
  border-bottom: 1px solid #e6ebf1;
  backdrop-filter: blur(12px);
}

.three-column-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}

.three-column-backdrop {
  display: none;
}

.three-column-layout-mobile {
  display: block;
  min-height: 640px;
}

.three-column-layout-mobile .three-column-main {
  width: 100%;
  height: 100%;
  min-height: 640px;
}

.three-column-layout-mobile .three-column-sider {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 12;
  width: min(86vw, var(--three-column-left-width));
  max-width: 360px;
  box-shadow: 0 20px 48px rgb(15 23 42 / 18%);
}

.three-column-layout-mobile .three-column-sider-left {
  left: 0;
  transform: translateX(-104%);
}

.three-column-layout-mobile .three-column-sider-right {
  right: 0;
  width: min(86vw, var(--three-column-right-width));
  transform: translateX(104%);
}

.three-column-layout-mobile.three-column-left-open .three-column-sider-left,
.three-column-layout-mobile.three-column-right-open .three-column-sider-right {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.three-column-layout-mobile .three-column-backdrop {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: block;
  padding: 0;
  background: rgb(15 23 42 / 42%);
  border: 0;
  cursor: pointer;
}

@media (max-width: 639px) {
  .three-column-layout,
  .three-column-layout-mobile .three-column-main {
    min-height: 600px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .three-column-layout *,
  .three-column-layout *::before,
  .three-column-layout *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
