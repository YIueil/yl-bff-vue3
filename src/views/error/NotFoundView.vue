<script setup lang="ts">
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'

// 404 页面：承接 catch-all 路由，展示未找到提示并引导回首页。
const route = useRoute()
const requestedPath = route.fullPath
</script>

<template>
  <div class="not-found">
    <div class="not-found-code">404</div>
    <h1 class="not-found-title">页面未找到</h1>
    <p class="not-found-desc">找不到路径 “{{ requestedPath }}” 对应的页面。</p>
    <RouterLink to="/" class="not-found-home">返回首页</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 100vh;
  padding: 24px;
  text-align: center;
  color: #262626;
  background: #ffffff;
}

.not-found-code {
  font-size: 96px;
  font-weight: 800;
  line-height: 1;
  color: #1677ff;
  letter-spacing: 0.04em;
}

.not-found-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.not-found-desc {
  margin: 0;
  max-width: 480px;
  color: #8c8c8c;
  font-size: 14px;
  word-break: break-all;
}

.not-found-home {
  margin-top: 8px;
  padding: 8px 24px;
  color: #ffffff;
  background: #1677ff;
  border-radius: 6px;
  font-size: 14px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.not-found-home:hover {
  background: #4096ff;
}

.not-found-home:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
}
</style>
