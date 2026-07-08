<template>
  <Teleport to="body" :disabled="!isTeleport">
    <Transition name="modal">
      <div v-if="visible" v-show="show" :class="['modal-wrapper', { 'with-mask': localShowMask }]">
        <div v-if="localShowMask" class="modal-mask" @click.self="onMaskClick"></div>
        <Vue3DraggableResizable
          :parent="parent"
          :initW="initW"
          :initH="initH"
          v-model:x="x"
          v-model:y="y"
          v-model:w="w"
          v-model:h="h"
          :active="active"
          :draggable="localDraggable"
          :resizable="localResizable"
          :handles="['br']"
          classNameDraggable="custom-draggable"
          classNameResizable="custom-resizable"
          classNameDragging="custom-dragging"
          classNameResizing="custom-resizing"
          classNameActive="custom-active"
          classNameHandle="custom-handle"
          @activated="print('activated')"
          @deactivated="print('deactivated')"
          @drag-start="print('drag-start')"
          @resize-start="print('resize-start')"
          @dragging="print('dragging')"
          @resizing="print('resizing')"
          @drag-end="print('drag-end')"
          @resize-end="print('resize-end')"
        >
          <div class="modal-container">
            <div v-show="showHeader" class="modal-header">
              <div class="header-title">
                <slot name="header">[请定义标题]</slot>
              </div>
              <div class="header-btns" @mousedown.stop @touchstart.stop>
                <IMdiMinus v-if="!minimize" @click="windowMinimize" />
                <IMdiResize v-if="minimize" @click="windowResize" />
                <IMdiWindowMaximize v-if="!maximize && !minimize" @click="windowMaximize" />
                <IMdiWindowRestore v-else-if="maximize && !minimize" @click="windowMaximize" />
                <IMdiClose @click="modalClose" />
              </div>
            </div>

            <div v-show="localShowBody" class="modal-body" @mousedown.stop @touchstart.stop>
              <slot name="body">[请定义内容]</slot>
            </div>

            <div v-show="localShowFooter" class="modal-footer" @mousedown.stop @touchstart.stop>
              <slot name="footer">
                <a-button @click="$emit('ok')">OK</a-button>
                <a-button @click="$emit('cancel')">Cancel</a-button>
              </slot>
            </div>
          </div>
        </Vue3DraggableResizable>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { Modal } from '@/utils/modal-manager'

const emits = defineEmits(['event', 'close', 'ok', 'cancel'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: true
  },
  showMask: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showBody: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  clickMaskClose: {
    type: Boolean,
    default: true
  },
  isTeleport: {
    type: Boolean,
    default: true
  },
  parent: {
    type: Boolean,
    default: true
  },
  resizable: {
    type: Boolean,
    default: true
  },
  draggable: {
    type: Boolean,
    default: true
  },
  // 可选：用于最小化排列的跨实例协调；声明式无 key 时使用单点左下角
  modalKey: {
    type: [String, Number],
    default: undefined
  }
})

// 视口尺寸（单一来源，响应式）
const { width: vw, height: vh } = useWindowSize()

// 布局常量
const MARGIN = 24
const SMALL_BREAKPOINT = 640
const MIN_W = 320
const MIN_H = 200
const MINIMIZED_W = 200
const MINIMIZED_H = 36
const GAP = 8

const initW = ref(900)
const initH = ref(560)
const x = ref(0)
const y = ref(0)
const w = ref(0)
const h = ref(0)
const active = ref(false)
const minimize = ref(false)
const maximize = ref(false)
// 进入最小化/最大化前保存的正常态几何，恢复时还原（位置与大小）
const savedRect = ref<{ x: number; y: number; w: number; h: number } | null>(null)

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

const isMobile = computed(() => vw.value < SMALL_BREAKPOINT)
const defaultW = computed(() => clamp(initW.value, MIN_W, Math.max(MIN_W, vw.value - MARGIN * 2)))
const defaultH = computed(() => clamp(initH.value, MIN_H, Math.max(MIN_H, vh.value - MARGIN * 2)))

// props 响应式派生；最小化态以内部状态覆盖
const localShowMask = computed(() => !minimize.value && props.showMask)
const localShowBody = computed(() => !minimize.value && props.showBody)
const localShowFooter = computed(() => !minimize.value && props.showFooter)
const localResizable = computed(
  () => !minimize.value && !maximize.value && props.resizable && !isMobile.value
)
const localDraggable = computed(
  () => !minimize.value && !maximize.value && props.draggable && !isMobile.value
)

// 布局函数
const applyCentered = (): void => {
  w.value = defaultW.value
  h.value = defaultH.value
  x.value = (vw.value - w.value) / 2
  y.value = (vh.value - h.value) / 2
}

