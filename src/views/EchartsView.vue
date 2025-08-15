<template>
  <div class="echartsContainer" ref="echartsDom"></div>
</template>

<script setup lang="ts">
import echarts from '@/core/echarts-import'
import type { ECOption } from '@/core/echarts-import'
const echartsDom = ref<HTMLDivElement | null>()
const echartsInstance = ref()
// 等待dom加载完成后渲染
setTimeout(() => {
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

  // 基于准备好的dom，初始化echarts实例
  echartsInstance.value = echarts.init(echartsDom.value);
  // 绘制图表
  echartsInstance.value.setOption(option)
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
