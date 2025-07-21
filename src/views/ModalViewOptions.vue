<script lang="ts">
import { defineComponent } from 'vue'
import AboutView from '@/views/AboutView.vue'

export default defineComponent({
  name: 'ModalViewOptions',
  data: () => {
    return {

    }
  },
  methods: {
    showModal () {
      const modalInstance = this.$modal.open({
        key: '通过选项式API创建的窗体',
        title: '通过选项式API创建的窗体',
        body: AboutView,
        componentProps: {
          userName: '通过选项式API创建的窗体'
        },
        showMask: true,
        showHeader: true,
        onClose: () => modalInstance?.close()
      })
    }
  }
})
</script>

<template>
  <button @click="showModal">选项式弹出Modal</button>
</template>

<style scoped>

</style>