<template>
  <div class="about">
    <h1>This is an about page, 授权给 {{ userName }}</h1>
    {{ count }}
    <button @click="$emit('btnClick')">这个按钮事件是自定义的</button>
    <button @click="count++">这个按钮是写死的</button>
  </div>
</template>

<script setup lang="ts">
// 临时这样写, 实际像项目单独创建.ts文件或者在types下统一管理
export interface AboutViewExpose  {
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

// vue3 setup 需要显示的暴露给父组件访问的内容
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
