<script setup lang="ts">
// 异步路由组件加载失败后的视图，由 defineAsyncComponent 的 errorComponent 渲染。
// Vue 会向该组件传入 Error / retry / attempts 三个 prop。

defineProps<{
  error: unknown
  retry: () => void
  attempts: number
}>()

const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return '未知加载错误'
}
</script>

<template>
  <div class="async-error" role="alert">
    <div class="async-error-code">⚠</div>
    <h2 class="async-error-title">页面加载失败</h2>
    <p class="async-error-desc">资源加载出错，可尝试重新加载。</p>
    <p class="async-error-detail">{{ describeError(error) }}</p>
    <button type="button" class="async-error-retry" @click="retry">重新加载</button>
  </div>
</template>

<style scoped>
.async-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
  padding: 24px;
  text-align: center;
  color: #262626;
}

.async-error-code {
  font-size: 40px;
  line-height: 1;
}

.async-error-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.async-error-desc {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.async-error-detail {
  margin: 0;
  max-width: 480px;
  color: #bfbfbf;
  font-size: 12px;
  word-break: break-all;
}

.async-error-retry {
  margin-top: 8px;
  padding: 8px 20px;
  color: #ffffff;
  background: #1677ff;
  border: 0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.async-error-retry:hover {
  background: #4096ff;
}

.async-error-retry:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
</style>
