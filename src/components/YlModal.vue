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
              <div class="header-btns" @mousedown.stop>
                <IMdiMinus v-if="!minimize" @click="windowMinimize" />
                <IMdiResize v-if="minimize" @click="windowResize" />
                <IMdiWindowMaximize v-if="!maximize && !minimize" @click="windowMaximize" />
                <IMdiWindowRestore v-else-if="maximize && !minimize" @click="windowMaximize" />
                <IMdiClose @click="modalClose" />
              </div>
            </div>

            <div v-show="localShowBody" class="modal-body" @mousedown.stop>
              <slot name="body">[请定义内容]</slot>
            </div>

            <div v-show="localShowFooter" class="modal-footer" @mousedown.stop>
              <slot name="footer">
                <button class="modal-default-button" @click="$emit('ok')">OK</button>
                <button class="modal-default-button" @click="$emit('cancel')">Cancel</button>
              </slot>
            </div>
          </div>
        </Vue3DraggableResizable>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const emits = defineEmits(['event', 'close', 'ok', 'cancel'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
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
  }
})
const x = ref(0)
const y = ref(0)
const h = ref(0)
const w = ref(0)
const initW = ref(900)
const initH = ref(560)
const active = ref(false)
const minimize = ref(false)
const maximize = ref(false)
const localShowMask = ref(props.showMask)
const localShowBody = ref(props.showBody)
const localShowFooter = ref(props.showFooter)
const localResizable = ref(props.resizable)
const localDraggable = ref(props.draggable)

onMounted(() => {
  const { width, height } = useWindowSize()
  x.value = (width.value - initW.value) / 2
  y.value = (height.value - initH.value) / 2
})

const print = function (val: string) {
  console.log(val)
}

const windowMinimize = function () {
  const { height } = useWindowSize()
  minimize.value = true
  localResizable.value = false
  localShowBody.value = false
  localShowFooter.value = false
  localShowMask.value = false
  // 宽高保留头部范围 移动到左下角
  h.value = 36
  w.value = 200
  x.value = 0
  y.value = height.value - 36
}

const windowResize = function () {
  const { width, height } = useWindowSize()
  minimize.value = false
  localResizable.value = props.resizable
  localShowBody.value = props.showBody
  localShowFooter.value = props.showFooter
  localShowMask.value = props.showMask
  h.value = initH.value
  w.value = initW.value
  x.value = (width.value - initW.value) / 2
  y.value = (height.value - initH.value) / 2
}

const windowMaximize = function () {
  const { width, height } = useWindowSize()
  if (maximize.value) {
    h.value = initH.value
    w.value = initW.value
    x.value = (width.value - initW.value) / 2
    y.value = (height.value - initH.value) / 2
  } else {
    h.value = height.value
    w.value = width.value
    x.value = 0
    y.value = 0
  }
  maximize.value = !maximize.value
}

const onMaskClick = function () {
  if (props.clickMaskClose) {
    emits('close')
  }
}

const modalClose = function () {
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

.modal-default-button {
  float: right;
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
