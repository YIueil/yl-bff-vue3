<script setup lang="ts">

const showModal = ref(false)
</script>

<template>
  <button @click="showModal = true">弹出Modal</button>
  <YlModal :show="showModal" @close="showModal = false">
    <template v-slot:header>
      <h3>弹出框标题</h3>
    </template>
    <template v-slot:body>
      this is modal body!
    </template>
  </YlModal>
</template>

<style scoped>

</style>