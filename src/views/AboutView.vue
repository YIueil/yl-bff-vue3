<template>
  <div class="about">
    <h1>This is an about page, 授权给 {{ userName }}</h1>
    {{ count }}
    <button @click="$emit('btnClick')">这个按钮事件是自定义的</button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  userName: {
    type: String,
    default: () => '未知用户'
  }
})
defineEmits(['btnClick'])

const count = ref(1)
</script>
