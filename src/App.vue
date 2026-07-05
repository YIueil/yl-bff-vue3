<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import YlModalHost from '@/components/Modal/YlModalHost.vue'

const baseurl = import.meta.env.VITE_API_BASE_URL
</script>

<template>
  <header>
    {{ baseurl }}
    <div class="wrapper">
      <nav>
        <a-button type="primary">
          <RouterLink to="/components">组件文档</RouterLink>
        </a-button>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/components/icon">Icon</RouterLink>
        <RouterLink to="/components/draggable">Draggable</RouterLink>
        <RouterLink to="/components/drag-resize">DragResize</RouterLink>
        <RouterLink to="/components/modal">Modal</RouterLink>
        <RouterLink to="/components/button">Button</RouterLink>
        <RouterLink to="/components/echarts">Echarts</RouterLink>
        <RouterLink to="/components/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
  <YlModalHost />
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
}

nav a {
  margin: 10px;
}
</style>
