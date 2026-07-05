<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
import type { ModalManagerInterface } from '@/types/components/modal'
import { Modal } from '@/utils/modal-manager'

const route = useRoute()
const router = useRouter()
const counterStore = useCounterStore()
const injectedModal = inject<ModalManagerInterface>('modal')
const componentInstance = getCurrentInstance()

const hasMainAppProvide = computed(() => injectedModal === Modal)
const hasGlobalProperty = computed(() => componentInstance?.proxy?.$modal === Modal)
</script>

<template>
  <div class="context-probe">
    <p>当前路由：{{ route.fullPath }}</p>
    <p>共享 Pinia count：{{ counterStore.count }}</p>
    <p>应用级 provide：{{ hasMainAppProvide ? '正常' : '缺失' }}</p>
    <p>全局属性 $modal：{{ hasGlobalProperty ? '正常' : '缺失' }}</p>
    <button @click="counterStore.increment()">在 Modal 内增加共享 count</button>
    <button @click="router.push('/about')">通过主 Router 前往 About</button>
  </div>
</template>

<style scoped>
.context-probe {
  display: grid;
  gap: 8px;
}

.context-probe p {
  margin: 0;
}
</style>
