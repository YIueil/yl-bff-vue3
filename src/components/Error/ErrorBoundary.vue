<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useRouter } from 'vue-router'
import RouteErrorView from '@/views/error/RouteErrorView.vue'

// 捕获后代（即 RouterView 渲染的路由组件）在渲染/生命周期阶段抛出的同步异常，
// 用路由级错误页替代白屏。返回 false 阻止错误继续冒泡。
const router = useRouter()
const error = ref<unknown>(null)

onErrorCaptured((err: unknown) => {
  error.value = err
  return false
})

const handleRetry = () => {
  error.value = null
  router.go(0)
}
</script>

<template>
  <RouteErrorView v-if="error" :error="error" @retry="handleRetry" />
  <slot v-else />
</template>
