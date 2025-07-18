<template>
  <Teleport to="body" :disabled="!isTeleport">
    <Transition name="modal">
      <div v-if="show" class="modal-mask">
        <Vue3DraggableResizable
          :parent="parent"
          :initW="initW"
          :initH="initH"
          v-model:x="x"
          v-model:y="y"
          v-model:w="w"
          v-model:h="h"
          :active="active"
          :draggable="true"
          :resizable="true"
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
            <div class="modal-header">
              <slot name="header">default header</slot>
            </div>

            <div class="modal-body">
              <slot name="body">default body</slot>
            </div>

            <div class="modal-footer">
              <slot name="footer">
                default footer
                <button class="modal-default-button" @click="$emit('close')">OK</button>
              </slot>
            </div>
          </div>
        </Vue3DraggableResizable>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineEmits(['close'])
defineProps({
  show: Boolean,
  isTeleport: {
    type: Boolean,
    default: true
  },
  parent: {
    type: Boolean,
    default: false
  }
})
const x = ref(100)
const y = ref(100)
const h = ref(100)
const w = ref(100)
const initW = ref(500)
const initH = ref(300)
const active = ref(false)
const print = function(val: string) {
  console.log(val)
}
</script>

<style scoped>
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
  width: 100%;
  height: 100%;
  margin: auto;
  background-color: #fff;
  transition: all 0.3s ease;
}

.modal-header {
  position: absolute;
  top: 0;
  color: #42b983;
  border-bottom: 1px solid #999;
}

.modal-body {
  margin: 20px 0;
}

.modal-footer {
  position: absolute;
  bottom: 0;
  border-top: 1px solid #999;
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
