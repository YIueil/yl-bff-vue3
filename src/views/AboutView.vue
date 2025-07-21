<template>
  <div class="about">
    <h1>This is an about page, 授权给 {{ userName }}</h1>
  </div>
</template>

<script setup lang="ts">
defineProps({
  userName: {
    type: String,
    default: () => '未知用户'
  }
})
</script>
