<script setup lang="ts">
import { RouterView } from 'vue-router'
import YlModalHost from '@/components/Modal/YlModalHost.vue'

const baseurl = import.meta.env.VITE_API_BASE_URL
</script>

<template>
  <header>
    <p class="baseurl-hint">VITE_API_BASE_URL: {{ baseurl }}</p>
  </header>

  <RouterView />
  <YlModalHost />
</template>

<style scoped>
.baseurl-hint {
  margin: 12px 16px;
  color: #5d6678;
  font-size: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
}
</style>
