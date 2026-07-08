<script setup lang="ts">
import { RouterView } from 'vue-router'
import YlModalHost from '@/components/Modal/YlModalHost.vue'
import ErrorBoundary from '@/components/error/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
  <YlModalHost />
</template>

<style scoped></style>
