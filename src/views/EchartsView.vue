<template>
  <div class="echartsContainer" ref="echartsDom"></div>
</template>

<script setup lang="ts">
import echarts from '@/core/echarts-import'
import type { ECOption } from '@/core/echarts-import'
import type { EChartsType } from 'echarts/core'

const echartsDom = ref<HTMLDivElement | null>(null)
const echartsInstance = shallowRef<EChartsType | null>(null)
let resizeObserver: ResizeObserver | null = null

const option: ECOption = {
  title: {
    text: 'ECharts 入门示例'
  },
  tooltip: {},
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
  },
  yAxis: {},
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
}

onMounted(() => {
  const container = echartsDom.value

  if (!container) {
    return
  }

  const instance = echarts.init(container)
  echartsInstance.value = instance
  instance.setOption(option)

  resizeObserver = new ResizeObserver(() => {
    echartsInstance.value?.resize()
  })
  resizeObserver.observe(container)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  echartsInstance.value?.dispose()
  echartsInstance.value = null
})
</script>

<style scoped>
.echartsContainer {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 400px;
}
</style>
