<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
const baseurl = import.meta.env.VITE_API_BASE_URL

</script>

<template>
  <header>
    {{ baseurl }}
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/icon">Icon</RouterLink>
        <RouterLink to="/drag">Draggable</RouterLink>
        <RouterLink to="/drag-resize">DragResize</RouterLink>
        <RouterLink to="/modal">Modal</RouterLink>
        <RouterLink to="/button">Button</RouterLink>
        <RouterLink to="/echarts">Echarts</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
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
