<script setup lang="ts">
// 异步路由组件加载期间的占位视图，由 defineAsyncComponent 的 loadingComponent 渲染。
</script>

<template>
  <div class="async-loading" role="status" aria-live="polite">
    <span class="async-loading-spinner" aria-hidden="true"></span>
    <span class="async-loading-text">页面加载中…</span>
  </div>
</template>

<style scoped>
.async-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 60vh;
  color: #8c8c8c;
}

.async-loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e6f0ff;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: async-loading-spin 0.8s linear infinite;
}

.async-loading-text {
  font-size: 14px;
}

@keyframes async-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
