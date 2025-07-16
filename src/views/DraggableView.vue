<template>
  <VueDraggable ref="el" v-model="list">
    <div v-for="item in list" :key="item.id">
      {{ item.name }}
    </div>
  </VueDraggable>
  {{ list }}
</template>


<!-- 只是一个简单的示例, 更多参考: https://vue-draggable-plus.pages.dev -->
<script setup lang="ts">
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
const list = ref([
  {
    name: 'Joao',
    id: 1
  },
  {
    name: 'Jean',
    id: 2
  },
  {
    name: 'Johanna',
    id: 3
  },
  {
    name: 'Juan',
    id: 4
  }
])
</script>