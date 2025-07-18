<script lang="ts">
import { defineComponent } from 'vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

export default defineComponent({
  components: { Vue3DraggableResizable },
  data() {
    return {
      x: 100,
      y: 100,
      h: 100,
      w: 100,
      active: false
    }
  },
  methods: {
    print(val: any) {
      console.log(val)
    }
  }
})
</script>

<template>
  <div class="parent">
    <Vue3DraggableResizable
      :parent="true"
      :initW="110"
      :initH="120"
      v-model:x="x"
      v-model:y="y"
      v-model:w="w"
      v-model:h="h"
      v-model:active="active"
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
      <div class="div">元素拖动和大小缩放示例</div>
    </Vue3DraggableResizable>
  </div>
</template>

<style scoped>
.div {
  background: #42b983;
  width: 100%;
  height: 100%;
}

.parent {
  width: 1000px;
  height: 500px;
  position: absolute;
  top: 100px;
  left: 100px;
  border: 1px solid #000;
  user-select: none;
}
</style>
