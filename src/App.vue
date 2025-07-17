<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/icon">Icon</RouterLink>
        <RouterLink to="/drag">Draggable</RouterLink>
        <RouterLink to="/modal">Modal</RouterLink>
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
