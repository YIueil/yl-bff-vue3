<script setup lang="ts">
export interface AboutContentExpose {
  count: number
  showModal: boolean
  getCount: () => number
  increment: () => void
}

defineProps({
  userName: {
    type: String,
    default: () => '未知用户'
  }
})
defineEmits(['btnClick'])

const count = ref(1)

defineExpose({
  count,
  increment() {
    count.value++
  },
  getCount() {
    return count.value
  }
})
</script>

<template>
  <div class="about">
    <h1>This is an about content, 授权给 {{ userName }}</h1>
    {{ count }}
    <button @click="$emit('btnClick')">这个按钮事件是自定义的</button>
    <button @click="count++">这个按钮是写死的</button>
  </div>
</template>
