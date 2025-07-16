<script setup lang="ts">

import { Icon } from '@iconify/vue'
</script>

<template>
  <!-- 在线引入 -->
  <Icon icon="mdi:home" width="32" height="32" />
  <!-- 离线引入 按需引入 -->
  <i-mdi-home width="32" height="32" color="red" />
  <!-- 自定义SVG使用 -->
  <Icon icon="custom:apple" width="32" height="32" />
  <Icon icon="custom:spring" width="32" height="32" />
  <Icon icon="custom:logo" width="32" height="32" />
  <!-- 修改颜色 仅对单色图标有效 -->
  <Icon icon="custom:logo" width="32" height="32" color="green" />
  <Icon icon="custom:spring" width="32" height="32" color="red" />
  <Icon icon="custom:box" width="32" height="32" color="red" />
</template>

<style scoped>

</style>