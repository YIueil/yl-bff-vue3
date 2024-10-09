<script setup lang="ts">
import ComponentsView from '@/views/ComponentsView.vue'
import { useApplicationStore } from '@/stores/application'
import { storeToRefs } from 'pinia'

const applicationStore = useApplicationStore()
const { darkMode } = storeToRefs(applicationStore)
</script>

<template>
  <div
    :style="{height: '100vh', color: !darkMode ? '#FFFFFFFF' : '#181818FF', background: !darkMode ? '#FFFFFFFF' : '#181818FF'}">
    <ComponentsView />
  </div>
</template>

<style scoped>

</style>