const applyMaximized = (): void => {
  w.value = vw.value
  h.value = vh.value
  x.value = 0
  y.value = 0
}

const applyMinimized = (index: number): void => {
  w.value = MINIMIZED_W
  h.value = MINIMIZED_H
  x.value = index * (MINIMIZED_W + GAP)
  y.value = vh.value - MINIMIZED_H
}

const clampToViewport = (): void => {
  const maxW = Math.max(MIN_W, vw.value - MARGIN * 2)
  const maxH = Math.max(MIN_H, vh.value - MARGIN * 2)
  if (w.value > maxW) w.value = maxW
  if (h.value > maxH) h.value = maxH
  x.value = clamp(x.value, 0, Math.max(0, vw.value - w.value))
  y.value = clamp(y.value, 0, Math.max(0, vh.value - h.value))
}

// 进入最小化/最大化前保存当前正常态几何
const captureNormal = (): void => {
  savedRect.value = { x: x.value, y: y.value, w: w.value, h: h.value }
}

// 恢复时优先还原最小化/最大化前的位置与大小；无记录时回退到默认布局
const restoreNormal = (): void => {
  if (savedRect.value) {
    x.value = savedRect.value.x
    y.value = savedRect.value.y
    w.value = savedRect.value.w
    h.value = savedRect.value.h
  } else if (isMobile.value) {
    applyMaximized()
  } else {
    applyCentered()
  }
}

const relayoutMinimized = (): void => {
  const index = props.modalKey !== undefined ? Modal.getMinimizedIndex(props.modalKey) : 0
  applyMinimized(index)
}

onMounted(() => {
  if (isMobile.value) {
    applyMaximized()
  } else {
    applyCentered()
  }
})

// 视口尺寸变化时的适配：最大化跟随、最小化重排、小屏铺满、正常态仅约束不强行居中
watch([vw, vh], () => {
  if (maximize.value) {
    applyMaximized()
  } else if (minimize.value) {
    relayoutMinimized()
  } else if (isMobile.value) {
    applyMaximized()
  } else {
    clampToViewport()
  }
})

// 最小化排列：自身最小化态或最小化列表变化时重排
watch(
  [
    () => minimize.value,
    () => Modal.getMinimizedKeys().length,
    () => Modal.getMinimizedIndex(props.modalKey ?? '')
  ],
  () => {
    if (minimize.value) {
      relayoutMinimized()
    }
  }
)

onBeforeUnmount(() => {
  if (minimize.value && props.modalKey !== undefined) {
    Modal.unregisterMinimized(props.modalKey)
  }
})

const print = (val: string): void => {
  console.log(val)
}

const windowMinimize = (): void => {
  captureNormal()
  minimize.value = true
  if (props.modalKey !== undefined) {
    Modal.registerMinimized(props.modalKey)
  }
  relayoutMinimized()
}

const windowResize = (): void => {
  minimize.value = false
  if (props.modalKey !== undefined) {
    Modal.unregisterMinimized(props.modalKey)
  }
  restoreNormal()
}

const windowMaximize = (): void => {
  if (maximize.value) {
    maximize.value = false
    restoreNormal()
  } else {
    captureNormal()
    maximize.value = true
    applyMaximized()
  }
}

const onMaskClick = (): void => {
  if (props.clickMaskClose) {
    modalClose()
  }
}

const modalClose = (): void => {
  emits('close')
  emits('event', 'close')
}
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 允许点击穿透 */
  pointer-events: none;
  overflow: hidden;
}

.with-mask {
  /* 有遮罩时启用点击事件 */
  pointer-events: auto;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  margin: auto;
  background-color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  /* 容器内元素可正常交互 */
  pointer-events: auto;
  z-index: 9999;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 8px 12px;
  border-bottom: 1px solid #e8e8e8;
  cursor: move;
  user-select: none;
  overflow: hidden;
}

:deep(.custom-handle-br) {
  z-index: 9999;
}

:deep(.vdr-handle) {
  display: inline-block;
  width: 24px;
  height: 24px;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M22 22h-2v-2h2zm0-4h-2v-2h2zm-4 4h-2v-2h2zm0-4h-2v-2h2zm-4 4h-2v-2h2zm8-8h-2v-2h2z'/%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

:deep(.vdr-handle-br) {
  bottom: 0px;
  right: 0px;
  cursor: se-resize;
}

.header-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.header-btns {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 80px;
}

.header-btns > * {
  padding: 0 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 可选：添加悬停时的视觉反馈 */
.header-btns > *:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

.modal-body {
  flex: 1;
  padding: 5px;
  overflow-y: auto;
  /* 触屏下允许内容区滚动，不被拖拽拦截 */
  touch-action: pan-y;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 36px;
  padding: 8px 12px;
  border-top: 1px solid #e8e8e8;
  overflow: hidden;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
