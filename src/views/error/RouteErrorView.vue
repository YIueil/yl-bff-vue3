<script setup lang="ts">
import { RouterLink } from 'vue-router'

// 路由级错误页：由 ErrorBoundary 在捕获到路由组件渲染异常时渲染。
defineProps<{
  error: unknown
}>()

const emit = defineEmits<{
  retry: []
}>()

const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return '渲染过程中发生未知错误'
}
</script>

<template>
  <div class="route-error" role="alert">
    <div class="route-error-code">⚠</div>
    <h1 class="route-error-title">页面出错了</h1>
    <p class="route-error-desc">当前页面渲染时发生异常。</p>
    <p class="route-error-detail">{{ describeError(error) }}</p>
    <div class="route-error-actions">
      <button type="button" class="route-error-retry" @click="emit('retry')">重试</button>
      <RouterLink to="/" class="route-error-home">返回首页</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.route-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 100vh;
  padding: 24px;
  text-align: center;
  color: #262626;
  background: #ffffff;
}

.route-error-code {
  font-size: 40px;
  line-height: 1;
}

.route-error-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.route-error-desc {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.route-error-detail {
  margin: 0;
  max-width: 480px;
  color: #bfbfbf;
  font-size: 12px;
  word-break: break-all;
}

.route-error-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.route-error-retry,
.route-error-home {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.route-error-retry {
  color: #ffffff;
  background: #1677ff;
  border: 0;
}

.route-error-retry:hover {
  background: #4096ff;
}

.route-error-retry:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}

.route-error-home {
  display: inline-flex;
  align-items: center;
  color: #1677ff;
  background: #e6f4ff;
}

.route-error-home:hover {
  background: #bae0ff;
}

.route-error-home:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
</style>
