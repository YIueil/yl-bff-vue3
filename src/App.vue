<script setup lang="ts">
import { RouterView } from 'vue-router'
import YlModalHost from '@/components/Modal/YlModalHost.vue'
import ErrorBoundary from '@/components/Error/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
  <YlModalHost />
</template>

<style scoped></style>
